
import { TouristSpot, TouristEvent } from '../types';

export const TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'spot-1',
    name: 'Parque da Rua do Porto',
    description: 'Possui bares, restaurantes, artesanatos e muita história da cidade, à beira do famoso rio de Piracicaba. O coração gastronômico e cultural de Pira.',
    category: 'Gastronomia',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Rio_Piracicaba_e_Engenho_Central.jpg/1200px-Rio_Piracicaba_e_Engenho_Central.jpg',
    address: 'Rua do Porto, Centro, Piracicaba - SP'
  },
  {
    id: 'spot-2',
    name: 'Aquário Municipal de Piracicaba',
    description: 'Muito bem mantido, muitas espécies de peixes e bela vista do Rio. Os tanques permitem ver de perto os gigantes dourados e pintados.',
    category: 'Lazer',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Aquario-Municipal.jpg',
    address: 'Av. Dr. Maurice Allain, s/n, Vila Rezende, Piracicaba - SP'
  },
  {
    id: 'spot-3',
    name: 'Alto Do Mirante',
    description: 'Toda a vista dos mirantes da cidade e de dentro do parque é incrível, permitindo contemplar o Rio Piracicaba de cima.',
    category: 'Lazer',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Mirante-1.jpg',
    address: 'Ponte Caio Tabajara, Piracicaba - SP'
  },
  {
    id: 'spot-4',
    name: 'Museu da Água',
    description: 'Localizado às margens do Rio, onde funcionou a primeira estação de captação da cidade. Arquitetura histórica e educativa.',
    category: 'História',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Museu-da-Agua.jpg',
    address: 'Av. Beira Rio, 448, Centro, Piracicaba - SP'
  },
  {
    id: 'spot-5',
    name: 'Capela de Nossa Senhora dos Prazeres',
    description: 'Localizada no Largo dos Pescadores, sua fachada histórica é um dos marcos mais antigos e icônicos da fé piracicabana.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Capela-Nossa-Senhora-dos-Prazeres.jpg',
    address: 'Largo dos Pescadores, Piracicaba - SP'
  },
  {
    id: 'spot-6',
    name: 'Campus da ESALQ (USP)',
    description: 'O campus da ESALQ é um verdadeiro parque aberto. Qualquer pessoa pode acessar e desfrutar das belas paisagens, museu e arquitetura.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/ESALQ.jpg',
    address: 'Av. Pádua Dias, 11, Piracicaba - SP'
  },
  {
    id: 'spot-7',
    name: 'Zoológico Municipal de Piracicaba',
    description: 'Passeio gratuito e ideal para famílias. Conta com diversos animais e um parquinho excelente para crianças.',
    category: 'Parque',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Zoologico.jpg',
    address: 'Av. Mal. Castelo Branco, s/n, Jardim Primavera, Piracicaba - SP'
  },
  {
    id: 'spot-8',
    name: 'Capela Monte Alegre',
    description: 'Decorada pelo pintor Alfredo Volpi, é uma das igrejas mais belas e preservadas da região, em um bairro charmoso.',
    category: 'História',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Capela-Monte-Alegre.jpg',
    address: 'Via Comendador Pedro Morganti, s/n, Monte Alegre, Piracicaba - SP'
  },
  {
    id: 'spot-9',
    name: 'Centro Cultural Martha Watts',
    description: 'Local de pesquisa e arte no coração da cidade. Preserva a história da educação em Piracicaba.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Martha-Watts.jpg',
    address: 'Rua Boa Morte, 1257, Centro, Piracicaba - SP'
  },
  {
    id: 'spot-10',
    name: 'Igreja Senhor Bom Jesus do Monte',
    description: 'A famosa igreja do Largo Bom Jesus, no bairro Alto. Arquitetura imponente que domina a praça central.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Igreja-Bom-Jesus.jpg',
    address: 'Praça José Bonifácio, Centro, Piracicaba - SP'
  },
  {
    id: 'spot-11',
    name: 'Dama Bier (Fábrica e Bar)',
    description: 'Cervejaria artesanal local. Oferece visitas aos tonéis e um bar de degustação com atendimento excepcional.',
    category: 'Gastronomia',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Cervejaria.jpg',
    address: 'Av. Rio das Pedras, 104, Piracicaba - SP'
  },
  {
    id: 'spot-12',
    name: 'Cachaça Piracicabana',
    description: 'Tradição secular em destilados. O licor de cachaça e a clássica pinga piracicabana são imperdíveis.',
    category: 'Gastronomia',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Cachaca.jpg',
    address: 'Av. Alidor Pecorari, 1500, Piracicaba - SP'
  },
  {
    id: 'spot-13',
    name: 'Bairro Santa Olímpia',
    description: 'Um pedaço do Tirol em Piracicaba. Colônia trentina com culinária típica e festas tradicionais.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Santa-Olimpia.jpg',
    address: 'Bairro Santa Olímpia, Piracicaba - SP'
  },
  {
    id: 'spot-14',
    name: 'Pinacoteca Municipal Miguel Dutra',
    description: 'Acervo artístico permanente e exposições temporárias. Localizada próxima ao rio, oferece arte e belas vistas.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Pinacoteca.jpg',
    address: 'Rua Moraes Barros, 233, Centro, Piracicaba - SP'
  },
  {
    id: 'spot-15',
    name: 'Museu Prudente de Moraes',
    description: 'Residência do primeiro presidente civil do Brasil. Um mergulho na história política e social do país.',
    category: 'História',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Museu_Prudente_de_Moraes_-_Piracicaba.jpg/1200px-Museu_Prudente_de_Moraes_-_Piracicaba.jpg',
    address: 'Rua Santo Antônio, 641, Centro, Piracicaba - SP'
  },
  {
    id: 'spot-16',
    name: 'Vinícola Alma Da Videira',
    description: 'Localizada no bairro de Santana, oferece degustação de vinhos artesanais em um ambiente familiar e acolhedor.',
    category: 'Gastronomia',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Vinicola.jpg',
    address: 'Rua Pinheiros, s/n, Santana, Piracicaba - SP'
  },
  {
    id: 'spot-17',
    name: 'Teatro SESC - Piracicaba',
    description: 'Auditório moderno e confortável. Programação cultural intensa com shows, peças e oficinas.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/SESC.jpg',
    address: 'Rua Ipiranga, 155, Centro, Piracicaba - SP'
  },
  {
    id: 'spot-18',
    name: 'ECPA (Esporte Clube Piracicabano de Automobilismo)',
    description: 'Adrenalina garantida em pistas de kart e autódromo profissional. Local de grandes eventos automobilísticos.',
    category: 'Lazer',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/ECPA.jpg',
    address: 'Rodovia SP-135, Km 13,5, Piracicaba - SP'
  },
  {
    id: 'spot-19',
    name: 'Tanquã - Minipantanal Paulista',
    description: 'Paraíso para observadores de aves e amantes da natureza. Passeios de barco revelam a biodiversidade local.',
    category: 'Lazer',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Tanqua.jpg',
    address: 'Tanquã, Piracicaba - SP'
  },
  {
    id: 'spot-20',
    name: 'Teatro do Engenho Erotides de Campos',
    description: 'Um palácio de artes dentro de um antigo engenho. Arquitetura industrial preservada à beira do Rio.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Teatro-do-Engenho.jpg',
    address: 'Av. Maurice Allain, 454, Piracicaba - SP'
  },
  {
    id: 'spot-21',
    name: 'Igreja Sagrado Coração de Jesus (Igreja dos Frades)',
    description: 'Conhecida pela sua tradição e beleza interior. Um ponto de paz e reflexão frequentado há gerações.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Igreja-dos-Frades.jpg',
    address: 'Rua São Francisco de Assis, Piracicaba - SP'
  },
  {
    id: 'spot-22',
    name: 'Estádio Barão de Serra Negra',
    description: 'A casa do XV de Piracicaba. Palco de emoções do futebol paulista e símbolo do orgulho caipira.',
    category: 'Lazer',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Estadio.jpg',
    address: 'Av. Independência, s/n, Piracicaba - SP'
  },
  {
    id: 'spot-23',
    name: 'Praça José Bonifácio',
    description: 'O coração pulsante do centro de Piracicaba. Charmosa, arborizada e repleta de vida cotidiana.',
    category: 'Parque',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Praca-Jose-Bonifacio.jpg',
    address: 'Centro, Piracicaba - SP'
  },
  {
    id: 'spot-24',
    name: 'Teatro São José',
    description: 'Teatro histórico que foi um marco cultural na cidade. Estilo clássico e ambiente acolhedor.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Teatro-Sao-Jose.jpg',
    address: 'Rua São José, Piracicaba - SP'
  },
  {
    id: 'spot-25',
    name: 'Ponte Pênsil',
    description: 'Ligação icônica entre as margens do rio. Travessia obrigatória para quem quer sentir a energia das águas.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Ponte-Pensil.jpg',
    address: 'Rio Piracicaba, Piracicaba - SP'
  },
  {
    id: 'spot-26',
    name: 'Salão Internacional de Humor de Piracicaba',
    description: 'Um dos eventos mais importantes do mundo na área. Acervo permanente de caricaturas e cartuns.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Salao-do-Humor.jpg',
    address: 'Engenho Central, Piracicaba - SP'
  },
  {
    id: 'spot-27',
    name: 'Teatro Unimep',
    description: 'Espaço acadêmico e cultural com excelente acústica. Recebe grandes espetáculos nacionais.',
    category: 'Cultura',
    imageUrl: 'https://unimep.edu.br/wp-content/uploads/2021/05/teatro-unimep-scaled.jpg',
    address: 'Rodovia do Açúcar, Km 156, Piracicaba - SP'
  },
  {
    id: 'spot-28',
    name: 'Engenho Central',
    description: 'O maior complexo cultural da cidade. Espaço para lazer, museus e grandes festas populares.',
    category: 'História',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Engenho-Central.jpg',
    address: 'Vila Rezende, Piracicaba - SP'
  },
  {
    id: 'spot-29',
    name: 'Vale das Águas Thermas Parque',
    description: 'Diversão aquática para toda a família com piscinas termais e toboáguas emocionantes.',
    category: 'Lazer',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Vale-das-Aguas.jpg',
    address: 'Rodovia SP-304, Km 189, Piracicaba - SP'
  },
  {
    id: 'spot-30',
    name: 'Biblioteca Municipal Ricardo Ferraz de Arruda P.',
    description: 'Prédio moderno e acolhedor, ideal para leitura, pesquisa e eventos culturais literários.',
    category: 'Cultura',
    imageUrl: 'https://piracicaba.sp.gov.br/wp-content/uploads/2023/05/Biblioteca-Municipal.jpg',
    address: 'Rua Saldanha Marinho, 333, Piracicaba - SP'
  }
];

const MOCK_EVENTS: TouristEvent[] = [
  {
    id: '2026-01-11',
    title: 'MovimentAr – Férias na Praça',
    date: '11/01/2026',
    dateIso: '2026-01-11',
    location: 'Praça José Bonifácio',
    description: 'Atividades culturais, esportivas e recreativas ao ar livre, incluindo dança, yoga e vivências gratuitas.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-01-17',
    title: 'Festival Caipira de Circo 2026',
    date: '17 a 25/01/2026',
    dateIso: '2026-01-17',
    location: 'Engenho Central',
    description: 'Espetáculos circenses, exposições, caricaturas e atrações para todas as idades (gratuito).',
    imageUrl: '',
    type: 'Festival'
  },
  {
    id: '2026-01-30',
    title: 'Grito de Carnaval',
    date: '30/01/2026',
    dateIso: '2026-01-30',
    location: 'Engenho Central',
    description: 'Abertura oficial do Carnaval de Piracicaba, com música ao vivo e animação.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-01-31',
    title: 'Bloco da Salomé',
    date: '31/01/2026',
    dateIso: '2026-01-31',
    location: 'Praça da Rua dos Cravos – Nova Piracicaba',
    description: 'Desfile de bloco carnavalesco com concentração na praça.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-01',
    title: 'Bloco do Peixe Frito',
    date: '01/02/2026',
    dateIso: '2026-02-01',
    location: 'Praça da Boyes',
    description: 'Cortejo carnavalesco do bloco com concentração na praça.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-06-1',
    title: 'Carnaval Inclusivo',
    date: '06/02/2026',
    dateIso: '2026-02-06',
    location: 'Engenho Central',
    description: 'Evento cultural e inclusivo com atividades diversificadas.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-06-2',
    title: 'Carnaval das Marchinhas',
    date: '06/02/2026',
    dateIso: '2026-02-06',
    location: 'Largo dos Pescadores',
    description: 'Bloco estático com marchinhas tradicionais.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-07-1',
    title: 'Bloco da Green',
    date: '07/02/2026',
    dateIso: '2026-02-07',
    location: 'Centro',
    description: 'Concentração cultural com música e desfile no centro.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-07-2',
    title: 'Bloco Vila África Kilombo',
    date: '07/02/2026',
    dateIso: '2026-02-07',
    location: 'Centro Histórico',
    description: 'Cortejo com manifestações culturais afro-centradas.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-07-3',
    title: 'Carna Forró',
    date: '07/02/2026',
    dateIso: '2026-02-07',
    location: 'Engenho Central à Casa do Povoador',
    description: 'Festa com ritmo forró em cortejo.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-08',
    title: 'Maracatu Baque Caipira',
    date: '08/02/2026',
    dateIso: '2026-02-08',
    location: 'Centro Histórico',
    description: 'Cortejo de maracatu com ritmos afro-brasileiros e concentrações no centro histórico.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-13',
    title: 'Bloco do Bagaço',
    date: '13/02/2026',
    dateIso: '2026-02-13',
    location: 'Engenho Central',
    description: 'Bloco estático com música e diversão no Engenho Central.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-14',
    title: 'Carnaval de Blocos (Vários)',
    date: '14/02/2026',
    dateIso: '2026-02-14',
    location: 'Diversos Locais',
    description: 'Inclui Amigos da Banda, Saputeda Mete Marcha, Cordão Mestre Ambrósio, Amigos da Rua do Porto e Unidos de Santa Olímpia.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-15-1',
    title: 'Jazz Band na Rua do Porto',
    date: '15/02/2026',
    dateIso: '2026-02-15',
    location: 'Rua do Porto',
    description: 'Apresentação gratuita de jazz ao ar livre, com artistas locais.',
    imageUrl: '',
    type: 'Show'
  },
  {
    id: '2026-02-15-2',
    title: 'Bloquinho do Primo Luiz',
    date: '15/02/2026',
    dateIso: '2026-02-15',
    location: 'Centro',
    description: 'Passeio cultural com música e interação comunitária.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-15-3',
    title: 'Bloco Afropira',
    date: '15/02/2026',
    dateIso: '2026-02-15',
    location: 'Centro',
    description: 'Celebração de ritmos afro-brasileiros com música e performances.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-15-4',
    title: 'Bloco Pira Pirou',
    date: '15/02/2026',
    dateIso: '2026-02-15',
    location: 'Itinerante',
    description: 'Bloco carnavalesco itinerante com muita folia.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-16-1',
    title: 'Bloco dos Boçais',
    date: '16/02/2026',
    dateIso: '2026-02-16',
    location: 'Estático',
    description: 'Apresentação de bloco com marchinhas e cultura popular.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-16-2',
    title: 'Bloco do Amor',
    date: '16/02/2026',
    dateIso: '2026-02-16',
    location: 'Itinerante',
    description: 'Passeio festivo à tarde com música e celebração.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-17-1',
    title: 'Matinê no Engenho',
    date: '17/02/2026',
    dateIso: '2026-02-17',
    location: 'Engenho Central',
    description: 'Festa de encerramento do Carnaval com música e animação.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-02-17-2',
    title: 'Bloco da Ema',
    date: '17/02/2026',
    dateIso: '2026-02-17',
    location: 'Centro',
    description: 'Desfile de bloco para fechar a programação carnavalesca.',
    imageUrl: '',
    type: 'Cultural'
  },
  {
    id: '2026-03-13-1',
    title: 'Candlelight: Os Clássicos do Rock',
    date: '13/03/2026',
    dateIso: '2026-03-13',
    location: 'Catedral Santo Antônio',
    description: 'Concerto musical à luz de velas com repertório de rock clássico.',
    imageUrl: '',
    type: 'Show'
  },
  {
    id: '2026-03-13-2',
    title: 'Candlelight: Coldplay vs. Imagine Dragons',
    date: '13/03/2026',
    dateIso: '2026-03-13',
    location: 'Catedral Santo Antônio',
    description: 'Sessão do concerto temático à luz de velas com sucessos de bandas modernas.',
    imageUrl: '',
    type: 'Show'
  },
  {
    id: '2026-05-13',
    title: 'Festa das Nações de Piracicaba',
    date: '13 a 17/05/2026',
    dateIso: '2026-05-13',
    location: 'Engenho Central',
    description: 'Evento multicultural com gastronomia de diversos países, shows e apresentações artísticas.',
    imageUrl: '',
    type: 'Festival'
  }
];

export const fetchLiveEventsFromWeb = async (): Promise<{ events: TouristEvent[], sources: any[] }> => {
  // Simula um delay de rede para manter a experiência de usuário
  await new Promise(resolve => setTimeout(resolve, 800));
  return { events: MOCK_EVENTS, sources: [] };
};
