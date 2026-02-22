
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Business, CategoryType, Customer } from '../types';
import { ICONS, PIRACICABA_NEIGHBORHOODS, BUSINESS_SPECIALTIES } from '../constants';
import NeighborhoodSelector from '../components/NeighborhoodSelector';
import { isBusinessOpen, getDefaultSchedule, formatScheduleSummary } from '../utils/businessUtils';
import * as db from '../services/databaseService';
import { useUI } from '../components/CustomUI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminProps {
  businesses: Business[];
  customers: Customer[];
  onAdd: (biz: Business) => void;
  onUpdate: (biz: Business) => void;
  onDelete: (id: string) => void;
  onBulkUpdate: (ids: string[], changes: Partial<Business>) => void;
  onBulkDelete: (ids: string[]) => void;
  onMassExtraction: (category: CategoryType, updateProgress: (msg: string) => void) => Promise<void>;
}

const DAYS_NAME = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Admin: React.FC<AdminProps> = ({ businesses, customers, onAdd, onUpdate, onDelete, onBulkUpdate, onBulkDelete, onMassExtraction }) => {
  const navigate = useNavigate();
  const { showNotification, showConfirm } = useUI();
  const [adminView, setAdminView] = useState<'dashboard' | 'management' | 'customers' | 'approvals'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [draftChanges, setDraftChanges] = useState<Record<string, Partial<Business>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMsg, setExtractionMsg] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Novos estados para filtros de coluna
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterNeighborhood, setFilterNeighborhood] = useState<string>('all');
  const [filterSponsor, setFilterSponsor] = useState<string>('all');
  const [sortViews, setSortViews] = useState<'desc' | 'asc' | 'none'>('none');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Inicializa o formulário com dados vazios
  const emptyFormData: Partial<Business> = {
    name: '',
    username: '',
    description: '',
    category: CategoryType.RESTAURANTES,
    street: '',
    number: '',
    neighborhood: '',
    cep: '',
    phone: '+55',
    password: '',
    imageUrl: '',
    logoUrl: '',
    schedule: getDefaultSchedule(),
    offersDelivery: true,
    offersPickup: true,
    isActive: true,
    isOfficial: false,
    isSponsor: false,
    views: 0
  };

  const [formData, setFormData] = useState<Partial<Business>>(emptyFormData);

  const stats = useMemo(() => {
    const totalViews = businesses.reduce((acc, b) => acc + (b.views || 0), 0);
    const activeCount = businesses.filter(b => b.isActive).length;
    const topRanking = [...businesses].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);

    const categoryDataMap: Record<string, number> = {};
    businesses.forEach(b => {
      categoryDataMap[b.category] = (categoryDataMap[b.category] || 0) + 1;
    });

    const categoryChartData = Object.entries(categoryDataMap).map(([name, value]) => ({ name, value }));
    const rankingChartData = topRanking.map(b => ({ name: b.name.substring(0, 15), views: b.views || 0 }));

    console.log('Admin Dashboard Stats:', { totalViews, activeCount, categoryChartData, rankingChartData });

    return { totalViews, activeCount, topRanking, categoryChartData, rankingChartData };
  }, [businesses]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('pt-BR');

    // Header
    doc.setFillColor(20, 184, 166); // brand-teal
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Administrativo - Guia-me Piracicaba', 15, 25);

    doc.setFontSize(10);
    doc.text(`Gerado em: ${now}`, 160, 35);

    // Stats Summary
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFontSize(16);
    doc.text('Sumário de Performance', 15, 55);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const summaryData = [
      ['Total de Visualizações', stats.totalViews.toString()],
      ['Empresas Cadastradas', businesses.length.toString()],
      ['Empresas Ativas', stats.activeCount.toString()],
      ['Base de Clientes', customers.length.toString()],
    ];

    autoTable(doc, {
      startY: 65,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [20, 184, 166] }
    });

    // Top Businesses Table
    doc.text('Top 10 Empresas mais Acessadas', 15, (doc as any).lastAutoTable.finalY + 20);

    const businessTable = stats.topRanking.map((b, i) => [
      (i + 1).toString(),
      b.name,
      b.category,
      b.views.toString()
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [['#', 'Empresa', 'Categoria', 'Acessos']],
      body: businessTable,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] } // slate-900
    });

    doc.save(`relatorio-guiame-piracicaba-${now.replace(/\//g, '-')}.pdf`);
  };

  const handleLogout = async () => {
    localStorage.removeItem('pira_admin_auth');
    await db.clearAdminSession();
    navigate('/admin-login');
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) {
      val = val.slice(0, 5) + '-' + val.slice(5);
    }
    setFormData(prev => ({ ...prev, cep: val }));

    if (val.length === 9) {
      updateGpsByCep(val);
    }
  };

  const updateGpsByCep = async (cep: string) => {
    setIsGeocoding(true);
    try {
      const query = encodeURIComponent(`CEP ${cep} Piracicaba Brazil`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { 'User-Agent': 'Guia-me-Piracicaba/1.0' }
      });

      if (!response.ok) {
        throw new Error('Falha na requisição');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }));
        showNotification('Coordenadas encontradas com sucesso!', 'success');
      } else {
        const responseFall = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${cep}&country=Brazil&limit=1`, {
          headers: { 'User-Agent': 'Guia-me-Piracicaba/1.0' }
        });
        const dataFall = await responseFall.json();
        if (dataFall && dataFall.length > 0) {
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(dataFall[0].lat),
            longitude: parseFloat(dataFall[0].lon)
          }));
          showNotification('Coordenadas encontradas com sucesso!', 'success');
        } else {
          showNotification('Não foi possível encontrar as coordenadas para este CEP. Verifique se o CEP está correto ou tente buscar pelo endereço completo.', 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      showNotification('Não foi possível conectar ao serviço de mapas. Tente novamente em alguns segundos ou use a busca por endereço completo.', 'error');
    } finally {
      setIsGeocoding(false);
    }
  };

  const updateGpsByAddress = async () => {
    if (!formData.street || !formData.number) {
      showNotification('Por favor, preencha a rua e o número primeiro.', 'warning');
      return;
    }

    setIsGeocoding(true);
    const searchStrategies = [
      // 0. Endereço com CEP (Mais preciso)
      `${formData.street}, ${formData.number}, Piracicaba, SP, ${formData.cep || ''}, Brasil`,
      // 1. Endereço completo sem CEP
      `${formData.street}, ${formData.number}, ${formData.neighborhood || ''}, Piracicaba, SP, Brasil`,
      // 2. Sem o bairro (às vezes o bairro no OSM está diferente)
      `${formData.street}, ${formData.number}, Piracicaba, SP, Brasil`,
      // 3. Apenas o nome do estabelecimento (útil para lugares grandes como Atacadão)
      `${formData.name}, Piracicaba, SP, Brasil`
    ];

    try {
      let found = false;
      for (const query of searchStrategies) {
        if (found) break;

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await response.json();

        if (data && data.length > 0) {
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon)
          }));
          found = true;
          if (query.includes(formData.name) && !query.includes(formData.street)) {
            showNotification('Localizamos pelo nome do estabelecimento!', 'success');
          }
        }
      }

      if (!found) {
        showNotification('Não foi possível encontrar automaticamente. Você pode digitar as coordenadas manuais ou pesquisar no Google Maps e colar os números aqui.', 'info');
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      showNotification('Erro ao conectar com o serviço de localização.', 'error');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Abre o modal de edição com clonagem segura para garantir que o formulário receba os dados
  const openEditModal = (biz: Business) => {
    const bizToEdit = { ...biz };
    setEditingBiz(bizToEdit);
    setFormData({
      ...bizToEdit,
      street: bizToEdit.street || bizToEdit.address.split(',')[0] || '',
      number: bizToEdit.number || bizToEdit.address.split(',')[1]?.split('-')[0]?.trim() || '',
      isOfficial: !!bizToEdit.isOfficial,
      isSponsor: !!bizToEdit.isSponsor
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingBiz(null);
    setFormData({ ...emptyFormData });
    setIsModalOpen(true);
  };

  const handleDayToggle = (dayIndex: number) => {
    setFormData(prev => {
      const newSchedule = { ...(prev.schedule || getDefaultSchedule()) };
      newSchedule[dayIndex] = { ...newSchedule[dayIndex], enabled: !newSchedule[dayIndex].enabled };
      return { ...prev, schedule: newSchedule };
    });
  };

  const handleTimeChange = (dayIndex: number, field: 'open' | 'close', value: string) => {
    setFormData(prev => {
      const newSchedule = { ...(prev.schedule || getDefaultSchedule()) };
      newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
      return { ...prev, schedule: newSchedule };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de abreviações
    const street = (formData.street || '').trim();
    if (street.match(/^(R\.|Av\.|Rod\.|Pç\.|Lgo\.)\s/i) || street.match(/\s(R\.|Av\.|Rod\.|Pç\.|Lgo\.)\s/i)) {
      showNotification('Por favor, não use abreviações como "R." ou "Av.". Escreva o nome por extenso (Rua, Avenida, etc).', 'warning');
      return;
    }

    // Validação de CEP
    if (!formData.cep || !formData.cep.match(/^\d{5}-\d{3}$/)) {
      showNotification('Por favor, insira um CEP válido no formato 00000-000.', 'warning');
      return;
    }

    const finalSchedule = formData.schedule || getDefaultSchedule();
    const fullAddress = `${formData.street}, ${formData.number}${formData.neighborhood ? ` - ${formData.neighborhood}` : ''}, Piracicaba, SP - CEP ${formData.cep}`;

    const bizData = {
      ...formData,
      isOfficial: !!formData.isOfficial,
      isSponsor: !!formData.isSponsor,
      address: fullAddress,
      schedule: finalSchedule,
      businessHours: formatScheduleSummary(finalSchedule),
    } as Business;

    if (editingBiz) {
      onUpdate({ ...editingBiz, ...bizData, id: editingBiz.id });
    } else {
      const newBiz = {
        ...bizData,
        id: crypto.randomUUID(),
        code: `PIRA-${(businesses.length + 1).toString().padStart(4, '0')}`,
        createdAt: Date.now(),
        isActive: true,
        views: 0
      } as Business;
      onAdd(newBiz);
    }
    setIsModalOpen(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+55')) val = '+55' + val.replace(/\D/g, '');
    else val = '+55' + val.slice(3).replace(/\D/g, '');
    setFormData({ ...formData, phone: val });
  };

  const handleToggleStatus = async (biz: Business) => {
    const updatedBiz = { ...biz, isActive: !biz.isActive };
    await onUpdate(updatedBiz);
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      const entries = Object.entries(draftChanges);
      console.log(`Iniciando sincronização de ${entries.length} alterações...`);

      // Executa as atualizações em sequência para garantir a integridade
      for (const [id, changes] of entries) {
        const original = businesses.find(b => String(b.id) === String(id));
        if (original) {
          // Garante que estamos enviando o objeto completo para o onUpdate
          const updatedBusiness = { ...original, ...changes } as Business;
          await onUpdate(updatedBusiness);
        }
      }

      setDraftChanges({});
      showNotification('Sincronização concluída! Todas as alterações estão salvas no servidor.', 'success');
    } catch (error) {
      console.error('Erro crítico na sincronização:', error);
      showNotification('Erro ao sincronizar. Algumas alterações podem não ter sido salvas.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const filteredBusinesses = useMemo(() => {
    setCurrentPage(1); // Reset page on filter change
    let result = businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesTab =
        activeTab === 'all' ? true :
          activeTab === 'active' ? b.isActive === true :
            b.isActive === false;

      const matchesCategory = filterCategory === 'all' ? true : b.category === filterCategory;
      const matchesNeighborhood = filterNeighborhood === 'all' ? true : b.neighborhood === filterNeighborhood;
      const matchesSponsor = filterSponsor === 'all' ? true :
        (filterSponsor === 'sponsor' ? b.isSponsor === true : b.isSponsor === false);

      return matchesSearch && matchesTab && matchesCategory && matchesNeighborhood && matchesSponsor;
    });

    if (sortViews !== 'none') {
      result = [...result].sort((a, b) => {
        const vA = a.views || 0;
        const vB = b.views || 0;
        return sortViews === 'desc' ? vB - vA : vA - vB;
      });
    }

    return result;
  }, [businesses, searchTerm, activeTab, filterCategory, filterNeighborhood, filterSponsor, sortViews]);

  const paginatedBusinesses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBusinesses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBusinesses, currentPage]);

  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-100/80 -mt-20 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h1 className="text-4xl font-black text-brand-teal-deep tracking-tighter mb-4">Painel de Controle</h1>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setAdminView('dashboard')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${adminView === 'dashboard' ? 'bg-brand-teal text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>Visão Geral</button>
              <button onClick={() => setAdminView('management')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${adminView === 'management' ? 'bg-brand-teal text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>Lojistas</button>
              <button onClick={() => setAdminView('approvals')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all relative ${adminView === 'approvals' ? 'bg-brand-teal text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                Aprovar Lojas
                {businesses.filter(b => b.isActive === false).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">
                    {businesses.filter(b => b.isActive === false).length}
                  </span>
                )}
              </button>
              <button onClick={() => setAdminView('customers')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${adminView === 'customers' ? 'bg-brand-teal text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>Clientes</button>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-orange hover:bg-brand-orange/5 transition-all"
            >
              <ICONS.X size={14} /> Sair do Painel
            </button>
            <button onClick={openAddModal} className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <ICONS.Plus size={16} /> Novo Comércio
            </button>
          </div>
        </div>

        {adminView === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <ICONS.Eye size={64} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Acessos Totais</p>
                <h3 className="text-4xl font-black relative z-10">{stats.totalViews}</h3>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                  <ICONS.Plus size={10} /> 12% este mês
                </div>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <ICONS.Package size={64} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Empresas Ativas</p>
                <h3 className="text-4xl font-black text-brand-teal relative z-10">{stats.activeCount}</h3>
                <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase">de {businesses.length} cadastradas</p>
              </div>
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                  <ICONS.UserCheck size={64} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Clientes</p>
                <h3 className="text-4xl font-black text-brand-orange relative z-10">{customers.length}</h3>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                  <ICONS.Plus size={10} /> Novos Leads
                </div>
              </div>
              <div className="bg-brand-teal p-8 rounded-[2.5rem] text-white shadow-2xl shadow-brand-teal/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal-deep mb-2">Taxa de Conversão</p>
                <h3 className="text-4xl font-black">{(customers.length > 0 && stats.totalViews > 0 ? (customers.length / stats.totalViews * 100).toFixed(1) : 0)}%</h3>
                <button
                  onClick={exportToPDF}
                  className="mt-6 w-full bg-brand-teal-deep/20 hover:bg-brand-teal-deep/40 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <ICONS.ArrowRight size={14} /> Exportar Relatório PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Category Distribution Chart */}
              <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-[400px] md:h-[500px]">
                <div className="mb-8">
                  <h4 className="text-sm font-black text-brand-teal-deep uppercase tracking-widest">Distribuição por Categoria</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Presença de mercado local</p>
                </div>
                <div className="flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#14b8a6', '#f97316', '#0f172a', '#64748b', '#2dd4bf'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontVariant: 'small-caps', fontWeight: 'bold' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Ranking Chart */}
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-[400px] md:h-[500px]">
                <div className="mb-8 flex justify-between items-end">
                  <div>
                    <h4 className="text-sm font-black text-brand-teal-deep uppercase tracking-widest">Top Performance (Ranking de Acessos)</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Lojas mais visitadas na plataforma</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <ICONS.Filter size={12} /> Últimos 30 dias
                  </div>
                </div>
                <div className="flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.rankingChartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 9, fontWeight: 800, fill: '#64748b' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#cbd5e1' }} />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="views" radius={[6, 6, 0, 0]} barSize={32}>
                        {stats.rankingChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#14b8a6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Ranking Table */}
            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-10 border-b border-slate-50">
                <h4 className="text-sm font-black text-brand-teal-deep uppercase tracking-widest">Ranking Detalhado das 10 Maiores</h4>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ranking</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loja</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualizações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.topRanking.map((biz, idx) => (
                    <tr key={biz.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-10 py-6">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' :
                          idx === 1 ? 'bg-slate-200 text-slate-600' :
                            idx === 2 ? 'bg-brand-teal/20 text-brand-teal' :
                              'bg-slate-50 text-slate-400'
                          }`}>
                          {idx + 1}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={biz.logoUrl} className="w-10 h-10 rounded-xl object-cover" />
                          <span className="font-black text-slate-700 text-sm">{biz.name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-bold text-slate-400 text-xs uppercase tracking-widest">{biz.category}</td>
                      <td className="px-10 py-6">
                        <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-xs">{biz.views}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminView === 'management' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-grow flex items-center relative">
                <ICONS.Search className="absolute left-6 text-slate-400" size={18} />
                <input
                  placeholder="Pesquisar loja..."
                  className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-200 focus:border-brand-teal outline-none font-bold"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  className="px-6 py-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 outline-none focus:border-brand-teal cursor-pointer"
                  onChange={async (e) => {
                    const cat = e.target.value as CategoryType;
                    if (!cat) return;

                    setIsExtracting(true);
                    setExtractionMsg('Iniciando extração mágica...');
                    await onMassExtraction(cat, setExtractionMsg);
                    setTimeout(() => {
                      setIsExtracting(false);
                      setExtractionMsg('');
                    }, 5000);
                  }}
                  disabled={isExtracting}
                >
                  <option value="">✨ IA: Extrair Leads...</option>
                  {Object.values(CategoryType).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setEditingBiz(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-brand-teal text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-brand-teal/20 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center gap-2 whitespace-nowrap"
                >
                  <ICONS.Plus size={18} /> Nova Loja
                </button>
              </div>
            </div>

            {isExtracting && (
              <div className="bg-brand-teal-deep text-white p-6 rounded-3xl shadow-xl animate-pulse flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                <div>
                  <h5 className="font-black uppercase tracking-widest text-[10px] opacity-70">Agente de IA em Ação</h5>
                  <p className="text-sm font-bold">{extractionMsg}</p>
                </div>
              </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="bg-brand-teal-deep text-white p-4 md:p-6 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 mb-6 sticky top-4 z-40 border border-white/10 backdrop-blur-md bg-brand-teal-deep/90">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <span className="text-xl font-black">{selectedIds.length}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest">Itens Selecionados</h4>
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Aplique ações em massa para os itens marcados</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onBulkUpdate(selectedIds, { isSponsor: true });
                      setSelectedIds([]);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-brand-orange text-white border border-white/10 transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <ICONS.Star size={14} /> Patrocinador
                  </button>
                  <button
                    onClick={() => {
                      onBulkUpdate(selectedIds, { isSponsor: false });
                      setSelectedIds([]);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-slate-700 text-white border border-white/10 transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <ICONS.X size={14} /> Remover Patrocínio
                  </button>
                  <div className="w-px h-8 bg-white/10 mx-1 hidden md:block"></div>
                  <button
                    onClick={() => {
                      onBulkUpdate(selectedIds, { isActive: true });
                      setSelectedIds([]);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-white border border-emerald-500/30 transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <ICONS.CheckCircle size={14} /> Colocar No Ar
                  </button>
                  <button
                    onClick={() => {
                      onBulkUpdate(selectedIds, { isActive: false });
                      setSelectedIds([]);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-brand-orange/20 hover:bg-brand-orange text-white border border-brand-orange/30 transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <ICONS.Clock size={14} /> Pausar
                  </button>
                  <button
                    onClick={() => {
                      showConfirm({
                        title: 'Excluir em Massa',
                        message: `Tem certeza que deseja excluir ${selectedIds.length} comércios selecionados? Esta ação é irreversível.`,
                        type: 'danger',
                        confirmLabel: 'Excluir Selecionados',
                        onConfirm: () => {
                          onBulkDelete(selectedIds);
                          setSelectedIds([]);
                        }
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-white border border-red-500/30 transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                  >
                    <ICONS.Trash2 size={14} /> Excluir
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-6 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
                        checked={selectedIds.length === filteredBusinesses.length && filteredBusinesses.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(filteredBusinesses.map(b => String(b.id)));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação da Loja</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex flex-col gap-2">
                        <span>Categoria / Bairro</span>
                        <div className="flex gap-2">
                          <select
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[8px] font-black text-brand-teal lowercase outline-none focus:border-brand-teal transition-all max-w-[100px]"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                          >
                            <option value="all">Ver Todas Categorias</option>
                            {Object.values(CategoryType).sort().map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <select
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[8px] font-black text-brand-orange lowercase outline-none focus:border-brand-orange transition-all max-w-[100px]"
                            value={filterNeighborhood}
                            onChange={(e) => setFilterNeighborhood(e.target.value)}
                          >
                            <option value="all">Ver Todos Bairros</option>
                            {PIRACICABA_NEIGHBORHOODS.sort().map(neigh => (
                              <option key={neigh} value={neigh}>{neigh}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </th>

                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span>Acessos</span>
                        <button
                          onClick={() => setSortViews(prev => prev === 'desc' ? 'asc' : prev === 'asc' ? 'none' : 'desc')}
                          className={`p-1 rounded bg-slate-100 hover:bg-slate-200 transition-all ${sortViews !== 'none' ? 'text-brand-teal' : 'text-slate-400'}`}
                        >
                          {sortViews === 'desc' ? <ICONS.ArrowDown size={12} /> : sortViews === 'asc' ? <ICONS.ArrowUp size={12} /> : <ICONS.Filter size={12} />}
                        </button>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span>Destaque</span>
                        <select
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[8px] font-black text-brand-orange lowercase outline-none focus:border-brand-orange transition-all"
                          value={filterSponsor}
                          onChange={(e) => setFilterSponsor(e.target.value)}
                        >
                          <option value="all">Todos</option>
                          <option value="sponsor">Sim</option>
                          <option value="no-sponsor">Não</option>
                        </select>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedBusinesses.map(biz => {
                    const draft = draftChanges[biz.id] || {};
                    const isCurrentActive = draft.isActive !== undefined ? draft.isActive : biz.isActive;
                    const currentViews = draft.views !== undefined ? draft.views : (biz.views || 0);
                    const currentName = draft.name !== undefined ? draft.name : biz.name;
                    const currentCategory = (draft.category !== undefined ? draft.category : biz.category) as CategoryType;
                    const currentNeighborhood = draft.neighborhood !== undefined ? draft.neighborhood : biz.neighborhood;
                    const currentPhone = draft.phone !== undefined ? draft.phone : biz.phone;
                    const currentIsOfficial = draft.isOfficial !== undefined ? draft.isOfficial : biz.isOfficial;
                    const currentIsSponsor = draft.isSponsor !== undefined ? draft.isSponsor : biz.isSponsor;

                    return (
                      <tr key={biz.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.includes(String(biz.id)) ? 'bg-brand-teal/5' : ''}`}>
                        <td className="px-6 py-6 text-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-brand-teal focus:ring-brand-teal"
                            checked={selectedIds.includes(String(biz.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...prev, String(biz.id)]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== String(biz.id)));
                              }
                            }}
                          />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={biz.logoUrl} className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" />
                            <div className="flex flex-col gap-1 min-w-0 flex-grow group/field">
                              <div className="flex items-center gap-2">
                                <input
                                  className={`font-black text-sm outline-none bg-transparent border-b border-transparent focus:border-brand-teal transition-all flex-grow ${draft.name !== undefined ? 'text-brand-teal' : 'text-brand-teal-deep'}`}
                                  value={currentName}
                                  onChange={e => setDraftChanges(prev => ({ ...prev, [biz.id]: { ...prev[biz.id], name: e.target.value } }))}
                                />
                                <ICONS.Edit size={10} className="text-slate-200 opacity-0 group-hover/field:opacity-100 transition-opacity" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{biz.code}</span>
                                {currentIsOfficial && <span className="bg-brand-teal/10 text-brand-teal px-1.5 py-0.5 rounded text-[7px] font-bold border border-brand-teal/20">OFICIAL</span>}
                                {currentIsSponsor && <span className="bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded text-[7px] font-bold border border-brand-orange/20">PATROCINADOR</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 group/cat">
                              <select
                                className={`text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent border-b border-transparent focus:border-brand-teal cursor-pointer flex-grow ${draft.category !== undefined ? 'text-brand-teal' : 'text-slate-500'}`}
                                value={currentCategory}
                                onChange={e => setDraftChanges(prev => ({ ...prev, [biz.id]: { ...prev[biz.id], category: e.target.value as CategoryType } }))}
                              >
                                {Object.values(CategoryType).map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <ICONS.Edit size={8} className="text-slate-200 opacity-0 group-hover/cat:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex items-center gap-2 group/neigh">
                              <NeighborhoodSelector
                                className="flex-grow min-w-[120px]"
                                triggerClassName={`text-[9px] font-black uppercase tracking-widest outline-none bg-transparent border-b border-transparent focus:border-brand-teal cursor-pointer ${draft.neighborhood !== undefined ? 'text-brand-teal' : 'text-slate-400'}`}
                                dropdownClassName="min-w-[200px]"
                                value={currentNeighborhood || ''}
                                onChange={val => setDraftChanges(prev => ({ ...prev, [biz.id]: { ...prev[biz.id], neighborhood: val } }))}
                                placeholder="Sem Bairro"
                              />
                              <ICONS.Edit size={8} className="text-slate-200 opacity-0 group-hover/neigh:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1 group/views items-center">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className={`w-20 font-black outline-none bg-transparent border-b border-transparent focus:border-brand-teal text-sm text-center ${draft.views !== undefined ? 'text-brand-teal' : 'text-brand-teal-deep'}`}
                                value={currentViews}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setDraftChanges(prev => ({ ...prev, [biz.id]: { ...prev[biz.id], views: val } }));
                                }}
                              />
                              <ICONS.Edit size={10} className="text-slate-200 opacity-0 group-hover/views:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest text-center block">Acessos</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button
                            onClick={() => setDraftChanges(prev => ({
                              ...prev,
                              [biz.id]: { ...prev[biz.id], isSponsor: !currentIsSponsor }
                            }))}
                            className={`p-3 rounded-xl transition-all ${currentIsSponsor ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20 scale-110' : 'bg-slate-50 text-slate-300 hover:bg-slate-100 hover:text-slate-400 border border-slate-100'}`}
                            title={currentIsSponsor ? "Remover Patrocínio" : "Tornar Patrocinador"}
                          >
                            <ICONS.Crown size={18} className={currentIsSponsor ? "animate-pulse" : ""} />
                          </button>
                        </td>
                        <td className="px-8 py-6">
                          <button
                            onClick={() => handleToggleStatus(biz)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isCurrentActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                          >
                            <div className={`w-6 h-3 rounded-full relative transition-colors ${isCurrentActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-transform ${isCurrentActive ? 'translate-x-3' : 'translate-x-0.5'}`}></div>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{isCurrentActive ? 'No Ar' : 'Pausa'}</span>
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <a href={`#/business/${biz.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg text-slate-300 hover:text-brand-teal hover:bg-brand-teal/5 transition-all"><ICONS.ExternalLink size={16} /></a>
                            <button onClick={() => openEditModal(biz)} className="p-2 rounded-lg text-slate-300 hover:text-brand-orange hover:bg-brand-orange/5 transition-all"><ICONS.Edit size={16} /></button>
                            <button onClick={() => showConfirm({
                              title: 'Remover Empresa',
                              message: `Tem certeza que deseja remover ${biz.name}? Esta ação não pode ser desfeita.`,
                              type: 'danger',
                              confirmLabel: 'Remover',
                              onConfirm: () => onDelete(biz.id)
                            })} className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"><ICONS.Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-8 px-6">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Mostrando <span className="text-brand-teal">{paginatedBusinesses.length}</span> de <span className="text-brand-teal-deep">{filteredBusinesses.length}</span> Lojistas
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${currentPage === 1
                      ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-brand-teal hover:text-brand-teal shadow-sm'
                      }`}
                  >
                    <ICONS.ChevronLeft size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Anterior</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === pageNum
                            ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20'
                            : 'bg-white border border-slate-100 text-slate-400 hover:border-brand-teal/30'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${currentPage === totalPages
                      ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-brand-teal hover:text-brand-teal shadow-sm'
                      }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Próxima</span>
                    <ICONS.ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {adminView === 'approvals' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-3xl -translate-x-10 translate-y-10"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                <div>
                  <h2 className="text-3xl font-black text-brand-teal-deep tracking-tight mb-2">Solicitações de Cadastro</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Analise e publique novos comércios no guia</p>
                </div>
              </div>

              <div className="space-y-6">
                {businesses.filter(b => b.isActive === false).length === 0 ? (
                  <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <ICONS.CheckCircle size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma solicitação pendente</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {businesses.filter(b => b.isActive === false).map(biz => (
                      <div key={biz.id} className="group bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-2xl hover:border-brand-teal/20 transition-all flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-left">
                        <div className="flex items-center gap-6 flex-grow">
                          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                            {biz.logoUrl ? <img src={biz.logoUrl} className="w-full h-full object-cover" /> : <ICONS.Package className="text-slate-200" size={32} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-black text-brand-teal-deep">{biz.name}</h3>
                              <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-[8px] font-black uppercase tracking-widest rounded-lg border border-brand-orange/10">Aguardando Aprovação</span>
                            </div>
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ICONS.Tag size={12} className="mr-2 text-brand-teal" /> {biz.category}</div>
                              <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ICONS.MapPin size={12} className="mr-2 text-brand-orange" /> {biz.neighborhood}</div>
                              <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-brand-teal/20 pb-0.5"><ICONS.MessageCircle size={12} className="mr-2 text-emerald-500" /> {biz.phone}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button onClick={() => openEditModal(biz)} className="px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all">Revisar Dados</button>
                          <button onClick={() => handleToggleStatus(biz)} className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2">
                            <ICONS.Check size={14} /> Aprovar e Publicar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {
          adminView === 'customers' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-brand-teal-deep">Base de Clientes</h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{customers.length} Registros</span>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Cliente</th>

                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bairro</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {customers.map(customer => (
                      <tr key={customer.id} className="hover:bg-slate-50/50">
                        <td className="px-10 py-6 font-black text-brand-teal-deep">{customer.name}</td>

                        <td className="px-10 py-6">
                          <span className="text-[10px] font-black bg-brand-orange/5 text-brand-orange px-3 py-1 rounded-lg uppercase tracking-wider">
                            {customer.neighborhood}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(customer.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Modal Admin (Novo / Editar) */}
        {
          isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-teal-deep/60 backdrop-blur-md overflow-y-auto">
              <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8 flex flex-col max-h-[90vh]">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
                  <div>
                    <h2 className="text-3xl font-black text-brand-teal-deep tracking-tighter leading-tight">
                      {editingBiz ? 'Atualizar' : 'Novo'} Cadastro
                    </h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configurações de Identidade e Operação</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-slate-100 rounded-[1.5rem] transition-all text-slate-400"><ICONS.X size={28} /></button>
                </div>

                <form id="adminForm" onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar flex-grow space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Logotipo Principal</label>
                      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Logo" /> : <ICONS.Plus className="text-slate-200" />}
                        </div>
                        <div className="flex-grow">
                          <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={e => handleImageUpload(e, 'logoUrl')} />
                          <button type="button" onClick={() => logoInputRef.current?.click()} className="text-[10px] font-black bg-brand-teal text-white px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-brand-teal-dark transition-all shadow-lg shadow-brand-teal/20">Alterar Logo</button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Imagem de Capa</label>
                      <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="flex-grow h-16 md:h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                          {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Capa" /> : <ICONS.Plus className="text-slate-200" />}
                        </div>
                        <div className="shrink-0">
                          <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={e => handleImageUpload(e, 'imageUrl')} />
                          <button type="button" onClick={() => coverInputRef.current?.click()} className="text-[10px] font-black bg-brand-teal text-white px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-brand-teal-dark transition-all shadow-lg shadow-brand-teal/20">Alterar Capa</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Acesso e Identificação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                        <input required className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold outline-none focus:border-brand-teal" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Segmento Principal (Categoria)</label>
                        <select className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold outline-none focus:border-brand-teal" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as CategoryType })}>
                          {Object.values(CategoryType)
                            .map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username (Login)</label>
                        <input required className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-brand-teal-deep font-black outline-none" value={formData.username || ''} onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                        <input required className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-brand-teal-deep font-black outline-none" value={formData.password || ''} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Comercial</label>
                        <input required className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-white text-brand-teal-deep font-black outline-none" placeholder="+55 19..." value={formData.phone || ''} onChange={handlePhoneChange} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Localização</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua / Logradouro (Sem Abreviações)</label>
                        <input
                          required
                          className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none placeholder:font-normal placeholder:text-slate-300"
                          placeholder="Ex: Rua Ricardo Melotto (Não use R.)"
                          value={formData.street || ''}
                          onChange={e => {
                            let val = e.target.value;
                            // Auto-correção proativa de abreviações comuns no início
                            if (val.toLowerCase().startsWith('r. ')) val = 'Rua ' + val.slice(3);
                            if (val.toLowerCase().startsWith('av. ')) val = 'Avenida ' + val.slice(4);
                            setFormData({ ...formData, street: val });
                          }}
                        />
                      </div>
                      <div className="md:col-span-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número</label>
                        <input required className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none" value={formData.number || ''} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP (Obrigatório)</label>
                        <input
                          required
                          placeholder="00000-000"
                          className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none focus:border-brand-teal"
                          value={formData.cep || ''}
                          onChange={handleCepChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro de Piracicaba</label>
                        <NeighborhoodSelector
                          value={formData.neighborhood || ''}
                          onChange={val => setFormData({ ...formData, neighborhood: val })}
                          placeholder="Selecione o bairro..."
                          triggerClassName="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none focus:border-brand-teal"
                          value={formData.latitude || ''}
                          onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                          placeholder="Ex: -22.1234..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none focus:border-brand-teal"
                          value={formData.longitude || ''}
                          onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                          placeholder="Ex: -47.1234..."
                        />
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <button
                        type="button"
                        onClick={() => formData.cep && updateGpsByCep(formData.cep)}
                        disabled={isGeocoding || !formData.cep}
                        className="flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100 disabled:opacity-50"
                      >
                        {isGeocoding ? (
                          <div className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div>
                        ) : (
                          <ICONS.MapPin size={14} />
                        )}
                        {isGeocoding ? 'Buscando...' : 'Obter Coordenadas pelo CEP'}
                      </button>

                      <a
                        href={`https://www.google.com/maps/search/${encodeURIComponent(formData.name + ' ' + formData.street + ' Piracicaba')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] font-black text-slate-400 hover:text-brand-orange transition-colors uppercase tracking-widest border-b border-dashed border-slate-300 pb-1"
                      >
                        Não encontrou? Abrir no Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Horários e Serviços</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        {DAYS_NAME.map((day, idx) => {
                          const config = (formData.schedule && formData.schedule[idx]) || { enabled: false, open: '08:00', close: '18:00' };
                          return (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${config.enabled ? 'bg-white border-brand-teal/20 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                              <div className="flex items-center gap-4 min-w-[100px]">
                                <button
                                  type="button"
                                  onClick={() => handleDayToggle(idx)}
                                  className={`w-12 h-7 rounded-full relative transition-colors ${config.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                >
                                  <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${config.enabled ? 'translate-x-5' : ''}`}></div>
                                </button>
                                <span className="text-[12px] font-black text-slate-700 uppercase">{day}</span>
                              </div>
                              {config.enabled ? (
                                <div className="flex items-center gap-3">
                                  <input type="time" className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-black outline-none focus:border-brand-teal" value={config.open} onChange={e => handleTimeChange(idx, 'open', e.target.value)} />
                                  <span className="text-[10px] font-black text-slate-300 uppercase">às</span>
                                  <input type="time" className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-black outline-none focus:border-brand-teal" value={config.close} onChange={e => handleTimeChange(idx, 'close', e.target.value)} />
                                </div>
                              ) : <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fechado</span>}
                            </div>
                          );
                        })}
                      </div>
                      <div className="space-y-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Descrição Comercial</label>
                          <textarea required rows={6} className="w-full px-6 py-4 rounded-[2rem] border border-slate-200 bg-white text-slate-700 font-bold outline-none resize-none focus:border-brand-teal" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <label className="flex items-center cursor-pointer p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <input type="checkbox" className="w-6 h-6 rounded border-slate-200 text-brand-teal mr-4" checked={formData.offersDelivery} onChange={e => setFormData({ ...formData, offersDelivery: e.target.checked })} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Faz Delivery</span>
                          </label>
                          <label className="flex items-center cursor-pointer p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <input type="checkbox" className="w-6 h-6 rounded border-slate-200 text-brand-teal mr-4" checked={formData.offersPickup} onChange={e => setFormData({ ...formData, offersPickup: e.target.checked })} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Aceita Retirada</span>
                          </label>
                          <label className="flex items-center cursor-pointer p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <input type="checkbox" className="w-6 h-6 rounded border-slate-200 text-brand-teal mr-4" checked={formData.is24h} onChange={e => setFormData({ ...formData, is24h: e.target.checked })} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Loja 24 Horas</span>
                          </label>
                          <label className="flex items-center cursor-pointer p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <input type="checkbox" className="w-6 h-6 rounded border-slate-200 text-brand-teal mr-4" checked={formData.isOfficial} onChange={e => setFormData({ ...formData, isOfficial: e.target.checked })} />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase tracking-widest text-brand-teal">Selo Oficial</span>
                              <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Loja Verificada (Selo Azul)</span>
                            </div>
                          </label>
                          <label className="flex items-center cursor-pointer p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <input type="checkbox" className="w-6 h-6 rounded border-slate-200 text-brand-orange mr-4" checked={formData.isSponsor} onChange={e => setFormData({ ...formData, isSponsor: e.target.checked })} />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange">Parceiro Patrocinador</span>
                              <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Destaque Premium (Coroa Laranja)</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

                <div className="p-10 border-t border-slate-50 bg-slate-50/50 shrink-0 flex gap-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-2xl font-black bg-white text-slate-400 border border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Descartar</button>
                  <button type="submit" form="adminForm" className="flex-1 py-5 rounded-2xl font-black bg-brand-teal text-white hover:bg-brand-teal-dark transition-all shadow-xl shadow-brand-teal/20 uppercase tracking-widest text-xs">Salvar Alterações</button>
                </div>
              </div>
            </div>
          )
        }

        <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
      </div >
    </div >
  );
};

export default Admin;
