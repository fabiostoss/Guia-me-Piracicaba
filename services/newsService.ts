
import { NewsArticle } from '../types';

export const NEWS_MOCK: NewsArticle[] = [
  {
    id: 'pira-news-1',
    title: 'XV de Piracicaba inicia preparação para a próxima rodada do Paulistão',
    summary: 'O Alvinegro Piracicabano foca nos treinamentos táticos no Barão da Serra Negra visando manter a liderança do grupo.',
    date: 'Hoje',
    url: 'https://www.jornaldepiracicaba.com.br/',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'pira-news-2',
    title: 'Prefeitura anuncia revitalização da Rua do Porto e novos projetos turísticos',
    summary: 'O plano inclui melhorias na iluminação, pavimentação e ampliação do calçadão próximo aos restaurantes de peixe.',
    date: 'Ontem',
    url: 'http://www.piracicaba.sp.gov.br/',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'pira-news-3',
    title: 'Festival Gastronômico de Piracicaba começa nesta sexta-feira com pratos típicos',
    summary: 'Evento reúne mais de 30 estabelecimentos locais celebrando a culinária tradicional da região da Noiva da Colina.',
    date: '2 dias atrás',
    url: 'https://www.piracicaba.com.br/',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'pira-news-4',
    title: 'Inauguração de novo centro tecnológico impulsiona empregos em Piracicaba',
    summary: 'Parque Tecnológico recebe nova multinacional focada em soluções para o agronegócio e inovação sustentável.',
    date: '3 dias atrás',
    url: 'http://www.agropolo.com.br/',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop'
  }
];

const RSS_URL = 'https://g1.globo.com/dynamo/sp/piracicaba-regiao/rss2.xml';
const RSS_JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

export const getLocalNews = async (): Promise<NewsArticle[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
    const response = await fetch(`${RSS_JSON_API}${encodeURIComponent(RSS_URL)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.status === 'ok' && data.items && Array.isArray(data.items) && data.items.length > 0) {
      return data.items.map((item: any, index: number) => ({
        id: `g1-${index}`,
        title: item.title,
        summary: item.description ? item.description.replace(/<[^>]*>/g, '').slice(0, 150) + '...' : 'Clique para ler a matéria completa.',
        date: new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        url: item.link,
        imageUrl: item.thumbnail || item.enclosure?.link || 'https://s2.glbimg.com/QF8xL4vJ8j8j8j8j8j8j/top/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2025/x/y/z/default.jpg' // Placeholder if no image
      }));
    }
    throw new Error('RSS empty or failed');
  } catch (error) {
    console.warn('Error fetching G1 news, falling back to mock:', error);
    return NEWS_MOCK;
  }
};
