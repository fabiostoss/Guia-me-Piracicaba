import React from 'react';
import { Link } from 'react-router-dom';
import { Business } from '../types';
import { ICONS, WHATSAPP_MSG_DEFAULT } from '../constants';
import { isBusinessOpen } from '../utils/businessUtils';
import { formatDistance } from '../utils/geoUtils';

interface BusinessCardProps {
  business: Business & { distance?: number };
  checkAuth?: (action: () => void) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business, checkAuth }) => {
  const whatsappUrl = `https://wa.me/${business.phone}?text=${encodeURIComponent(WHATSAPP_MSG_DEFAULT)}`;
  const isOpen = isBusinessOpen(business.schedule);

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
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 card-hover transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-xl">
      <div className="relative h-56 overflow-hidden">
        <img
          src={business.imageUrl}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        {business.isOfficial && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-white/20">
              <img
                src="https://cdn-icons-png.flaticon.com/512/6364/6364343.png"
                className="w-5 h-5 object-contain"
                alt="Oficial"
                title="Parceiro Oficial"
              />
            </div>
          </div>
        )}

        {business.distance !== undefined && (
          <div className="absolute top-4 right-4">
            <span className="text-white text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
              <ICONS.MapPin size={10} className="text-brand-orange" />
              {formatDistance(business.distance)}
            </span>
          </div>
        )}

        <div className="absolute bottom-4 right-4">
          {isOpen ? (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Aberto
            </span>
          ) : (
            <span className="bg-brand-orange text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg">
              Fechado
            </span>
          )}
        </div>
      </div>

      <div className="p-8 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Link to={`/business/${business.id}`} className="block">
            <h3 className="text-2xl font-black text-brand-teal-deep group-hover:text-brand-teal transition-colors leading-tight tracking-tight">
              {business.name}
            </h3>
          </Link>
        </div>

        {business.segment && (
          <p className="text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            {business.segment}
          </p>
        )}

        {business.rating ? (
          <div className="flex items-center gap-1 mb-4">
            <div className="flex items-center text-amber-500">
              <ICONS.Star size={14} fill="currentColor" />
              <span className="ml-1.5 text-slate-700 font-black text-sm">{business.rating}</span>
            </div>
            <span className="text-slate-400 text-[10px] font-bold">({business.reviewsCount} avaliações)</span>
          </div>
        ) : null}

        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
          {business.description}
        </p>

        <div className="space-y-3 mb-8">
          <a
            href={business.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.street}, ${business.number} - ${business.neighborhood}, Piracicaba - SP`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start text-slate-400 text-xs hover:text-brand-orange transition-colors group/address"
          >
            <ICONS.MapPin className="w-4 h-4 mr-3 flex-shrink-0 text-brand-orange group-hover/address:scale-110 transition-transform" />
            <div className="flex flex-col gap-1 min-w-0">
              <p className="font-bold truncate">
                {business.street}, {business.number} - {business.neighborhood}
              </p>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Clique para ver no mapa</span>
            </div>
          </a>
          <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <ICONS.Eye className="w-4 h-4 mr-3 text-brand-teal" />
            {business.views || 0} Visualizações
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50">
          {(!business.isOfficial || (business.isOfficial && business.phone.replace(/\D/g, '').length >= 12)) && (
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-black py-4 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-teal/10 uppercase tracking-widest text-[9px]"
            >
              <ICONS.MessageCircle className="w-4 h-4 mr-2" />
              Falar no WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
