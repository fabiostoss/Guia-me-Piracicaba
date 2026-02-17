
import { NewsArticle } from '../types';

const NEWS_MOCK: NewsArticle[] = [
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

export const getLocalNews = (): NewsArticle[] => {
  // Retorna as notícias mockadas para Piracicaba, garantindo que o site funcione sem chamadas de API externas
  return NEWS_MOCK;
};
