
export enum CategoryType {
  RESTAURANTES = 'Restaurantes',
  MERCADOS = 'Mercados',
  FARMACIAS = 'Farmácias',
  LOJAS = 'Lojas',
  SERVICOS = 'Serviços',
  IMOVEIS = 'Imóveis',
  AUTOMOTIVO = 'Automotivo',
  MODA = 'Moda',
  PET_SHOP = 'Pet Shop',
  SAUDE_BELEZA = 'Saúde & Beleza',
  ACADEMIAS = 'Academias',
  ELETRONICOS = 'Eletrônicos',
  CASA_DECORACAO = 'Casa & Decoração',
  LAZER = 'Lazer',
  SUPLEMENTOS = 'Suplementos',
  INFANTIL = 'Infantil',
  EDUCACAO = 'Educação',
  CONSTRUCAO = 'Construção',
  EVENTOS = 'Eventos',
  OFICIAIS = 'Destaques Piracicaba'
}

export interface DaySchedule {
  enabled: boolean;
  open: string;
  close: string;
}

export type WeekSchedule = Record<number, DaySchedule>;

export interface Business {
  id: string;
  code: string;
  name: string;
  username: string;
  description: string;
  category: CategoryType;
  segment?: string;
  address: string;
  street: string;
  number: string;
  neighborhood: string;
  cep: string;
  phone: string;
  password?: string;
  imageUrl: string;
  logoUrl: string;
  isOpen?: boolean;
  isActive: boolean;
  rating?: number;
  reviewsCount?: number;
  googleMapsLink?: string;
  schedule: WeekSchedule;
  businessHours: string;
  offersDelivery: boolean;
  offersPickup: boolean;
  createdAt: number;
  views: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  neighborhood: string;
  createdAt: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  imageUrl: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: string;
  feelsLike: number;
  sourceUrl?: string;
}

export interface TouristSpot {
  id: string;
  name: string;
  description: string;
  category: 'Parque' | 'Cultura' | 'História' | 'Lazer';
  imageUrl: string;
  address: string;
}

export interface TouristEvent {
  id: string;
  title: string;
  date: string;
  dateIso: string;
  location: string;
  description: string;
  imageUrl: string;
  type: 'Festival' | 'Exposição' | 'Show' | 'Esporte' | 'Cultural';
}

export interface JobVacancy {
  id: string;
  role: string;
  company: string;
  requirements: string;
  type: 'Efetivo' | 'Estágio' | 'Temporário' | 'PCD';
  salary?: string;
  postedAt: string;
  location: string;
}
