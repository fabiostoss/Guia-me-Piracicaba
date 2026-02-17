
import { JobVacancy } from '../types';

const MOCK_JOBS: JobVacancy[] = [
  {
    id: 'job-1',
    role: 'Ajudante Geral',
    company: 'Indústria Metalúrgica Local',
    requirements: 'Ensino médio completo, disponibilidade de horário.',
    type: 'Efetivo',
    salary: 'R$ 1.850,00',
    postedAt: 'Hoje',
    location: 'Distrito Industrial Unileste'
  },
  {
    id: 'job-2',
    role: 'Vendedor(a) de Loja',
    company: 'Comércio de Calçados',
    requirements: 'Experiência em vendas, boa comunicação.',
    type: 'Efetivo',
    salary: 'Piso + Comissão',
    postedAt: 'Hoje',
    location: 'Centro'
  },
  {
    id: 'job-3',
    role: 'Operador de Caixa',
    company: 'Supermercado Regional',
    requirements: 'Disponibilidade para trabalhar em escala 6x1.',
    type: 'Efetivo',
    postedAt: 'Ontem',
    location: 'Vila Rezende'
  },
  {
    id: 'job-4',
    role: 'Estagiário de Administração',
    company: 'Escritório de Contabilidade',
    requirements: 'Cursando a partir do 3º semestre.',
    type: 'Estágio',
    salary: 'Bolsa Auxílio R$ 1.100,00',
    postedAt: 'Ontem',
    location: 'Bairro Alto'
  },
  {
    id: 'job-5',
    role: 'Cozinheiro(a)',
    company: 'Restaurante Rua do Porto',
    requirements: 'Experiência comprovada em pratos de peixe.',
    type: 'Efetivo',
    postedAt: '2 dias atrás',
    location: 'Rua do Porto'
  },
  {
    id: 'job-6',
    role: 'Auxiliar de Limpeza',
    company: 'Empresa de Serviços',
    requirements: 'Ensino fundamental completo.',
    type: 'Efetivo',
    postedAt: '3 dias atrás',
    location: 'Vila Sônia'
  }
];

export const getLatestJobs = (): JobVacancy[] => {
  return MOCK_JOBS;
};

export const OFFICIAL_JOBS_URL = "https://piracicaba.sp.gov.br/servicos/painel-de-vagas/";
