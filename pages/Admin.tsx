
import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Business, CategoryType, Customer } from '../types';
import { ICONS, PIRACICABA_NEIGHBORHOODS, BUSINESS_SPECIALTIES } from '../constants';
import { isBusinessOpen, getDefaultSchedule, formatScheduleSummary } from '../utils/businessUtils';
import * as db from '../services/databaseService';
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
}

const DAYS_NAME = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Admin: React.FC<AdminProps> = ({ businesses, customers, onAdd, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [adminView, setAdminView] = useState<'dashboard' | 'management' | 'customers'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [draftChanges, setDraftChanges] = useState<Record<string, Partial<Business>>>({});
  const [isSaving, setIsSaving] = useState(false);

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
      headStyles: { fillStyle: 'F', fillColor: [20, 184, 166] }
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

  // Abre o modal de edição com clonagem segura para garantir que o formulário receba os dados
  const openEditModal = (biz: Business) => {
    const bizToEdit = JSON.parse(JSON.stringify(biz)) as Business;
    setEditingBiz(bizToEdit);
    setFormData({
      ...bizToEdit,
      street: bizToEdit.street || bizToEdit.address.split(',')[0] || '',
      number: bizToEdit.number || bizToEdit.address.split(',')[1]?.split('-')[0]?.trim() || ''
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
    const finalSchedule = formData.schedule || getDefaultSchedule();
    const fullAddress = `${formData.street}, ${formData.number}${formData.neighborhood ? ` - ${formData.neighborhood}` : ''}, Piracicaba, SP`;

    const bizData = {
      ...formData,
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

  const handleToggleStatus = (biz: Business) => {
    const currentIsActive = draftChanges[biz.id]?.isActive !== undefined
      ? draftChanges[biz.id].isActive
      : biz.isActive;

    setDraftChanges(prev => ({
      ...prev,
      [biz.id]: { ...prev[biz.id], isActive: !currentIsActive }
    }));
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
          const updatedBusiness = Object.assign({}, original, changes) as Business;
          await onUpdate(updatedBusiness);
        }
      }

      setDraftChanges({});
      alert('Sincronização concluída! Todas as alterações estão salvas no servidor.');
    } catch (error) {
      console.error('Erro crítico na sincronização:', error);
      alert('Erro ao sincronizar. Algumas alterações podem não ter sido salvas.');
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
    return businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.code && b.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTab =
        activeTab === 'all' ? true :
          activeTab === 'active' ? b.isActive === true :
            b.isActive === false;
      return matchesSearch && matchesTab;
    });
  }, [businesses, searchTerm, activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-black text-brand-teal-deep tracking-tighter mb-4">Pira <span className="text-brand-orange">Admin</span> Center</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setAdminView('dashboard')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${adminView === 'dashboard' ? 'bg-brand-teal text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>Visão Geral</button>
            <button onClick={() => setAdminView('management')} className={`text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${adminView === 'management' ? 'bg-brand-teal text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>Lojistas</button>
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
            <div className="lg:col-span-1 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-[500px]">
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
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-[500px]">
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
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
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
            <input
              placeholder="Pesquisar loja..."
              className="flex-grow px-6 py-4 rounded-2xl border border-slate-200 focus:border-brand-teal outline-none font-bold"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'all' ? 'bg-white text-brand-teal shadow-sm' : 'text-slate-400'}`}>Todos</button>
              <button onClick={() => setActiveTab('active')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'active' ? 'bg-white text-brand-teal shadow-sm' : 'text-slate-400'}`}>No Ar</button>
              <button onClick={() => setActiveTab('inactive')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'inactive' ? 'bg-white text-brand-teal shadow-sm' : 'text-slate-400'}`}>Pausados</button>
            </div>
            {Object.keys(draftChanges).length > 0 && (
              <button
                onClick={saveAllChanges}
                disabled={isSaving}
                className="flex-grow md:flex-initial bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 animate-bounce-subtle"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <ICONS.Check size={16} />
                )}
                Salvar Alterações ({Object.keys(draftChanges).length})
              </button>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loja</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acessos</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBusinesses.map(biz => {
                  const draft = draftChanges[biz.id] || {};
                  const isCurrentActive = draft.isActive !== undefined ? draft.isActive : biz.isActive;
                  const currentViews = draft.views !== undefined ? draft.views : (biz.views || 0);

                  return (
                    <tr key={biz.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={biz.logoUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isCurrentActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          </div>
                          <div>
                            <p className="font-black text-brand-teal-deep text-sm group-hover:text-brand-teal transition-colors">{biz.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              {biz.code} • {biz.category}
                              {biz.isOfficial && <span className="bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded text-[7px] border border-brand-orange/20">OFICIAL</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col group/views">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              className={`w-24 border font-black outline-none focus:ring-4 rounded-xl px-3 py-1.5 transition-all text-sm ${draft.views !== undefined
                                ? 'bg-brand-teal/5 border-brand-teal text-brand-teal focus:ring-brand-teal/10'
                                : 'bg-slate-50 border-slate-100 text-brand-teal-deep focus:border-brand-teal focus:bg-white focus:ring-brand-teal/10'
                                }`}
                              value={currentViews}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setDraftChanges(prev => ({
                                  ...prev,
                                  [biz.id]: { ...prev[biz.id], views: val }
                                }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                            />
                            {draft.views !== undefined && (
                              <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" title="Alteração pendente"></div>
                            )}
                          </div>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">Visualizações</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <button
                          onClick={() => handleToggleStatus(biz)}
                          className={`group/toggle flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${isCurrentActive
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          title={isCurrentActive ? "Clique para Pausar Anúncio" : "Clique para Ativar Anúncio"}
                        >
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${isCurrentActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isCurrentActive ? 'translate-x-4.5' : 'translate-x-0.5'}`}></div>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {isCurrentActive ? 'Ativo' : 'Pausado'}
                          </span>
                          {draft.isActive !== undefined && (
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></div>
                          )}
                        </button>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Live */}
                          <a
                            href={`#/business/${biz.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl text-slate-400 hover:text-brand-teal hover:bg-brand-teal/5 transition-all"
                            title="Ver Página do Comércio"
                          >
                            <ICONS.ExternalLink size={18} />
                          </a>

                          {/* WhatsApp Admin shortcut */}
                          <a
                            href={`https://wa.me/${biz.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                            title="Falar com Lojista"
                          >
                            <ICONS.MessageCircle size={18} />
                          </a>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(biz)}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-brand-orange hover:bg-brand-orange/5 transition-all"
                            title="Editar Cadastro"
                          >
                            <ICONS.Edit size={18} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Deseja realmente REMOVER ${biz.name}? Esta ação não pode ser desfeita.`)) {
                                onDelete(biz.id);
                              }
                            }}
                            className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Excluir Comércio"
                          >
                            <ICONS.Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Cliente</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bairro</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {customers.map(customer => (
                    <tr key={customer.id} className="hover:bg-slate-50/50">
                      <td className="px-10 py-6 font-black text-brand-teal-deep">{customer.name}</td>
                      <td className="px-10 py-6 text-brand-teal font-bold">{customer.phone}</td>
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
                    <div className="space-y-4 pt-6">
                      <label className="flex items-center cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                        <input type="checkbox" className="w-6 h-6 rounded border-slate-200 text-brand-orange mr-4" checked={formData.isOfficial || false} onChange={e => setFormData({ ...formData, isOfficial: e.target.checked })} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange">Parceiro Oficial (Destaque)</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidade / Seguimento (O que você vende?)</label>
                      <select
                        className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold outline-none focus:border-brand-teal"
                        value={formData.segment || ''}
                        onChange={e => setFormData({ ...formData, segment: e.target.value })}
                      >
                        <option value="">Selecione a especialidade...</option>
                        {BUSINESS_SPECIALTIES.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
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
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                      <input required className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none" value={formData.street || ''} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número</label>
                      <input required className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none" value={formData.number || ''} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro de Piracicaba</label>
                    <select required className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none" value={formData.neighborhood || ''} onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}>
                      <option value="">Selecione o bairro...</option>
                      {PIRACICABA_NEIGHBORHOODS.map(bairro => (
                        <option key={bairro} value={bairro}>{bairro}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude (GPS)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Ex: -22.72..."
                        className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none focus:border-brand-teal"
                        value={formData.latitude || ''}
                        onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude (GPS)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Ex: -47.63..."
                        className="w-full px-6 py-4 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold outline-none focus:border-brand-teal"
                        value={formData.longitude || ''}
                        onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      />
                    </div>
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
        )}

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
  );
};

export default Admin;
