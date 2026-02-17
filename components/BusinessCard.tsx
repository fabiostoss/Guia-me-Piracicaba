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
      <div className="relative h-20 md:h-28 overflow-hidden">
        <img
          src={business.imageUrl}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        {business.isOfficial && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-white/90 backdrop-blur-md p-0.5 rounded-full shadow-lg border border-white/20">
              <img
                src="https://cdn-icons-png.flaticon.com/512/6364/6364343.png"
                className="w-3.5 h-3.5 object-contain"
                alt="Oficial"
                title="Parceiro Oficial"
              />
            </div>
          </div>
        )}

        {business.distance !== undefined && (
          <div className="absolute top-2 right-2">
            <span className="text-white text-[7px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
              <ICONS.MapPin size={7} className="text-brand-orange" />
              {formatDistance(business.distance)}
            </span>
          </div>
        )}

        <div className="absolute bottom-2 right-2">
          {isOpen ? (
            <span className="bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest flex items-center gap-1 shadow-lg">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
              Aberto
            </span>
          ) : (
            <span className="bg-brand-orange text-white text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-lg">
              Fechado
            </span>
          )}
        </div>
      </div>

      <div className="p-2 md:p-3 flex-grow flex flex-col">
        <div className="flex items-center gap-2 mb-0.5">
          <Link to={`/business/${business.id}`} className="block">
            <h3 className="text-[10px] md:text-base font-black text-brand-teal-deep group-hover:text-brand-teal transition-colors leading-tight tracking-tight line-clamp-1">
              {business.name}
            </h3>
          </Link>
        </div>

        {business.segment && (
          <p className="text-brand-orange text-[7px] font-black uppercase tracking-widest mb-1.5">
            {business.segment}
          </p>
        )}

        {business.rating ? (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center text-amber-500">
              <ICONS.Star size={7} fill="currentColor" />
              <span className="ml-0.5 text-slate-700 font-black text-[7px] md:text-[10px]">{business.rating}</span>
            </div>
            <span className="text-slate-400 text-[6px] md:text-[8px] font-bold">({business.reviewsCount})</span>
          </div>
        ) : null}

        <div className="space-y-0.5 mb-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.street}, ${business.number} - ${business.neighborhood}, Piracicaba - SP`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-slate-400 text-[7px] hover:text-brand-orange transition-colors group/address"
          >
            <ICONS.MapPin className="w-2 h-2 mr-1 flex-shrink-0 text-brand-orange group-hover/address:scale-110 transition-transform" />
            <p className="font-bold truncate">
              {business.neighborhood}
            </p>
          </a>
        </div>

        <div className="mt-auto pt-2 border-t border-slate-50">
          {(!business.isOfficial || (business.isOfficial && business.phone.replace(/\D/g, '').length >= 12)) && (
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-brand-teal hover:bg-brand-teal-dark text-white font-black py-2 rounded-lg flex items-center justify-center transition-all shadow-lg shadow-brand-teal/10 uppercase tracking-widest text-[7px]"
            >
              <ICONS.MessageCircle className="w-2.5 h-2.5 mr-1" />
              WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
