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
    <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-slate-100 card-hover transition-all duration-500 group flex flex-col h-full shadow-sm hover:shadow-xl">
      <div className="relative h-28 md:h-36 overflow-hidden">
        <img
          src={business.imageUrl}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        {business.isOfficial && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-white/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-white/20">
              <img
                src="https://cdn-icons-png.flaticon.com/512/6364/6364343.png"
                className="w-4 h-4 object-contain"
                alt="Oficial"
                title="Parceiro Oficial"
              />
            </div>
          </div>
        )}

        {business.distance !== undefined && (
          <div className="absolute top-3 right-3">
            <span className="text-white text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
              <ICONS.MapPin size={10} className="text-brand-orange" />
              {formatDistance(business.distance)}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 right-3">
          {isOpen ? (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Aberto
            </span>
          ) : (
            <span className="bg-brand-orange text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">
              Fechado
            </span>
          )}
        </div>
      </div>

      <div className="p-3 md:p-4 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Link to={`/business/${business.id}`} className="block">
            <h3 className="text-sm md:text-xl font-black text-brand-teal-deep group-hover:text-brand-teal transition-colors leading-tight tracking-tight line-clamp-1 flex items-center gap-1.5">
              {business.isOfficial && <ICONS.Crown size={16} className="text-brand-orange animate-pulse shrink-0" />}
              {business.name}
            </h3>
          </Link>
        </div>

        {business.segment && (
          <p className="text-brand-orange text-[9px] font-black uppercase tracking-widest mb-2">
            {business.segment}
          </p>
        )}

        {business.rating ? (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center text-amber-500">
              <ICONS.Star size={10} fill="currentColor" />
              <span className="ml-1 text-slate-700 font-black text-[10px] md:text-xs">{business.rating}</span>
            </div>
            <span className="text-slate-400 text-[8px] md:text-[10px] font-bold">({business.reviewsCount})</span>
          </div>
        ) : null}

        <div className="space-y-1 mb-4">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.street}, ${business.number} - ${business.neighborhood}, Piracicaba - SP`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start text-slate-500 text-[10px] hover:text-brand-orange transition-colors group/address"
          >
            <ICONS.MapPin className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0 text-brand-orange group-hover/address:scale-110 transition-transform" />
            <p className="font-medium line-clamp-2">
              {business.street}, {business.number} - {business.neighborhood}
            </p>
          </a>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-50">
          {(!business.isOfficial || (business.isOfficial && business.phone.replace(/\D/g, '').length >= 12)) && (
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-black py-3 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-brand-teal/10 uppercase tracking-widest text-[10px]"
            >
              <ICONS.MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
