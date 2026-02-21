const express = require('express');
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(express.static(path.join(__dirname, 'public_import')));
app.use(express.json());

const PAUSE_FILE = path.join(__dirname, 'import_pause.signal');
const STOP_FILE = path.join(__dirname, 'import_stop.signal');

let currentProc = null;
let isRunning = false;

app.post('/start', (req, res) => {
    if (isRunning) return res.status(400).json({ error: 'Já está rodando' });

    const { filePath } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    isRunning = true;
    if (fs.existsSync(STOP_FILE)) fs.unlinkSync(STOP_FILE);
    if (fs.existsSync(PAUSE_FILE)) fs.unlinkSync(PAUSE_FILE);

    const args = ['import_businesses_pira.cjs'];
    if (filePath) args.push(filePath);

    currentProc = spawn('node', args, { cwd: __dirname });

    currentProc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line.startsWith('TOTAL_LINKS:')) {
                res.write(`data: ${JSON.stringify({ type: 'total', value: line.split(':')[1] })}\n\n`);
            } else if (line.startsWith('PROCESSED_LINKS:')) {
                res.write(`data: ${JSON.stringify({ type: 'processed', value: line.split(':')[1] })}\n\n`);
            } else if (line.startsWith('DUPLICATE_COUNT:')) {
                res.write(`data: ${JSON.stringify({ type: 'duplicate', value: line.split(':')[1] })}\n\n`);
            } else if (line.startsWith('PROGRESS:')) {
                const parts = line.split(':')[1].split('/');
                res.write(`data: ${JSON.stringify({ type: 'progress', current: parts[0], total: parts[1] })}\n\n`);
            } else if (line.startsWith('LOG:')) {
                res.write(`data: ${JSON.stringify({ type: 'log', message: line.substring(4) })}\n\n`);
            } else if (line === 'DONE') {
                res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
            }
        }
    });

    currentProc.on('close', () => {
        isRunning = false;
        currentProc = null;
        res.write(`data: ${JSON.stringify({ type: 'closed' })}\n\n`);
        res.end();
    });
});

app.post('/pause', (req, res) => {
    if (fs.existsSync(PAUSE_FILE)) {
        fs.unlinkSync(PAUSE_FILE);
        res.json({ status: 'resumed' });
    } else {
        fs.writeFileSync(PAUSE_FILE, 'pause');
        res.json({ status: 'paused' });
    }
});

app.post('/stop', (req, res) => {
    fs.writeFileSync(STOP_FILE, 'stop');
    if (currentProc) {
        // O script verá o sinal de STOP e fechará graciosamente
        // Mas vamos forçar se demorar muito
        setTimeout(() => {
            if (currentProc) currentProc.kill();
        }, 5000);
    }
    res.json({ ok: true });
});

app.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log(`Gerenciador de Importação rodando em ${url}`);

    // Comando para abrir no Windows
    exec(`start ${url}`);
});
