
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Business, CategoryType, WeekSchedule } from '../types';
import { ICONS, PIRACICABA_NEIGHBORHOODS, BUSINESS_SPECIALTIES } from '../constants';
import NeighborhoodSelector from '../components/NeighborhoodSelector';
import { getDefaultSchedule, formatScheduleSummary } from '../utils/businessUtils';
import * as db from '../services/databaseService';

interface MerchantDashboardProps {
  businesses: Business[];
  onUpdate: (biz: Business) => void;
}

const DAYS_NAME = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ businesses, onUpdate }) => {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Business>>({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadMerchantSession = async () => {
      const bizId = await db.getMerchantSession();
      if (!bizId) {
        navigate('/merchant-login');
        return;
      }
      const found = businesses.find(b => String(b.id) === String(bizId));
      if (!found) {
        await db.clearMerchantSession();
        navigate('/merchant-login');
        return;
      }
      setBusiness(found);
      setFormData({
        ...found,
        schedule: found.schedule || getDefaultSchedule(),
        street: found.street || found.address.split(',')[0] || '',
        number: found.number || found.address.split(',')[1]?.split('-')[0]?.trim() || ''
      });
    };
    loadMerchantSession();
  }, [businesses, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+55')) {
      val = '+55' + val.replace(/\D/g, '');
    } else {
      const numbers = val.slice(3).replace(/\D/g, '');
      val = '+55' + numbers;
    }
    setFormData({ ...formData, phone: val });
  };

  const handleLogout = async () => {
    await db.clearMerchantSession();
    navigate('/merchant-login');
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
      // Tenta busca ultra-específica pelo CEP em Piracicaba
      const query = encodeURIComponent(`CEP ${cep} Piracicaba Brazil`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        }));
      } else {
        // Fallback: Tenta busca apenas pelo CEP se falhar com o contexto de cidade
        const responseFall = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${cep}&country=Brazil&limit=1`);
        const dataFall = await responseFall.json();
        if (dataFall && dataFall.length > 0) {
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(dataFall[0].lat),
            longitude: parseFloat(dataFall[0].lon)
          }));
        } else {
          alert('Não foi possível encontrar as coordenadas para este CEP. Verifique se o CEP está correto.');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
      alert('Erro na conexão com o serviço de mapas.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de abreviações
    const street = (formData.street || '').trim();
    if (street.match(/^(R\.|Av\.|Rod\.|Pç\.|Lgo\.)\s/i) || street.match(/\s(R\.|Av\.|Rod\.|Pç\.|Lgo\.)\s/i)) {
      alert('Por favor, não use abreviações como "R." ou "Av.". Escreva o nome por extenso (Rua, Avenida, etc).');
      return;
    }

    // Validação de CEP
    if (!formData.cep || !formData.cep.match(/^\d{5}-\d{3}$/)) {
      alert('Por favor, insira um CEP válido no formato 00000-000.');
      return;
    }

    if (business && formData) {
      const finalSchedule = formData.schedule || getDefaultSchedule();
      const fullAddress = `${formData.street}, ${formData.number}${formData.neighborhood ? ` - ${formData.neighborhood}` : ''}, Piracicaba, SP - CEP ${formData.cep}`;

      const updatedBiz = {
        ...business,
        ...formData,
        address: fullAddress,
        schedule: finalSchedule,
        businessHours: formatScheduleSummary(finalSchedule)
      } as Business;
      onUpdate(updatedBiz);
      setBusiness(updatedBiz);
      setIsModalOpen(false);
      alert('Informações atualizadas com sucesso!');
    }
  };

  if (!business) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
      {/* Top Nav Dashboard */}
      <div className="flex items-center justify-between mb-8 px-4">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center text-slate-400 hover:text-brand-teal transition-all"
        >
          <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-brand-teal/10 mr-3">
            <ICONS.X size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sair do Painel</span>
        </button>
        <button
          onClick={handleLogout}
          className="text-[10px] font-black text-brand-orange hover:text-brand-orange-dark uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-brand-orange transition-all"
        >
          Trocar Conta
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden mb-8">
        {/* New Enhanced Header */}
        <div className="relative h-64 md:h-80 bg-slate-200">
          <img src={business.imageUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-teal-deep/80 via-brand-teal-deep/20 to-transparent"></div>

          <div className="absolute -bottom-10 left-10 right-10 flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-[6px] border-white bg-white shadow-2xl overflow-hidden shrink-0 transform group-hover:scale-105 transition-transform duration-500">
                <img src={business.logoUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute -bottom-2 -right-2 bg-brand-orange text-white p-2.5 rounded-xl shadow-lg border-2 border-white hover:scale-110 transition-all"
              >
                <ICONS.Edit size={16} />
              </button>
            </div>

            <div className="pb-4 md:pb-12 text-center md:text-left flex-grow">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-brand-orange text-white text-[9px] font-black uppercase tracking-widest shadow-lg mb-3">
                {business.category}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white md:text-white drop-shadow-md tracking-tighter leading-none">
                {business.name}
              </h1>
              <p className="text-white/60 text-xs font-bold mt-2 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                <ICONS.MapPin size={12} className="text-brand-orange" />
                {business.neighborhood}, Piracicaba
              </p>
            </div>

            {/* Visualizações removidas a pedido do usuário */}
          </div>
        </div>

        {/* Content Area */}
        <div className="pt-24 md:pt-20 p-8 md:p-14 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Info Col */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-brand-teal uppercase tracking-[0.3em] border-l-4 border-brand-teal pl-4">Bio do Comércio</h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 italic">
                  "{business.description}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2rem] border border-slate-100 bg-white hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-brand-orange/10 text-brand-orange group-hover:scale-110 transition-transform">
                      <ICONS.MessageCircle size={24} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato</span>
                  </div>
                  <p className="text-xl font-black text-brand-teal-deep">{business.phone}</p>
                </div>
                <div className="p-8 rounded-[2rem] border border-slate-100 bg-white hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-brand-teal/10 text-brand-teal group-hover:scale-110 transition-transform">
                      <ICONS.Clock size={24} />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atendimento</span>
                  </div>
                  <p className="text-sm font-bold text-slate-600 line-clamp-2">{business.businessHours || 'Configurar horários'}</p>
                </div>
              </div>
            </div>

            {/* Status Col */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-brand-teal uppercase tracking-[0.3em] border-l-4 border-brand-teal pl-4">Configurações Rápidas</h3>
              <div className="space-y-4">
                <div className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${business.isActive ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${business.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Visibilidade no Guia</span>
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${business.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {business.isActive ? 'Online' : 'Pausado'}
                  </span>
                </div>

                <div className="p-6 rounded-3xl border border-slate-100 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ICONS.Truck size={18} className={business.offersDelivery ? 'text-brand-teal' : 'text-slate-300'} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Delivery</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${business.offersDelivery ? 'text-emerald-500' : 'text-slate-300'}`}>{business.offersDelivery ? 'Ativo' : 'Off'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ICONS.Package size={18} className={business.offersPickup ? 'text-brand-teal' : 'text-slate-300'} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Retirada</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${business.offersPickup ? 'text-emerald-500' : 'text-slate-300'}`}>{business.offersPickup ? 'Ativo' : 'Off'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-brand-teal text-white font-black py-6 rounded-3xl hover:bg-brand-teal-dark transition-all shadow-2xl shadow-brand-teal/20 active:scale-95 flex items-center justify-center uppercase tracking-[0.2em] text-[10px]"
              >
                <ICONS.Edit size={20} className="mr-3" /> Editar Informações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (Mantido com as correções de input type time anteriores) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-teal-deep/30 backdrop-blur-xl overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-10 border-b border-slate-50 shrink-0 bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black text-brand-teal-deep tracking-tighter">Configurações do Perfil</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Mantenha seus dados atualizados para vender mais</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white rounded-2xl transition-all text-slate-300 hover:text-brand-orange shadow-sm"><ICONS.X size={24} /></button>
            </div>

            <form id="merchantEditForm" onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar flex-grow space-y-16">
              {/* Image Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Logotipo Principal</label>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {formData.logoUrl ? <img src={formData.logoUrl} className="w-full h-full object-cover" /> : <ICONS.Plus className="text-slate-200" />}
                    </div>
                    <div className="flex-grow">
                      <input type="file" accept="image/*" className="hidden" ref={logoInputRef} onChange={e => handleImageUpload(e, 'logoUrl')} />
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="text-[10px] font-black bg-brand-teal text-white px-6 py-3.5 rounded-2xl uppercase tracking-widest shadow-xl shadow-brand-teal/20 hover:scale-105 transition-all">Alterar</button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Banner de Capa</label>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <div className="flex-grow h-24 rounded-3xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                      {formData.imageUrl ? <img src={formData.imageUrl} className="w-full h-full object-cover" /> : <ICONS.Plus className="text-slate-200" />}
                    </div>
                    <div className="shrink-0">
                      <input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={e => handleImageUpload(e, 'imageUrl')} />
                      <button type="button" onClick={() => coverInputRef.current?.click()} className="text-[10px] font-black bg-brand-teal text-white px-6 py-3.5 rounded-2xl uppercase tracking-widest shadow-xl shadow-brand-teal/20 hover:scale-105 transition-all">Alterar</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-10">
                <h3 className="text-xs font-black text-brand-teal uppercase tracking-[0.3em] border-l-4 border-brand-teal pl-4">Identificação e Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                    <input required type="text" className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Vendas</label>
                    <input required type="tel" className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" placeholder="+55 19..." value={formData.phone || ''} onChange={handlePhoneChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria Principal</label>
                    <select className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as CategoryType })}>
                      {Object.values(CategoryType).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidade / Seguimento (O que você vende?)</label>
                    <select
                      className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner"
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
              </div>

              {/* Location */}
              <div className="space-y-10">
                <h3 className="text-xs font-black text-brand-teal uppercase tracking-[0.3em] border-l-4 border-brand-teal pl-4">Endereço em Piracicaba</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua / Logradouro (Sem Abreviações)</label>
                    <input
                      required
                      className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner placeholder:font-normal placeholder:text-slate-300"
                      placeholder="Ex: Rua Ricardo Melotto (Não use R.)"
                      value={formData.street || ''}
                      onChange={e => {
                        let val = e.target.value;
                        if (val.toLowerCase().startsWith('r. ')) val = 'Rua ' + val.slice(3);
                        if (val.toLowerCase().startsWith('av. ')) val = 'Avenida ' + val.slice(4);
                        setFormData({ ...formData, street: val });
                      }}
                    />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº</label>
                    <input required className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.number || ''} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP (Obrigatório)</label>
                    <input
                      required
                      placeholder="00000-000"
                      className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner placeholder:font-normal placeholder:text-slate-300"
                      value={formData.cep || ''}
                      onChange={handleCepChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                    <NeighborhoodSelector
                      value={formData.neighborhood || ''}
                      onChange={val => setFormData({ ...formData, neighborhood: val })}
                      placeholder="Selecione o bairro..."
                      triggerClassName="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner"
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
                      className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner"
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
                  <p className="text-[9px] font-bold text-slate-400 italic">As coordenadas são necessárias para aparecer no mapa de proximidade.</p>
                </div>
              </div>

              {/* Schedule and Services */}
              <div className="space-y-10">
                <h3 className="text-xs font-black text-brand-teal uppercase tracking-[0.3em] border-l-4 border-brand-teal pl-4">Funcionamento e Serviços</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-3">
                    {DAYS_NAME.map((day, idx) => {
                      const config = (formData.schedule && formData.schedule[idx]) || { enabled: false, open: '08:00', close: '18:00' };
                      return (
                        <div key={idx} className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${config.enabled ? 'bg-white border-brand-teal/20 shadow-md' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                          <div className="flex items-center gap-4 min-w-[90px]">
                            <button
                              type="button"
                              onClick={() => handleDayToggle(idx)}
                              className={`w-11 h-6 rounded-full relative transition-colors ${config.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.enabled ? 'translate-x-5' : ''}`}></div>
                            </button>
                            <span className="text-[11px] font-black text-slate-700 uppercase">{day}</span>
                          </div>
                          {config.enabled ? (
                            <div className="flex items-center gap-3">
                              <input type="time" className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 text-xs font-black outline-none focus:border-brand-teal focus:bg-white" value={config.open} onChange={e => handleTimeChange(idx, 'open', e.target.value)} />
                              <span className="text-[10px] font-black text-slate-300 uppercase">até</span>
                              <input type="time" className="px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 text-xs font-black outline-none focus:border-brand-teal focus:bg-white" value={config.close} onChange={e => handleTimeChange(idx, 'close', e.target.value)} />
                            </div>
                          ) : <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fechado</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Descrição Comercial</label>
                      <textarea required rows={8} className="w-full px-6 py-6 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 font-medium text-slate-600 outline-none resize-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <label className="flex items-center cursor-pointer p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                        <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-200 text-brand-teal mr-4 focus:ring-brand-teal" checked={formData.offersDelivery} onChange={e => setFormData({ ...formData, offersDelivery: e.target.checked })} />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Delivery Disponível</span>
                          <span className="text-[9px] font-bold text-slate-400 mt-0.5">Entregamos em Piracicaba</span>
                        </div>
                      </label>
                      <label className="flex items-center cursor-pointer p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                        <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-200 text-brand-teal mr-4 focus:ring-brand-teal" checked={formData.offersPickup} onChange={e => setFormData({ ...formData, offersPickup: e.target.checked })} />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Retirada no Local</span>
                          <span className="text-[9px] font-bold text-slate-400 mt-0.5">Cliente busca no comércio</span>
                        </div>
                      </label>
                      <label className="flex items-center cursor-pointer p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                        <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-200 text-brand-teal mr-4 focus:ring-brand-teal" checked={formData.is24h} onChange={e => setFormData({ ...formData, is24h: e.target.checked })} />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Aberto 24 Horas</span>
                          <span className="text-[9px] font-bold text-slate-400 mt-0.5">Sempre aberto para Piracicaba</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex gap-6 shrink-0 pb-6 border-t border-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-6 rounded-3xl font-black bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all uppercase tracking-[0.2em] text-[10px]">Cancelar</button>
                <button type="submit" className="flex-1 px-8 py-6 rounded-3xl font-black bg-brand-teal text-white hover:bg-brand-teal-dark transition-all shadow-[0_20px_40px_-10px_rgba(0,173,181,0.3)] uppercase tracking-[0.2em] text-[10px]">Salvar Dados</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MerchantDashboard;
