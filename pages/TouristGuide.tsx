
import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';
import { TOURIST_SPOTS, fetchLiveEventsFromWeb } from '../services/touristService';
import { TouristSpot, TouristEvent } from '../types';

const TouristGuide: React.FC = () => {
  const [spots] = useState<TouristSpot[]>(TOURIST_SPOTS);


  return (
    <div className="pb-24">
      {/* Hero Guide */}
      <section className="bg-brand-teal-deep pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-brand-orange text-xs font-black uppercase tracking-[0.4em] mb-4 block">Guia de Experiências</span>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none">VIVA <span className="text-brand-orange">PIRACICABA</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
            Exploração urbana focada no que importa: história, cultura e lazer em Piracicaba.
          </p>
        </div>
      </section>


      <section className="max-w-7xl mx-auto px-4 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {spots.map((spot, index) => (
            <div key={spot.id} className="bg-white rounded-3xl p-6 border border-slate-200 group hover:shadow-2xl transition-all duration-500 flex flex-col h-full animate-in fade-in zoom-in">
              <div className="flex justify-between items-start mb-6">
                <div className="text-4xl font-black text-slate-200 group-hover:text-brand-teal/20 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <span className="bg-slate-50 text-brand-teal text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-brand-teal/10">
                  {spot.category}
                </span>
              </div>

              <h3 className="text-2xl font-black text-brand-teal-deep mb-4 group-hover:text-brand-teal transition-colors leading-tight">{spot.name}</h3>
              <p className="text-slate-600 font-medium text-base leading-relaxed mb-6">{spot.description}</p>

              <div className="pt-6 border-t border-slate-50 flex flex-col gap-4 mt-auto">
                <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <ICONS.MapPin size={16} className="mr-2 text-brand-orange" />
                  {spot.address}
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-2 h-2 bg-emerald-500 rounded-full"></div>)}
                  <span className="text-[9px] font-black text-emerald-600 ml-2 uppercase tracking-widest">Recomendado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TouristGuide;
