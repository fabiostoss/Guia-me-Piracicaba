
import React, { useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Business } from '../types';
import { ICONS, WHATSAPP_MSG_DEFAULT } from '../constants';
import { isBusinessOpen } from '../utils/businessUtils';

interface BusinessDetailProps {
  businesses: Business[];
  onIncrementView?: (id: string) => void;
  checkAuth?: (action: () => void) => void;
}

const BusinessDetail: React.FC<BusinessDetailProps> = ({ businesses, onIncrementView, checkAuth }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const business = businesses.find(b => String(b.id) === String(id));
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (business && onIncrementView) {
      onIncrementView(business.id);
    }
  }, [id]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [business]);

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-black mb-4">Comércio não encontrado</h2>
          <button onClick={() => navigate('/')} className="text-brand-teal font-black hover:underline uppercase tracking-widest text-sm">Voltar para início</button>
        </div>
      </div>
    );
  }

  const isOpen = isBusinessOpen(business.schedule);
  const whatsappUrl = `https://wa.me/${business.phone}?text=${encodeURIComponent(WHATSAPP_MSG_DEFAULT)}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (checkAuth) {
      checkAuth(() => {
        window.open(whatsappUrl, '_blank');
      });
    } else {
      window.open(whatsappUrl, '_blank');
    }
  };

  // Formatação dos horários
  const formatHours = (hoursString: string) => {
    if (!hoursString) return [];
    return hoursString.split('|').map(h => h.trim());
  };

  const hoursList = formatHours(business.businessHours);
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* Hero Header Moderno */}
      <div className="relative h-[45vh] lg:h-[55vh] w-full overflow-hidden">
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt="Capa"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-teal-deep via-brand-teal to-teal-500"></div>
        )}

        {/* Gradient Overlay Suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 lg:top-12 lg:left-12 z-[60] bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all border border-white/20 backdrop-blur-md shadow-lg active:scale-95 group"
          aria-label="Voltar"
        >
          <ICONS.ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Informações Principais no Header */}
        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-12 text-white z-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-10">
            {/* Logo com efeito de vidro e sombra */}
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-[2rem] border-4 border-white/20 bg-white shadow-2xl overflow-hidden shrink-0 backdrop-blur-sm relative z-30 group">
              <img src={business.logoUrl} alt="Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>

            <div className="flex-grow pb-2 md:pb-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-brand-orange text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-brand-orange/30">
                  {business.category}
                </span>

                {business.rating && (
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-amber-400 px-3 py-1.5 rounded-lg border border-white/10">
                    <ICONS.Star size={12} fill="currentColor" />
                    <span className="text-white text-[10px] font-black">{business.rating}</span>
                    <span className="text-white/60 text-[10px]">({business.reviewsCount})</span>
                  </div>
                )}

                {isOpen ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Aberto Agora
                  </span>
                ) : (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg shadow-rose-500/30">
                    Fechado
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none text-white drop-shadow-lg flex items-center gap-3">
                {business.name}
                {business.isOfficial && <ICONS.Crown size={32} className="text-brand-orange animate-pulse" />}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 layout-grid">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">

            {/* Sobre */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 reveal">
              <h2 className="text-sm font-black text-brand-teal-deep uppercase tracking-widest mb-6 flex items-center gap-2">
                <ICONS.Info size={18} className="text-brand-orange" />
                Sobre
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line font-medium">
                {business.description}
              </p>
            </div>

            {/* Grid de Informações: Localização e Horário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card Localização - Visual de Mapa */}
              <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col reveal group h-full">
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {/* "Fake Map" Pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-brand-orange/20 p-4 rounded-full animate-pulse-slow">
                      <ICONS.MapPin size={32} className="text-brand-orange drop-shadow-md" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-6">
                    <span className="bg-white/90 backdrop-blur text-brand-teal-deep text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm">
                      Localização
                    </span>
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <p className="text-slate-600 font-medium leading-relaxed mb-6 flex-grow">
                    {business.address}, {business.number} <br />
                    <span className="text-slate-400 text-sm">{business.neighborhood} - {business.cep}</span>
                  </p>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-50 hover:bg-brand-orange hover:text-white text-slate-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 group/btn border border-slate-100"
                  >
                    <ICONS.Map size={18} className="group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs uppercase tracking-widest">Abrir no Maps</span>
                  </a>
                </div>
              </div>

              {/* Card Horário - Lista Formatada */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col reveal h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                    <ICONS.Clock size={20} />
                  </div>
                  <h3 className="text-sm font-black text-brand-teal-deep uppercase tracking-widest">Horários</h3>
                </div>

                <div className="space-y-3 flex-grow">
                  {hoursList.length > 0 ? (
                    hoursList.map((hour, index) => {
                      const [day, time] = hour.split(':');
                      const isToday = day && day.toLowerCase().includes(today.toLowerCase().slice(0, 3)); // Tentativa simples de match

                      return (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-xl border ${isToday ? 'bg-brand-teal/5 border-brand-teal/20' : 'bg-slate-50 border-slate-100'}`}>
                          <span className={`text-xs font-black uppercase tracking-widest ${isToday ? 'text-brand-teal' : 'text-slate-500'}`}>
                            {day ? day : hour}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {time ? `:${time}` : ''}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-slate-500 italic">Consulte via WhatsApp</p>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="inline-flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-full justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    Horário de Brasília
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar Flutuante */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Card de Ação Principal */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-white/20 shadow-2xl shadow-brand-teal/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-teal/10 transition-colors"></div>

                <h3 className="text-lg font-black text-slate-800 mb-6 relative z-10">Como você quer pedir?</h3>

                <div className="space-y-3 mb-8 relative z-10">
                  {business.offersDelivery ? (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 transition-colors cursor-default">
                      <div className="bg-white p-2.5 rounded-xl text-emerald-500 shadow-sm">
                        <ICONS.Truck size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Delivery</p>
                        <p className="text-[10px] text-emerald-600/80 font-medium">Receba em casa</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 opacity-60 grayscale">
                      <div className="bg-white p-2.5 rounded-xl text-slate-400">
                        <ICONS.Truck size={20} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase">Sem Delivery</span>
                    </div>
                  )}

                  {business.offersPickup ? (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50 border border-sky-100 transition-colors cursor-default">
                      <div className="bg-white p-2.5 rounded-xl text-sky-500 shadow-sm">
                        <ICONS.Package size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-sky-700 uppercase tracking-widest">Retirada</p>
                        <p className="text-[10px] text-sky-600/80 font-medium">Busque no local</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-gradient-to-r from-brand-teal to-brand-teal-dark hover:from-brand-teal-light hover:to-brand-teal text-white font-black py-5 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-brand-teal/20 hover:shadow-brand-teal/40 hover:-translate-y-1 active:scale-95 active:translate-y-0 group/btn relative z-10"
                >
                  <ICONS.MessageCircle className="w-6 h-6 mr-3 group-hover/btn:animate-bounce" />
                  <span className="text-xs uppercase tracking-[0.15em]">Chamar no Zap</span>
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium mt-4">
                  Resposta média: <span className="text-brand-teal font-bold">15 min</span>
                </p>
              </div>

              {/* Box de Segurança / Info Extra (Opcional, para preencher) */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/50 flex items-start gap-4">
                <ICONS.Shield className="text-slate-400 shrink-0" size={20} />
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Verificado:</strong> Este é um perfil oficial. As informações são gerenciadas diretamente pelo estabelecimento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
