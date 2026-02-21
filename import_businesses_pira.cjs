const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const slugify = require('slugify');
require('dotenv').config({ path: '.env.local' });

// ==================== CONFIGURAÇÕES ====================
let INPUT_FILE = (process.argv[2] || '').replace(/["]+/g, '') || path.join('C:', 'Users', 'User', 'Desktop', 'Guia-me', 'Links Comercios', 'resultado_lote_2026-02-20T02-32-29.txt');
const PROGRESS_FILE = path.join(__dirname, 'import_progress.json');
const PAUSE_FILE = path.join(__dirname, 'import_pause.signal');
const STOP_FILE = path.join(__dirname, 'import_stop.signal');
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
    'Restaurantes': 'Restaurantes',
    'Pizzarias': 'Restaurantes',
    'Lanchonetes': 'Restaurantes',
    'Gastronomia': 'Restaurantes',
    'Moda e Acessórios': 'Moda',
    'Moda': 'Moda',
    'Roupas': 'Moda',
    'Calçados': 'Moda',
    'Beleza e Estética': 'Saúde & Beleza',
    'Beleza': 'Saúde & Beleza',
    'Estética': 'Saúde & Beleza',
    'Cabelo': 'Saúde & Beleza',
    'Saúde': 'Saúde & Beleza',
    'Médicos': 'Saúde & Beleza',
    'Dentistas': 'Saúde & Beleza',
    'Farmácias': 'Saúde & Beleza',
    'Casa e Construção': 'Construção',
    'Construção': 'Construção',
    'Reforma': 'Construção',
    'Imobiliárias': 'Construção',
    'Móveis': 'Construção',
    'Automotivo': 'Automotivo',
    'Oficinas': 'Automotivo',
    'Peças': 'Automotivo',
    'Carros': 'Automotivo',
    'Pet': 'Pet Shop',
    'Pet Shop': 'Pet Shop',
    'Veterinários': 'Pet Shop',
    'Tecnologia': 'Eletrônicos',
    'Eletrônicos': 'Eletrônicos',
    'Informática': 'Eletrônicos',
    'Celulares': 'Eletrônicos',
    'Educação': 'Educação',
    'Escolas': 'Educação',
    'Cursos': 'Educação',
    'Serviços': 'Serviços',
    'Contabilidade': 'Serviços',
    'Advogados': 'Serviços',
    'Eventos e Lazer': 'Lazer',
    'Lazer': 'Lazer',
    'Turismo': 'Lazer',
    'Academias': 'Lazer',
    'Supermercados': 'Restaurantes',
    'Padarias': 'Restaurantes'
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
            // Suporta diferentes tipos de traços (-, –, —)
            const match = line.match(/^\s*\d+\.\s+([^(]+)\(([^)]+)\)\s+[\-\u2013\u2014]\s+(\d+)\s+links/);
            if (match) {
                categoryRanges.push({
                    name: match[1].trim(),
                    group: match[2].trim().replace(/\s+/g, ' '),
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
        // Tenta mapear o grupo, se não encontrar tenta o nome direto, se não deixa vazio
        const mappedCat = CATEGORY_MAP[cat.group] || CATEGORY_MAP[cat.name] || '';

        for (let i = 0; i < cat.count; i++) {
            if (links[linkPointer]) {
                links[linkPointer].category = mappedCat;
                links[linkPointer].segment = cat.name;
            }
            linkPointer++;
        }
    });

    // A inteligência de categoria foi movida para o loop principal para ser baseada no nome real extraído do Maps.
    console.log(`✅ Arquivo processado: ${links.length} links e ${categoryRanges.length} categorias identificadas.`);
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

        // --- LÓGICA DE ROLAGEM E EXPANSÃO ---
        try {
            await page.evaluate(async () => {
                const sidePanel = document.querySelector('div[role="main"]')?.parentElement ||
                    document.querySelector('.m6QErb[aria-label]') ||
                    document.querySelector('div[role="main"]');

                if (sidePanel) {
                    for (let i = 0; i < 8; i++) {
                        sidePanel.scrollBy(0, 600);
                        await new Promise(r => setTimeout(r, 500));
                    }
                }

                // Procurar especificamente pelo ID do Google para o bloco de horários
                const hourRow = document.querySelector('button[data-item-id="oh"]') ||
                    document.querySelector('div[data-item-id="oh"]');

                if (hourRow) {
                    hourRow.scrollIntoView();
                    hourRow.click();
                    return;
                }

                // Tentar clicar no botão de horários (Dropdown)
                const buttons = Array.from(document.querySelectorAll('button, div[role="button"], .Oq977d'));
                const hourBtn = buttons.find(b => {
                    const txt = (b.innerText || b.getAttribute('aria-label') || '').toLowerCase();
                    // Deve conter 'horário' mas NÃO 'pico', 'movimentado' ou 'gráfico'
                    return (txt.includes('horário') || txt.includes('hours') || txt.includes('aberto') || txt.includes('fecha')) &&
                        !txt.includes('remover') && !txt.includes('sugerir') &&
                        !txt.includes('pico') && !txt.includes('popular') && !txt.includes('gráfico');
                });

                if (hourBtn) {
                    hourBtn.scrollIntoView();
                    hourBtn.click();
                }
            });
            await new Promise(r => setTimeout(r, 3500)); // Tempo extra para carregar a tabela
        } catch (e) { }

        return await page.evaluate((link) => {
            const clean = (t) => t ? t.trim().replace(/\s+/g, ' ') : '';

            // Tentar múltiplos seletores para o nome, garantindo que pegamos o título real
            const nameEl = document.querySelector('h1.DUwDvf') ||
                document.querySelector('h1') ||
                document.querySelector('.x7609e');

            let name = clean(nameEl?.textContent);

            // Se o nome vier como termos genéricos, é que o seletor falhou ou a página não carregou o título
            const invalidNames = ['Horários', 'Avaliações', 'Google Maps', 'Maps'];
            if (!name || invalidNames.some(inv => name.includes(inv))) {
                const altName = document.querySelector('meta[property="og:title"]');
                if (altName) {
                    const metaTitle = altName.content.split(' · ')[0];
                    if (!invalidNames.some(inv => metaTitle.includes(inv))) {
                        name = clean(metaTitle);
                    } else {
                        name = ''; // Forçar erro de extração para este link
                    }
                }
            }

            const addrEl = document.querySelector('button[data-item-id="address"] .Io6YTe') ||
                document.querySelector('div.R6B9Yd');
            const phoneEl = document.querySelector('button[data-item-id^="phone"] .Io6YTe');
            const ratingEl = document.querySelector('div.F7nice span[aria-hidden="true"]');
            const reviewsEl = document.querySelector('div.F7nice span:nth-child(2) span span');

            // Horários - Localizar a tabela ou div de horários (Lógica baseada no Extrator de Links)
            let scheduleText = '';

            // 1. Tentar ler tabela visível (método mais confiável do Extrator)
            const table = document.querySelector('table tbody');
            if (table) {
                const rows = Array.from(table.rows);
                const hoursList = rows.map(r => {
                    const dia = r.cells[0]?.textContent.trim();
                    const hora = r.cells[1]?.textContent.trim().replace(/\u202f/g, ' ');
                    if (dia && hora) return `${dia}: ${hora}`;
                    return null;
                }).filter(Boolean);
                if (hoursList.length > 0) scheduleText = hoursList.join(' | ');
            }

            // 2. Fallback: aria-label do botão de horário (método do Extrator)
            if (!scheduleText) {
                const ohBtn = document.querySelector('[data-item-id="oh"]');
                if (ohBtn) {
                    const al = ohBtn.getAttribute('aria-label');
                    if (al && al.includes(':')) {
                        // Limpa o texto do aria-label pegando apenas a parte dos horários
                        scheduleText = al.replace(/^.*?:\s*/, '').replace(/\. /g, ' | ').replace(/Ocultar.*$/, '').trim();
                    }
                }
            }

            // 3. Fallback extra: div com horários
            if (!scheduleText) {
                const hourItems = document.querySelectorAll('.y076mc');
                if (hourItems.length > 0) {
                    scheduleText = Array.from(hourItems)
                        .map(el => el.innerText.replace('\n', ': '))
                        .join(' | ');
                }
            }

            // Verificar se o formato extraído é válido (evitar horários de pico)
            const isWeeklyFormat = (txt) => {
                const days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom', 'fechado', 'aberto'];
                const low = (txt || '').toLowerCase();
                return days.some(d => low.includes(d)) && !low.includes('pico') && !low.includes('movimentado');
            };

            if (scheduleText && !isWeeklyFormat(scheduleText)) {
                scheduleText = 'Horário não informado';
            }

            // --- NOVO: Extrair Serviços (Delivery, Retirada, 24h) ---
            const allText = document.body.innerText.toLowerCase();
            const hasDelivery = allText.includes('entrega sem contato') || allText.includes('delivery') || allText.includes('entrega');
            const hasPickup = allText.includes('retirada na porta') || allText.includes('retirada') || allText.includes('takeaway');
            const is24h = allText.includes('aberto 24 horas') || allText.includes('open 24 hours') || allText.includes('24h');

            // Tentar extrair CEP do endereço
            const cepMatch = (addrEl?.textContent || '').match(/\d{5}-\d{3}/) || (addrEl?.textContent || '').match(/\d{8}/);
            const cep = cepMatch ? cepMatch[0] : '';

            // Coordenadas - Lógica robusta usando a URL atual e meta tags
            let lat = null, lng = null;
            const currentUrl = window.location.href;

            // Tentar extrair da URL atual (formato @lat,lng)
            const urlMatch = currentUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (urlMatch) {
                lat = parseFloat(urlMatch[1]);
                lng = parseFloat(urlMatch[2]);
            }
            // Tentar extrair do parâmetro data (formato !3dlat!4dlng)
            else {
                const dataMatch = currentUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
                if (dataMatch) {
                    lat = parseFloat(dataMatch[1]);
                    lng = parseFloat(dataMatch[2]);
                }
            }

            // Fallback: Tentar extrair de meta tags (og:image costuma ter a posição no mapa estático)
            if (!lat || !lng) {
                const metaImg = document.querySelector('meta[property="og:image"]') ||
                    document.querySelector('meta[itemprop="image"]');
                if (metaImg && metaImg.content) {
                    const metaMatch = metaImg.content.match(/center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/) ||
                        metaImg.content.match(/center=(-?\d+\.\d+),(-?\d+\.\d+)/);
                    if (metaMatch) {
                        lat = parseFloat(metaMatch[1]);
                        lng = parseFloat(metaMatch[2]);
                    }
                }
            }

            return {
                name: name,
                address: clean(addrEl?.textContent),
                cep: cep,
                phone: clean(phoneEl?.textContent),
                rating: parseFloat(ratingEl?.textContent.replace(',', '.')) || 0,
                reviewsCount: parseInt(reviewsEl?.textContent.replace(/\D/g, '')) || 0,
                businessHours: scheduleText,
                latitude: lat,
                longitude: lng,
                hasDelivery: hasDelivery,
                hasPickup: hasPickup,
                is24h: is24h
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

    // Deletar sinais antigos ao iniciar
    if (fs.existsSync(PAUSE_FILE)) fs.unlinkSync(PAUSE_FILE);
    if (fs.existsSync(STOP_FILE)) fs.unlinkSync(STOP_FILE);

    console.log(`TOTAL_LINKS:${links.length}`);
    const processedCount = Object.keys(progress.processedIds).length;
    console.log(`PROCESSED_LINKS:${processedCount}`);

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=pt-BR']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    let currentIdx = 0;
    let duplicateCount = 0;
    for (const item of links) {
        currentIdx++;

        // Verificar sinal de Parar
        if (fs.existsSync(STOP_FILE)) {
            console.log('STOP_RECEIVED');
            break;
        }

        // Verificar sinal de Pausar
        while (fs.existsSync(PAUSE_FILE)) {
            console.log('PAUSE_ACTIVE');
            await new Promise(r => setTimeout(r, 2000));
            if (fs.existsSync(STOP_FILE)) break;
        }

        if (progress.processedIds[item.id]) {
            continue;
        }

        console.log(`PROGRESS:${currentIdx}/${links.length}`);

        // --- NOVO: Verificação de Duplicidade no Banco ---
        const { data: existing, error: checkError } = await supabase
            .from('businesses')
            .select('id, name')
            .or(`google_maps_link.eq.${item.url}`)
            .limit(1)
            .maybeSingle();

        if (existing) {
            duplicateCount++;
            console.log(`DUPLICATE_COUNT:${duplicateCount}`);
            console.log(`LOG:⏩ Pulando DUPLICIDADE: "${existing.name}" já cadastrado.`);
            progress.processedIds[item.id] = true;
            saveProgress(progress);
            continue;
        }

        const extracted = await extractBusinessInfo(page, item.url);

        if (!extracted || !extracted.name) {
            console.log(`LOG:⚠️ Pulando ${item.id} por erro na extração.`);
            continue;
        }

        // Verificar duplicidade novamente com o nome extraído (se nome for válido)
        if (extracted.name && extracted.name !== 'Horários' && extracted.name !== 'Avaliações') {
            const { data: existingName } = await supabase
                .from('businesses')
                .select('id')
                .eq('name', extracted.name)
                .limit(1)
                .maybeSingle();

            if (existingName) {
                duplicateCount++;
                console.log(`DUPLICATE_COUNT:${duplicateCount}`);
                console.log(`LOG:⏩ Pulando DUPLICIDADE (nome): "${extracted.name}" já existe.`);
                progress.processedIds[item.id] = true;
                saveProgress(progress);
                continue;
            }
        }

        // --- INTELIGÊNCIA DE CATEGORIA (SEO/Keywords) ---
        if (!item.category) {
            const name = (extracted.name || '').toLowerCase();
            const combined = `${name} ${item.url.toLowerCase()}`;

            if (combined.includes('restaurante') || combined.includes('pizzaria') || combined.includes('hamburgueria') ||
                combined.includes('lanche') || combined.includes('gourmet') || combined.includes('comida') ||
                combined.includes('bistrô') || combined.includes('yakisoba') || combined.includes('churrascaria') ||
                combined.includes('bar') || combined.includes('cozinha') || combined.includes('gastronomia') || combined.includes('espetinho')) {
                item.category = 'Restaurantes';
            } else if (combined.includes('celular') || combined.includes('eletrônico') || combined.includes('informática') ||
                combined.includes('computador') || combined.includes('phone') || combined.includes('tecnologia')) {
                item.category = 'Eletrônicos';
            } else if (combined.includes('roupa') || combined.includes('moda') || combined.includes('calçado') ||
                combined.includes('boutique') || combined.includes('vestuário') || combined.includes('sapato')) {
                item.category = 'Moda';
            } else if (combined.includes('beleza') || combined.includes('estética') || combined.includes('cabelo') ||
                combined.includes('salão') || combined.includes('barbearia') || combined.includes('unha') ||
                combined.includes('sobrancelha')) {
                item.category = 'Saúde & Beleza';
            } else if (combined.includes('construção') || combined.includes('reforma') || combined.includes('tintas') ||
                combined.includes('material') || combined.includes('ferragens') || combined.includes('marcenaria')) {
                item.category = 'Construção';
            } else if (combined.includes('carro') || combined.includes('oficina') || combined.includes('mecanica') ||
                combined.includes('pneu') || combined.includes('auto') || combined.includes('veículo') ||
                combined.includes('motocicleta') || combined.includes('moto')) {
                item.category = 'Automotivo';
            } else if (combined.includes('pet') || combined.includes('veterinário') || combined.includes('animal') ||
                combined.includes('ração') || combined.includes('cachorro') || combined.includes('gato')) {
                item.category = 'Pet Shop';
            }
        }

        console.log(`LOG:🔄 Cadastrando: ${extracted.name}...`);

        // Gerar Username baseado nas iniciais + ID
        const initials = extracted.name
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => word[0].toLowerCase())
            .join('')
            .substring(0, 5);
        const username = `${initials}-${item.id}`;

        // Gerar Senha Segura
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

        // Formatar endereço - Lógica robusta para Piracicaba
        let street = '';
        let number = '';
        let neighborhood = 'Piracicaba';

        if (extracted.address) {
            const parts = extracted.address.split(',').map(p => p.trim());
            street = parts[0] || '';

            // Localizar Piracicaba no array para se orientar
            const piraIdx = parts.findIndex(p => p.toLowerCase().includes('piracicaba'));

            if (piraIdx > 0) {
                const info = parts[piraIdx - 1];
                // Regex para capturar padrões como "700 - Bairro" ou "700-Bairro" com qualquer tipo de traço
                const dashRegex = /\s*[\-\u2013\u2014]\s*/;
                if (dashRegex.test(info)) {
                    const subParts = info.split(dashRegex);
                    if (subParts.length >= 2) {
                        number = subParts[0].trim();
                        neighborhood = subParts[1].trim();
                    } else {
                        neighborhood = info;
                    }
                } else if (info.match(/^\d+$/)) {
                    number = info;
                    neighborhood = parts[piraIdx - 2] || 'Piracicaba';
                } else {
                    neighborhood = info;
                }
            } else if (parts.length >= 2) {
                neighborhood = parts[1];
            }

            // Limpeza Final: O bairro NUNCA deve começar com "Número - "
            const doubleCheckRegex = /^(\d+)\s*[\-\u2013\u2014]\s*(.+)$/;
            const match = neighborhood.match(doubleCheckRegex);
            if (match) {
                if (!number) number = match[1];
                neighborhood = match[2];
            }

            // Limpeza extra para a rua
            if (!number && street.includes(',')) {
                const streetParts = street.split(',');
                street = streetParts[0].trim();
                number = streetParts[1].trim();
            }
        }

        const businessData = {
            id: require('crypto').randomUUID(),
            code: code,
            name: extracted.name,
            username: username,
            description: '', // Deixar em branco conforme solicitado
            category: item.category || '',
            segment: item.segment || '',
            address: extracted.address,
            street: street,
            number: number,
            neighborhood: neighborhood || 'Piracicaba',
            cep: extracted.cep || extracted.address.match(/\d{5}-\d{3}/)?.[0] || '',
            phone: extracted.phone,
            password: password,
            image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800',
            logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200',
            is_active: true,
            is_open: true,
            is_official: false,
            is_sponsor: false,
            offers_delivery: extracted.hasDelivery || false,
            offers_pickup: extracted.hasPickup || false,
            is_24h: extracted.is24h || false,
            business_hours: extracted.businessHours || 'Horário não informado',
            schedule: {},
            rating: extracted.rating,
            reviews_count: extracted.reviewsCount,
            google_maps_link: item.url,
            latitude: extracted.latitude,
            longitude: extracted.longitude,
            views: 0
        };

        const { error } = await supabase.from('businesses').insert([businessData]);

        if (error) {
            console.log(`LOG:❌ Erro Supabase em ${extracted.name}: ${error.message}`);
            if (error.code === '23505') {
                progress.processedIds[item.id] = true;
                saveProgress(progress);
            }
        } else {
            console.log(`LOG:✨ Sucesso: ${extracted.name} cadastrado!`);
            progress.processedIds[item.id] = true;
            saveProgress(progress);
        }

        // Delay para evitar bloqueios
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('DONE');
    await browser.close();
})();
