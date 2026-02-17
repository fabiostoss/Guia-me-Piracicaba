
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

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      {/* Header com Imagem de Capa Restaurada */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={business.imageUrl}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-teal-deep/40 backdrop-blur-[2px]"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 right-8 z-[60] bg-white/20 hover:bg-white/40 text-white p-3 rounded-2xl transition-all border border-white/10 backdrop-blur-md shadow-lg active:scale-90"
          aria-label="Voltar"
        >
          <ICONS.X size={24} />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end gap-8">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-4 border-white bg-white shadow-2xl overflow-hidden shrink-0">
              <img src={business.logoUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow pb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-brand-orange text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  {business.category}
                </span>
                {business.rating && (
                  <span className="bg-amber-400 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                    <ICONS.Star size={10} fill="currentColor" />
                    {business.rating} <span className="opacity-75">({business.reviewsCount})</span>
                  </span>
                )}
                {isOpen ? (
                  <span className="bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    Aberto agora
                  </span>
                ) : (
                  <span className="bg-white/20 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20">
                    Fechado
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight flex items-center gap-3">
                {business.isOfficial && <ICONS.Crown size={32} className="text-brand-orange animate-pulse" />}
                {business.name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h2 className="text-xs font-black text-brand-orange uppercase tracking-[0.3em] mb-6 border-b border-slate-200 pb-4">Sobre o Estabelecimento</h2>
              <p className="text-slate-600 text-xl leading-relaxed whitespace-pre-line font-medium">
                {business.description}
              </p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal delay-100">
                {/* Location Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-4 border-b border-slate-50 pb-4">
                    <div className="bg-brand-orange/10 p-3 rounded-xl text-brand-orange group-hover:scale-110 transition-transform duration-300">
                      <ICONS.MapPin size={24} />
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-lg font-bold text-slate-700 leading-snug min-h-[3.5rem]">{business.address}</p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-brand-orange hover:bg-brand-orange-dark px-4 py-2 rounded-full transition-colors shadow-lg shadow-brand-orange/20"
                    >
                      <ICONS.Map size={12} />
                      Abrir no Google Maps
                    </a>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-4 border-b border-slate-50 pb-4">
                    <div className="bg-brand-teal/10 p-3 rounded-xl text-brand-teal group-hover:scale-110 transition-transform duration-300">
                      <ICONS.Clock size={24} />
                    </div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funcionamento</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-slate-700 leading-relaxed">
                      {business.businessHours || 'Consulte os horários no WhatsApp'}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Horário de Brasília
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl">

              <div className="space-y-3 mb-8">
                {business.offersDelivery && (
                  <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-5 py-4 rounded-xl border border-emerald-100/50 shadow-sm">
                    <div className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm">
                      <ICONS.Truck size={18} />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest">Faz entregas na região</span>
                  </div>
                )}
                {business.offersPickup && (
                  <div className="flex items-center gap-3 bg-brand-teal/5 text-brand-teal-deep px-5 py-4 rounded-xl border border-brand-teal/10 shadow-sm">
                    <div className="bg-white p-2 rounded-lg text-brand-teal shadow-sm">
                      <ICONS.Package size={18} />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest">Retirada no Balcão</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-black py-6 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-brand-teal/20 active:scale-95 uppercase tracking-widest text-xs"
              >
                <ICONS.MessageCircle className="w-6 h-6 mr-3" />
                Enviar Mensagem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;
