const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const slugify = require('slugify');
require('dotenv').config({ path: '.env.local' });

// ==================== CONFIGURAÇÕES ====================
const INPUT_FILE = path.join('C:', 'Users', 'User', 'Desktop', 'Guia-me', 'Links Comercios', 'resultado_lote_2026-02-20T02-32-29.txt');
const PROGRESS_FILE = path.join(__dirname, 'import_progress.json');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Erro: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados no .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mapeamento de Categorias do TXT para o Sistema Guia-me
const CATEGORY_MAP = {
    'Alimentação': 'Restaurantes',
    'Moda e Acessórios': 'Moda',
    'Beleza e Estética': 'Saúde & Beleza',
    'Saúde': 'Saúde & Beleza',
    'Casa e Construção': 'Construção',
    'Automotivo': 'Automotivo',
    'Pet': 'Pet Shop',
    'Tecnologia': 'Eletrônicos',
    'Educação': 'Educação',
    'Serviços': 'Serviços',
    'Eventos e Lazer': 'Lazer'
};

// ==================== FUNÇÕES AUXILIARES ====================

function parseInputFile() {
    console.log('📖 Lendo arquivo de links...');
    const content = fs.readFileSync(INPUT_FILE, 'utf8');
    const lines = content.split('\n');

    const categoryRanges = [];
    const links = [];

    // 1. Parsear Categorias e Quantidades
    let parsingCategories = false;
    for (const line of lines) {
        if (line.includes('CATEGORIAS PROCESSADAS:')) {
            parsingCategories = true;
            continue;
        }
        if (parsingCategories && line.startsWith('---')) {
            parsingCategories = false;
            continue;
        }

        if (parsingCategories) {
            // Ex: 01. Restaurantes (Alimentação) — 117 links adicionados
            const match = line.match(/^\s*\d+\.\s+([^(]+)\(([^)]+)\)\s+—\s+(\d+)\s+links/);
            if (match) {
                categoryRanges.push({
                    name: match[1].trim(),
                    group: match[2].trim(),
                    count: parseInt(match[3])
                });
            }
        }
    }

    // 2. Parsear Links
    let currentLink = null;
    let linkId = null;
    for (const line of lines) {
        if (line.match(/^\d{4}\./)) {
            linkId = line.match(/^(\d{4})\./)[1];
        } else if (line.trim().startsWith('https://www.google.com/maps/place/')) {
            links.push({
                id: linkId,
                url: line.trim()
            });
        }
    }

    // 3. Atribuir Categorias aos Links com base nos intervalos
    let linkPointer = 0;
    categoryRanges.forEach(cat => {
        const mappedCat = CATEGORY_MAP[cat.group] || 'Lojas';
        for (let i = 0; i < cat.count; i++) {
            if (links[linkPointer]) {
                links[linkPointer].category = mappedCat;
                links[linkPointer].segment = cat.name;
            }
            linkPointer++;
        }
    });

    return links;
}

function loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
        return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return { processedIds: {} };
}

function saveProgress(progress) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function extractBusinessInfo(page, link) {
    try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(r => setTimeout(r, 4000));

        return await page.evaluate((link) => {
            const clean = (t) => t ? t.trim().replace(/\s+/g, ' ') : '';

            const nameEl = document.querySelector('h1');
            const addrEl = document.querySelector('button[data-item-id="address"] .Io6YTe');
            const phoneEl = document.querySelector('button[data-item-id^="phone"] .Io6YTe');
            const ratingEl = document.querySelector('div.F7nice span[aria-hidden="true"]');
            const reviewsEl = document.querySelector('div.F7nice span:nth-child(2) span span');

            // Horários
            let scheduleText = '';
            const table = document.querySelector('table tbody');
            if (table) {
                scheduleText = Array.from(table.rows)
                    .map(r => `${r.cells[0]?.textContent.trim()}: ${r.cells[1]?.textContent.trim()}`)
                    .join(' | ');
            }

            // Coordenadas do URL (mais preciso que tentar achar no DOM as vezes)
            const coordsMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            const lat = coordsMatch ? parseFloat(coordsMatch[1]) : null;
            const lng = coordsMatch ? parseFloat(coordsMatch[2]) : null;

            return {
                name: clean(nameEl?.textContent),
                address: clean(addrEl?.textContent),
                phone: clean(phoneEl?.textContent),
                rating: parseFloat(ratingEl?.textContent.replace(',', '.')) || 0,
                reviewsCount: parseInt(reviewsEl?.textContent.replace(/\D/g, '')) || 0,
                businessHours: scheduleText,
                latitude: lat,
                longitude: lng
            };
        }, link);
    } catch (e) {
        console.error(`⚠️ Erro ao extrair ${link}: ${e.message}`);
        return null;
    }
}

// ==================== MAIN ====================

(async () => {
    const links = parseInputFile();
    const progress = loadProgress();

    console.log(`🚀 Iniciando importação. Total de links: ${links.length}`);
    console.log(`✅ Já processados: ${Object.keys(progress.processedIds).length}`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pt-BR']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    for (const item of links) {
        if (progress.processedIds[item.id]) continue;

        console.log(`\n🔄 Processando [${item.id}] - ${item.url.substring(0, 60)}...`);

        const extracted = await extractBusinessInfo(page, item.url);

        if (!extracted || !extracted.name) {
            console.log(`⏩ Pulando ${item.id} por erro na extração.`);
            continue;
        }

        // Gerar Username baseado nas iniciais + ID
        const initials = extracted.name
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => word[0].toLowerCase())
            .join('')
            .substring(0, 5); // Limitar tamanho das iniciais
        const username = `${initials}-${item.id}`;

        // Gerar Senha Segura (8 caracteres: letras, números e especiais)
        const generateSecurePassword = () => {
            const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
            let retVal = "";
            for (let i = 0, n = charset.length; i < 8; ++i) {
                retVal += charset.charAt(Math.floor(Math.random() * n));
            }
            return retVal;
        };
        const password = generateSecurePassword();

        const code = `PIRA-${item.id}`;

        // Formatar endereço
        const addrParts = extracted.address.split(',');
        const street = addrParts[0] || '';
        const neighborhood = addrParts[addrParts.length - 2]?.trim() || '';

        const businessData = {
            id: require('crypto').randomUUID(),
            code: code,
            name: extracted.name,
            username: username,
            description: `${extracted.name} é um estabelecimento localizado em Piracicaba, oferecendo o melhor no segmento de ${item.segment}.`,
            category: item.category,
            segment: item.segment,
            address: extracted.address,
            street: street,
            number: '', // Extração de número é imprecisa, fica no endereço completo
            neighborhood: neighborhood || 'Piracicaba',
            cep: extracted.address.match(/\d{5}-\d{3}/)?.[0] || '',
            phone: extracted.phone,
            password: password,
            image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
            logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
            is_active: true,
            is_open: true,
            is_official: false,
            is_sponsor: false,
            business_hours: extracted.businessHours || 'Horário não informado',
            schedule: {}, // Seria necessário um parser mais complexo para o JSON do seu sistema
            rating: extracted.rating,
            reviews_count: extracted.reviewsCount,
            google_maps_link: item.url,
            latitude: extracted.latitude,
            longitude: extracted.longitude,
            views: 0
        };

        const { error } = await supabase.from('businesses').insert([businessData]);

        if (error) {
            console.error(`❌ Erro Supabase: ${error.message}`);
            if (error.code === '23505') { // Unique violation
                console.log('💡 Item já existe no banco, marcando como processado.');
                progress.processedIds[item.id] = true;
                saveProgress(progress);
            }
        } else {
            console.log(`✨ Sucesso: ${extracted.name} cadastrado!`);
            progress.processedIds[item.id] = true;
            saveProgress(progress);
        }

        // Delay para evitar bloqueios
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n🏁 Fim da importação!');
    await browser.close();
})();
