
import { Business, CategoryType } from '../types';
import { getDefaultSchedule, formatScheduleSummary } from '../utils/businessUtils';

const schedule1 = getDefaultSchedule();
schedule1[0] = { enabled: true, open: '18:00', close: '23:30' }; // Dom
schedule1[6] = { enabled: true, open: '18:00', close: '23:30' }; // Sáb

const schedule2 = getDefaultSchedule();
for (let i = 0; i < 7; i++) schedule2[i] = { enabled: true, open: '00:00', close: '23:59' };

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: '1',
    code: 'PIRA-0001',
    name: 'Pira Burguer Gourmet',
    username: 'piraburguer',
    description: 'Os melhores hambúrgueres artesanais feitos com carinho no coração de Piracicaba.',
    category: CategoryType.RESTAURANTES,
    street: 'Avenida Independência',
    number: '1200',
    neighborhood: 'Bairro Alto',
    cep: '13419-160',
    address: 'Avenida Independência, 1200 - Bairro Alto, Piracicaba, SP',
    phone: '5519988887777',
    password: '123',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop',
    logoUrl: 'https://picsum.photos/seed/burguer/200/200',
    schedule: schedule1,
    isActive: true,
    businessHours: formatScheduleSummary(schedule1),
    offersDelivery: true,
    offersPickup: true,
    createdAt: Date.now(),
    views: 142
  },
  {
    id: '2',
    code: 'PIRA-0002',
    name: 'Farmácia Central Pira',
    username: 'farmacentral',
    description: 'Atendimento humanizado e variedade em medicamentos e perfumaria.',
    category: CategoryType.FARMACIAS,
    street: 'Rua Governador Pedro de Toledo',
    number: '850',
    neighborhood: 'Centro',
    cep: '13400-060',
    address: 'Rua Governador Pedro de Toledo, 850 - Centro, Piracicaba, SP',
    phone: '5519977776666',
    password: '123',
    imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=2079&auto=format&fit=crop',
    logoUrl: 'https://picsum.photos/seed/pharma/200/200',
    schedule: schedule2,
    isActive: true,
    businessHours: formatScheduleSummary(schedule2),
    offersDelivery: true,
    offersPickup: false,
    createdAt: Date.now() - 100000,
    views: 89
  }
];
