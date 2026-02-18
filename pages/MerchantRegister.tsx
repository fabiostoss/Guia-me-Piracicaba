
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryType, Business } from '../types';
import { ICONS, WHATSAPP_ADMIN, BUSINESS_SPECIALTIES } from '../constants';
import NeighborhoodSelector from '../components/NeighborhoodSelector';
import { createBusiness } from '../services/databaseService';
import { getDefaultSchedule, formatScheduleSummary } from '../utils/businessUtils';
import { useUI } from '../components/CustomUI';

const MerchantRegister: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useUI();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: CategoryType.RESTAURANTES,
    whatsapp: '+55',
    street: '',
    number: '',
    neighborhood: '',
    cep: '',
    description: '',
    offersDelivery: false,
    offersPickup: false,
    is24h: false,
    latitude: 0,
    longitude: 0,
    isSponsor: null as boolean | null
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [addressFound, setAddressFound] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressError(null);
    let val = e.target.value.replace(/\D/g, '');
    if (val.length <= 8) {
      if (val.length > 5) {
        val = val.slice(0, 5) + '-' + val.slice(5);
      }
      setFormData(prev => ({ ...prev, cep: val }));

      // Quando o CEP estiver completo, buscar endereço automaticamente
      if (val.replace('-', '').length === 8) {
        setIsGeocoding(true);
        setAddressError(null);
        setAddressFound(false);

        try {
          // 1. Buscar endereço via ViaCEP
          const cepClean = val.replace('-', '');
          const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
          const viaCepData = await viaCepResponse.json();

          if (viaCepData.erro) {
            setAddressError('CEP não encontrado');
            setIsGeocoding(false);
            return;
          }

          // Preencher automaticamente rua e bairro
          setFormData(prev => ({
            ...prev,
            street: viaCepData.logradouro || '',
            neighborhood: viaCepData.bairro || '',
            cep: val
          }));

          // 2. Buscar coordenadas GPS (opcional, em bloco separado para não travar o CEP)
          try {
            const fullAddress = `${viaCepData.logradouro}, ${viaCepData.bairro}, Piracicaba, SP, Brasil`;
            const geoQuery = encodeURIComponent(fullAddress);
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${geoQuery}&limit=1`,
              { headers: { 'User-Agent': 'Guia-me-Piracicaba/1.0' } }
            );
            const geoData = await geoResponse.json();

            if (geoData && geoData.length > 0) {
              setFormData(prev => ({
                ...prev,
                latitude: parseFloat(geoData[0].lat),
                longitude: parseFloat(geoData[0].lon)
              }));
            }
          } catch (geoErr) {
            console.warn('Busca de coordenadas GPS falhou (não crítico):', geoErr);
          }

          // Marcar como encontrado se tiver o básico
          if (viaCepData.logradouro && viaCepData.bairro) {
            setAddressFound(true);
            setTimeout(() => {
              document.getElementById('address-number')?.focus();
            }, 600);
          }

        } catch (error) {
          console.error('Erro ao buscar CEP:', error);
          setAddressError('Erro na conexão ao buscar endereço');
        } finally {
          setIsGeocoding(false);
        }
      }
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+55')) {
      val = '+55' + val.replace(/\D/g, '');
    } else {
      const numbers = val.slice(3).replace(/\D/g, '');
      val = '+55' + numbers;
    }
    setFormData({ ...formData, whatsapp: val });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isSponsor === null) {
      showNotification('Por favor, responda se deseja ser um Patrocinador para continuar.', 'warning');
      const element = document.getElementById('sponsor-section');
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (formData.isSponsor === false) {
      setShowSponsorModal(true);
      return;
    }

    handleFinalSubmit(true);
  };

  const handleFinalSubmit = async (confirmedSponsor: boolean) => {
    setIsSubmitting(true);
    setShowSponsorModal(false);

    try {
      const schedule = getDefaultSchedule();
      const newBusiness: Business = {
        id: crypto.randomUUID(),
        code: `PIRA-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name,
        username: formData.name.toLowerCase().replace(/\s+/g, ''),
        description: formData.description,
        category: formData.category,
        segment: '',
        address: `${formData.street}, ${formData.number} - ${formData.neighborhood}, Piracicaba, SP`,
        street: formData.street,
        number: formData.number,
        neighborhood: formData.neighborhood,
        cep: formData.cep,
        phone: formData.whatsapp,
        password: '123', // Senha padrão para primeiro acesso
        imageUrl: 'https://images.unsplash.com/photo-1549421263-524f3cc0b431?q=80&w=2000&auto=format&fit=crop',
        logoUrl: 'https://picsum.photos/seed/business/200/200',
        isActive: false, // Aguardando aprovação
        schedule: schedule,
        businessHours: formatScheduleSummary(schedule),
        offersDelivery: formData.offersDelivery,
        offersPickup: formData.offersPickup,
        is24h: formData.is24h,
        latitude: formData.latitude,
        longitude: formData.longitude,
        createdAt: Date.now(),
        views: 0,
        isSponsor: confirmedSponsor
      };

      await createBusiness(newBusiness);

      if (confirmedSponsor) {
        const message = `*NOVO CADASTRO DE PATROCINADOR - GUIA-ME PIRACICABA*
---------------------------------------
Quero ser um patrocinador!
*Loja:* ${formData.name}
*WhatsApp:* ${formData.whatsapp}
*Bairro:* ${formData.neighborhood}
*Categoria:* ${formData.category}
---------------------------------------
_Solicitação enviada via formulário de adesão_`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_ADMIN}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      }


      showNotification('Obrigado! Seu cadastro foi recebido e está aguardando aprovação.', 'success');
      navigate('/');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      showNotification('Ocorreu um erro ao enviar seu cadastro. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: <ICONS.Eye size={32} />,
      title: "Alta Visualização",
      desc: "Sua marca vista por milhares de piracicabanos que buscam serviços locais todos os dias."
    },
    {
      icon: <ICONS.TrendingUp size={32} />,
      title: "Aumento de Faturamento",
      desc: "Gere mais pedidos e visitas diretamente no seu WhatsApp sem pagar comissões por venda."
    },
    {
      icon: <ICONS.MessageCircle size={32} />,
      title: "Conexão Direta",
      desc: "O cliente te chama direto no Zap. Agilidade no atendimento e fidelização garantida."
    },
    {
      icon: <ICONS.Smartphone size={32} />,
      title: "Presença Digital",
      desc: "Tenha uma vitrine profissional otimizada para celulares, pronta para o mercado atual."
    }
  ];

  return (
    <div className="pb-24">
      {/* Description Section / Por que anunciar */}
      <section className="bg-brand-teal-deep pt-32 pb-48 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-brand-orange rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-brand-teal rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <span className="text-brand-orange text-xs font-black uppercase tracking-[0.4em] mb-4 block animate-fade-in text-shadow-sm">Sua marca em destaque</span>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none animate-slide-up">ALCANCE <span className="text-brand-orange">MILHARES</span> DE CLIENTES</h1>
          <p className="text-white/70 max-w-2xl mx-auto font-bold text-lg leading-relaxed mb-16 animate-slide-up">
            O Guia-me Piracicaba é a vitrine definitiva da cidade. Posicione seu negócio onde as pessoas já estão procurando. Agilidade, visibilidade e resultados reais.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => (
              <div key={idx} className={`bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] text-left hover:bg-white/10 transition-all group reveal stagger-${idx + 1}`}>
                <div className="text-brand-orange mb-6 group-hover:scale-110 transition-transform duration-500">
                  {b.icon}
                </div>
                <h3 className="text-white text-xl font-black mb-3">{b.title}</h3>
                <p className="text-white/50 text-sm font-medium leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-5xl mx-auto px-4 -mt-32 relative z-20 reveal">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden ring-[12px] ring-white/10">
          <div className="p-10 md:p-14 border-b border-slate-50 text-center bg-slate-50/30">
            <h2 className="text-4xl font-black text-brand-teal-deep tracking-tight">Anuncie Sua Loja</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-3">Preencha os dados abaixo para entrar na fila de aprovação</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-12">
            {/* Identificação */}
            <div className="space-y-8">
              <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Identificação e Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                  <input required placeholder="Ex: Pira Burguer Gourmet" className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Vendas</label>
                  <input required type="tel" className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.whatsapp} onChange={handleWhatsappChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoria Principal</label>
                  <select className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as CategoryType })}>
                    {Object.values(CategoryType).filter(cat => cat !== CategoryType.OFICIAIS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-8">
              <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Localização em Piracicaba</h3>

              {/* CEP primeiro - busca automática */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP (Digite para buscar endereço automaticamente)</label>
                <div className="relative">
                  <input
                    required
                    className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner"
                    value={formData.cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                  />
                  {isGeocoding && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin"></div>
                    </div>
                  )}
                  {addressFound && !isGeocoding && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl border border-emerald-100 animate-fade-in">
                      <ICONS.CheckCircle size={14} />
                      <span className="text-[10px] font-black uppercase">Localizado!</span>
                    </div>
                  )}
                  {addressError && !isGeocoding && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-rose-50 text-rose-500 px-3 py-1.5 rounded-xl border border-rose-100 animate-shake">
                      <ICONS.Info size={14} />
                      <span className="text-[10px] font-black uppercase">{addressError}</span>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-medium ml-1">O endereço será preenchido automaticamente após digitar o CEP completo</p>
              </div>

              {/* Rua (preenchida automaticamente) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua / Avenida (Preenchido automaticamente)</label>
                <input
                  required
                  readOnly
                  className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-100 font-bold outline-none text-slate-600 cursor-not-allowed"
                  value={formData.street}
                  placeholder="Aguardando CEP..."
                />
              </div>

              {/* Bairro (preenchido automaticamente) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro (Preenchido automaticamente)</label>
                <input
                  required
                  readOnly
                  className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-100 font-bold outline-none text-slate-600 cursor-not-allowed"
                  value={formData.neighborhood}
                  placeholder="Aguardando CEP..."
                />
              </div>

              {/* Número (manual) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Imóvel</label>
                <input
                  id="address-number"
                  required
                  className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner"
                  value={formData.number}
                  onChange={e => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Ex: 123 ou S/N"
                />
              </div>
            </div>

            {/* Serviços e Descrição */}
            <div className="space-y-8">
              <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Serviços e Detalhes</h3>
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Negócio (Aparece no Guia)</label>
                  <textarea required rows={5} className="w-full px-6 py-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 font-medium text-slate-600 outline-none resize-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Conte um pouco sobre o que sua loja oferece..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center cursor-pointer p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                    <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-200 text-brand-teal mr-4 focus:ring-brand-teal" checked={formData.offersDelivery} onChange={e => setFormData({ ...formData, offersDelivery: e.target.checked })} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Faz Delivery</span>
                  </label>
                  <label className="flex items-center cursor-pointer p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                    <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-200 text-brand-teal mr-4 focus:ring-brand-teal" checked={formData.offersPickup} onChange={e => setFormData({ ...formData, offersPickup: e.target.checked })} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Aceita Retirada</span>
                  </label>
                  <label className="flex items-center cursor-pointer p-6 bg-white rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
                    <input type="checkbox" className="w-6 h-6 rounded-lg border-slate-200 text-brand-teal mr-4 focus:ring-brand-teal" checked={formData.is24h} onChange={e => setFormData({ ...formData, is24h: e.target.checked })} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Loja 24h</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Patrocinador */}
            <div id="sponsor-section" className="p-8 bg-brand-orange/5 rounded-[2.5rem] border border-brand-orange/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 -rotate-45 translate-x-10 -translate-y-10"></div>
              <div className="flex flex-col items-center text-center space-y-8 relative z-10">
                <div className="max-w-2xl">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <ICONS.Star className="text-brand-orange animate-pulse" size={24} />
                    <h4 className="text-2xl font-black text-brand-teal-deep uppercase tracking-tight">Deseja ser um Patrocinador e ter Destaque Absoluto?</h4>
                  </div>
                  <p className="text-slate-500 font-bold leading-relaxed px-4">
                    Marcas patrocinadas aparecem no <span className="text-brand-orange font-black text-base">topo de todas as buscas</span> e têm selo exclusivo de verificado. Escolha uma das opções abaixo:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isSponsor: true })}
                    className={`group relative flex flex-col items-center gap-3 p-8 rounded-3xl border-2 transition-all duration-300 ${formData.isSponsor === true ? 'bg-brand-orange border-brand-orange text-white shadow-2xl scale-[1.05]' : 'bg-white border-slate-100 text-slate-400 hover:border-brand-orange/30 hover:bg-brand-orange/5'}`}
                  >
                    {formData.isSponsor === true && <div className="absolute -top-3 -right-3 bg-white text-brand-orange p-1 rounded-full shadow-lg border border-brand-orange"><ICONS.Check size={20} /></div>}
                    <ICONS.Zap size={32} className={formData.isSponsor === true ? 'text-white' : 'text-brand-orange'} />
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-widest">Sim, quero destaque!</span>
                      <span className={`text-[9px] font-bold ${formData.isSponsor === true ? 'text-white/80' : 'text-slate-400'}`}>Aparecer no topo do Guia</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isSponsor: false })}
                    className={`group relative flex flex-col items-center gap-3 p-8 rounded-3xl border-2 transition-all duration-300 ${formData.isSponsor === false ? 'bg-slate-700 border-slate-700 text-white shadow-2xl scale-[1.05]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-500/30'}`}
                  >
                    {formData.isSponsor === false && <div className="absolute -top-3 -right-3 bg-white text-slate-700 p-1 rounded-full shadow-lg border border-slate-700"><ICONS.Check size={20} /></div>}
                    <ICONS.X size={32} className={formData.isSponsor === false ? 'text-white' : 'text-slate-300'} />
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-widest">Não quero agora</span>
                      <span className={`text-[9px] font-bold ${formData.isSponsor === false ? 'text-white/80' : 'text-slate-400'}`}>Apenas cadastro simples</span>
                    </div>
                  </button>
                </div>

                {formData.isSponsor === null && (
                  <p className="text-[10px] text-brand-orange font-black uppercase animate-bounce">
                    Seleção obrigatória para continuar
                  </p>
                )}
              </div>
            </div>

            <div className="pt-10">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-teal text-white py-8 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.2em] shadow-[0_25px_50px_-12px_rgba(0,173,181,0.5)] hover:bg-brand-teal-dark active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ICONS.CheckCircle size={28} />
                    Finalizar e Enviar para Aprovação
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </section >

      {/* Modal de Vantagens Patrocinador */}
      {showSponsorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full shadow-2xl animate-scale-in border border-slate-100 relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Decorativo */}
            <div className="h-2 bg-gradient-to-r from-brand-orange via-amber-400 to-brand-orange"></div>

            <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-orange/10 rounded-2xl text-brand-orange mb-2">
                  <ICONS.Zap size={32} className="animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl md:text-3xl font-black text-brand-teal-deep tracking-tight leading-tight">
                    Potencialize seu <span className="text-brand-orange">Negócio!</span>
                  </h2>
                  <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-xs mx-auto">
                    Como patrocinador, você terá resultados imediatos e visibilidade prioritária.
                  </p>
                </div>

                <div className="space-y-3 py-4">
                  {[
                    { icon: <ICONS.TrendingUp size={18} />, text: "Destaque no topo das buscas" },
                    { icon: <ICONS.Star size={18} />, text: "Selo de Verificado Exclusivo" },
                    { icon: <ICONS.Eye size={18} />, text: "3x mais visualizações reais" },
                    { icon: <ICONS.MessageCircle size={18} />, text: "Suporte prioritário via WhatsApp" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-brand-orange/20 transition-all group">
                      <div className="bg-white text-brand-orange p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <p className="text-sm font-black text-brand-teal-deep mb-6">
                    Deseja garantir seu lugar no topo agora?
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleFinalSubmit(true)}
                      className="w-full bg-brand-orange text-white py-6 rounded-2xl font-black text-sm uppercase tracking-[0.1em] shadow-lg shadow-brand-orange/20 hover:bg-brand-orange-dark active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <ICONS.Zap size={20} />
                      Sim, quero ser patrocinador!
                    </button>

                    <button
                      onClick={() => navigate('/')}
                      className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                      <ICONS.X size={14} />
                      Não, voltar para o início
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default MerchantRegister;
