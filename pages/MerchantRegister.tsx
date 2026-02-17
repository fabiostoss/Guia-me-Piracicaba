
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryType, Business } from '../types';
import { ICONS, WHATSAPP_ADMIN, BUSINESS_SPECIALTIES } from '../constants';
import NeighborhoodSelector from '../components/NeighborhoodSelector';
import { createBusiness } from '../services/databaseService';
import { getDefaultSchedule, formatScheduleSummary } from '../utils/businessUtils';

const MerchantRegister: React.FC = () => {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: CategoryType.RESTAURANTES,
    segment: '',
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
    isSponsor: false
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateGpsByCep = async (cep: string) => {
    setIsGeocoding(true);
    try {
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
        const responseFall = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${cep}&country=Brazil&limit=1`);
        const dataFall = await responseFall.json();
        if (dataFall && dataFall.length > 0) {
          setFormData(prev => ({
            ...prev,
            latitude: parseFloat(dataFall[0].lat),
            longitude: parseFloat(dataFall[0].lon)
          }));
        } else {
          alert('Não foi possível encontrar as coordenadas para este CEP. Insira manualmente se necessário.');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length <= 8) {
      if (val.length > 5) {
        val = val.slice(0, 5) + '-' + val.slice(5);
      }
      setFormData({ ...formData, cep: val });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const schedule = getDefaultSchedule();
      const newBusiness: Business = {
        id: crypto.randomUUID(),
        code: `PIRA-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name,
        username: formData.name.toLowerCase().replace(/\s+/g, ''),
        description: formData.description,
        category: formData.category,
        segment: formData.segment,
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
        views: 0
      };

      await createBusiness(newBusiness);

      if (formData.isSponsor) {
        const message = `*SOLICITAÇÃO DE PATROCÍNIO - GUIA-ME PIRACICABA*
---------------------------------------
Quero ser um patrocinador!
*Loja:* ${formData.name}
*WhatsApp:* ${formData.whatsapp}
*Segmento:* ${formData.segment}
---------------------------------------
_Solicitação enviada via formulário de adesão_`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_ADMIN}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
      }

      alert('Cadastro enviado com sucesso! Sua loja está na fila de aprovação e nossa equipe entrará em contato em breve.');
      navigate('/');
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Ocorreu um erro ao enviar seu cadastro. Tente novamente.');
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Especialidade / Segmento</label>
                  <select className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.segment} onChange={e => setFormData({ ...formData, segment: e.target.value })}>
                    <option value="">Selecione...</option>
                    {BUSINESS_SPECIALTIES.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-8">
              <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Localização em Piracicaba</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua / Avenida</label>
                  <input required className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº</label>
                  <input required className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                  <div className="flex gap-2">
                    <input required className="flex-grow px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" value={formData.cep} onChange={handleCepChange} placeholder="00000-000" />
                    <button type="button" onClick={() => formData.cep.length >= 8 && updateGpsByCep(formData.cep)} disabled={isGeocoding || formData.cep.length < 8} className="px-6 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-100 disabled:opacity-50 transition-all flex items-center justify-center">
                      {isGeocoding ? <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin"></div> : <ICONS.MapPin size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                  <NeighborhoodSelector value={formData.neighborhood} onChange={val => setFormData({ ...formData, neighborhood: val })} triggerClassName="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50/50 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all shadow-inner" />
                </div>
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
            <div className="p-8 bg-brand-orange/5 rounded-[2.5rem] border border-brand-orange/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 -rotate-45 translate-x-10 -translate-y-10"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <ICONS.Star className="text-brand-orange animate-pulse" size={20} />
                    <h4 className="text-xl font-black text-brand-teal-deep">Quer Destaque Absoluto?</h4>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Marcas patrocinadas aparecem no topo das buscas e têm selo de verificado exclusivo.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isSponsor: !formData.isSponsor })}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isSponsor ? 'bg-brand-orange text-white shadow-lg' : 'bg-white text-brand-orange border border-brand-orange/20 hover:bg-brand-orange/5'}`}
                >
                  {formData.isSponsor ? <ICONS.Check size={16} /> : <ICONS.Zap size={16} />}
                  {formData.isSponsor ? 'Quero ser Patrocinador!' : 'Ser Patrocinador'}
                </button>
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
      </section>
    </div>
  );
};

export default MerchantRegister;
