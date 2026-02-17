
import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../constants';
import { TOURIST_SPOTS, fetchLiveEventsFromWeb } from '../services/touristService';
import { TouristSpot, TouristEvent } from '../types';

const TouristGuide: React.FC = () => {
  const [spots] = useState<TouristSpot[]>(TOURIST_SPOTS);
  const [events, setEvents] = useState<TouristEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'spots' | 'events'>('spots');
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (activeTab === 'events' && events.length === 0) {
      handleRefreshEvents();
    }
  }, [activeTab]);

  const handleRefreshEvents = async () => {
    setIsExtracting(true);
    const result = await fetchLiveEventsFromWeb();
    setEvents(result.events);
    setIsExtracting(false);
  };

  const groupedEvents = useMemo(() => {
    const groups: Record<string, TouristEvent[]> = {};

    // Ordenar eventos por data antes de agrupar
    const sortedEvents = [...events].sort((a, b) => a.dateIso.localeCompare(b.dateIso));

    sortedEvents.forEach(event => {
      const dateParts = event.dateIso.split('-');
      if (dateParts.length >= 2) {
        const year = dateParts[0];
        const monthNum = parseInt(dateParts[1]);
        const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2026, monthNum - 1));
        const key = `${monthName} ${year}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
      }
    });

    return groups;
  }, [events]);

  const getEventIcon = (title: string, type: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('carnaval') || lowerTitle.includes('bloco') || lowerTitle.includes('folia')) return <ICONS.Theater className="text-brand-orange" size={32} />;
    if (lowerTitle.includes('jazz') || lowerTitle.includes('rock') || lowerTitle.includes('musical') || lowerTitle.includes('concerto') || lowerTitle.includes('candlelight')) return <ICONS.Music className="text-brand-teal" size={32} />;
    if (lowerTitle.includes('circo') || lowerTitle.includes('humor')) return <ICONS.PartyPopper className="text-brand-orange" size={32} />;
    if (lowerTitle.includes('exposição') || lowerTitle.includes('galeria')) return <ICONS.Palette className="text-brand-teal" size={32} />;
    return <ICONS.CalendarDays className="text-slate-300" size={32} />;
  };

  return (
    <div className="pb-24">
      {/* Hero Guide */}
      <section className="bg-brand-teal-deep pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-brand-orange text-xs font-black uppercase tracking-[0.4em] mb-4 block">Guia de Experiências</span>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none">VIVA <span className="text-brand-orange">PIRACICABA</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto font-bold text-lg leading-relaxed">
            Exploração urbana focada no que importa: história, cultura e lazer na Noiva da Colina.
          </p>
        </div>
      </section>

      {/* Navigation */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white p-2 rounded-3xl shadow-2xl border border-slate-100 flex justify-center gap-2 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('spots')}
            className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'spots' ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' : 'text-slate-400 hover:text-brand-teal'}`}
          >
            Destinos Locais
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'events' ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' : 'text-slate-400 hover:text-brand-teal'}`}
          >
            Agenda Cultural
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-24">
        {activeTab === 'spots' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {spots.map((spot, index) => (
              <div key={spot.id} className="bg-white rounded-[2.5rem] p-10 border border-slate-200 group hover:shadow-2xl transition-all duration-500 flex flex-col h-full animate-in fade-in zoom-in">
                <div className="flex justify-between items-start mb-10">
                  <div className="text-6xl font-black text-slate-200 group-hover:text-brand-teal/20 transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <span className="bg-slate-100 text-brand-teal text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-brand-teal/10">
                    {spot.category}
                  </span>
                </div>

                <h3 className="text-3xl font-black text-brand-teal-deep mb-6 group-hover:text-brand-teal transition-colors leading-tight">{spot.name}</h3>
                <p className="text-slate-600 font-medium text-lg leading-relaxed mb-10">{spot.description}</p>

                <div className="pt-8 border-t border-slate-50 flex flex-col gap-6 mt-auto">
                  <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <ICONS.MapPin size={18} className="mr-3 text-brand-orange" />
                    {spot.address}
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <div key={s} className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>)}
                    <span className="text-[10px] font-black text-emerald-600 ml-3 uppercase tracking-widest">Recomendado</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-10">
                <h2 className="text-3xl font-black text-brand-teal-deep">Agenda 2026</h2>
                <button onClick={handleRefreshEvents} disabled={isExtracting} className="bg-brand-orange text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all">
                  {isExtracting ? "Carregando..." : "Atualizar"}
                </button>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <p className="text-slate-500 font-medium leading-relaxed italic text-sm">
                  Confira o calendário completo de Piracicaba. Eventos organizados por mês para facilitar sua programação cultural na cidade.
                </p>
              </div>
            </div>

            {Object.keys(groupedEvents).length > 0 ? (
              <div className="space-y-24">
                {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                  <div key={month} className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-6">
                      <div className="w-4 h-12 bg-brand-orange rounded-full"></div>
                      <h3 className="text-4xl font-black text-brand-teal-deep uppercase tracking-tighter whitespace-nowrap drop-shadow-sm">{month}</h3>
                      <div className="h-px bg-slate-200 flex-grow"></div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Fix: Explicitly cast monthEvents to TouristEvent[] to prevent 'unknown' type error during mapping */}
                      {(monthEvents as TouristEvent[]).map((event) => (
                        <div key={event.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all flex items-start gap-10 group relative overflow-hidden">
                          {/* Decorative Background Icon */}
                          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                            {getEventIcon(event.title, event.type)}
                          </div>

                          {/* Main Event Icon Box */}
                          <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-brand-teal group-hover:text-white transition-all duration-500 shadow-inner">
                            {getEventIcon(event.title, event.type)}
                          </div>

                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[9px] font-black text-brand-teal uppercase tracking-widest bg-brand-teal/5 px-4 py-1.5 rounded-full border border-brand-teal/10">{event.type}</span>
                              <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-brand-orange shadow-sm">
                                <ICONS.Ticket size={18} />
                              </div>
                            </div>

                            <h4 className="text-2xl font-black text-brand-teal-deep mb-4 leading-tight group-hover:text-brand-teal transition-colors tracking-tight">{event.title}</h4>

                            {/* Integrated Date and Description */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 bg-brand-orange/5 w-fit px-4 py-2 rounded-xl border border-brand-orange/10">
                                <ICONS.CalendarDays size={16} className="text-brand-orange" />
                                <span className="text-brand-orange text-xs font-black uppercase tracking-widest">{event.date}</span>
                              </div>
                              <p className="text-slate-500 text-base font-medium leading-relaxed">{event.description}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-3 border border-slate-100">
                                <ICONS.MapPin size={14} className="text-brand-orange" />
                              </div>
                              {event.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <ICONS.Search className="mx-auto text-slate-100 mb-6" size={60} />
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Clique em atualizar para carregar a agenda de 2026</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default TouristGuide;
