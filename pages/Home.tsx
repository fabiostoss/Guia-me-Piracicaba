
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Business, CategoryType, NewsArticle } from '../types';
import { ICONS, CATEGORY_ICONS, WHATSAPP_ADMIN, PIRACICABA_NEIGHBORHOODS } from '../constants';
import BusinessCard from '../components/BusinessCard';
import { getLocalNews, NEWS_MOCK } from '../services/newsService';
import { isBusinessOpen } from '../utils/businessUtils';
import { TOURIST_SPOTS } from '../services/touristService';
import { getLatestJobs } from '../services/jobService';
import { calculateDistance } from '../utils/geoUtils';
import NeighborhoodSelector from '../components/NeighborhoodSelector';

interface HomeProps {
  businesses: Business[];
  checkAuth?: (action: () => void) => void;
}

const Home: React.FC<HomeProps> = ({ businesses, checkAuth }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [latestNews, setLatestNews] = useState<NewsArticle[]>(NEWS_MOCK);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // Tenta atualizar com notícias reais, se falhar, mantém o mock (que já está no estado inicial)
    getLocalNews().then(news => {
      if (news && news.length > 0) {
        setLatestNews(news);
      }
    });

    // Recupera localização do cache se existir para resposta imediata
    const cachedLocation = localStorage.getItem('user_location');
    if (cachedLocation) {
      try {
        setUserLocation(JSON.parse(cachedLocation));
      } catch (e) {
        console.error('Error parsing cached location', e);
      }
    }

    // Request location automatically on mount
    const requestLocation = () => {
      if (!navigator.geolocation) return;

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);
          localStorage.setItem('user_location', JSON.stringify(coords));
          setIsLocating(false);
        },
        () => setIsLocating(false),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    requestLocation();
  }, []);

  // Intersection Observer para animações
  const observerRef = useRef<IntersectionObserver | null>(null);

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
  }, [searchTerm, selectedCategory]);

  // 1. Primeiro, enriquecer TODOS os negócios com distância, se a localização estiver disponível
  const businessesWithDistance = useMemo(() => {
    if (!userLocation) return businesses;

    console.log('Calculando distâncias para', businesses.length, 'lojas...');
    return businesses.map(b => {
      if (b.latitude !== undefined && b.latitude !== null && b.longitude !== undefined && b.longitude !== null) {
        const distance = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return { ...b, distance };
      }
      return b;
    });
  }, [businesses, userLocation]);

  // 2. Filtrar os negócios já enriquecidos com distância
  const filteredBusinesses = useMemo(() => {
    let result = businessesWithDistance.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory ? b.category === selectedCategory : true;
      const matchesNeighborhood = selectedNeighborhood ? b.neighborhood === selectedNeighborhood : true;
      const isActive = b.isActive !== false;

      return matchesSearch && matchesCategory && matchesNeighborhood && isActive;
    });

    // Ordenar por distância se disponível
    if (userLocation) {
      result.sort((a, b) => {
        const distA = (a as any).distance ?? 9999;
        const distB = (b as any).distance ?? 9999;
        return distA - distB;
      });
    }

    return result;
  }, [businessesWithDistance, searchTerm, selectedCategory, selectedNeighborhood, userLocation]);

  const featuredSpots = (TOURIST_SPOTS || []).slice(0, 3);
  const recentJobs = (getLatestJobs() || []).slice(0, 4);

  const getTouristIcon = (category: string, size: number = 24) => {
    switch (category) {
      case 'Parque': return <ICONS.MapPin size={size} />;
      case 'Cultura': return <ICONS.Palette size={size} />;
      case 'História': return <ICONS.Theater size={size} />;
      case 'Lazer': return <ICONS.Ticket size={size} />;
      default: return <ICONS.MapPin size={size} />;
    }
  };

  return (
    <div className="space-y-0 pb-0">
      {/* Hero Section - Animação Inicial */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 md:pt-24 md:pb-32 animate-fade-in">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-teal/5 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl space-y-8 text-center md:text-left animate-slide-up">
            <span className="text-brand-orange text-xs font-black uppercase tracking-[0.5em] block mb-4">Marketplace Oficial Piracicaba</span>
            <h1 className="text-3xl md:text-8xl font-black text-brand-teal-deep tracking-tighter leading-[0.9]">
              Encontre tudo em <span className="text-brand-orange">Piracicaba</span>, resolva no Zap.
            </h1>
            <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl">
              O guia definitivo que une agilidade e orgulho local. Conexão direta com quem faz Piracicaba crescer.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              {isLocating && (
                <div className="flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 animate-pulse">
                  <ICONS.MapPin size={14} className="animate-bounce" />
                  Localizando Lojas Próximas...
                </div>
              )}
              {userLocation && (
                <div className="flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ICONS.MapPin size={14} />
                  Lojas mais próximas de você
                </div>
              )}
            </div>

            {/* Search Bar - Enhanced Visual Design */}
            <div className="relative max-w-3xl mx-auto md:mx-0 pt-4">
              <div className="flex flex-col gap-6">
                {/* Multi-layered shadow container with hover effects */}
                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-visible p-4 md:p-2 flex flex-col md:flex-row gap-2 border border-slate-200/50 ring-1 ring-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15),0_10px_25px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.2),0_15px_35px_-10px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-all duration-500 ease-out backdrop-blur-sm group">

                  {/* Search Input Section */}
                  <div className="flex-grow relative flex items-center px-6 py-4 md:border-r border-slate-200 group/input">
                    <ICONS.Search className="text-slate-400 mr-4 group-hover/input:text-brand-teal transition-colors duration-300" size={24} />
                    <input
                      type="text"
                      placeholder="O que você procura?"
                      className="w-full text-lg font-bold outline-none text-slate-700 bg-transparent placeholder:text-slate-400 focus:placeholder:text-slate-500 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Neighborhood Selector Section */}
                  <div className="flex items-center px-6 py-4 md:min-w-[240px] group/select relative bg-slate-50/50 md:bg-transparent rounded-2xl md:rounded-none">
                    <ICONS.MapPin className="text-brand-orange mr-4 group-hover/select:scale-110 transition-transform duration-300" size={20} />
                    <div className="flex-grow flex flex-col min-w-0 pointer-events-auto">
                      <span className="text-slate-400 font-black text-[8px] uppercase tracking-widest mb-1 text-left">Filtrar por Bairro</span>
                      <NeighborhoodSelector
                        value={selectedNeighborhood}
                        onChange={setSelectedNeighborhood}
                        placeholder="Todos os Bairros"
                        triggerClassName="bg-transparent text-slate-700 font-bold outline-none cursor-pointer text-left hover:text-brand-teal transition-colors"
                        dropdownClassName="min-w-[280px] left-0"
                      />
                    </div>
                  </div>

                  {/* Enhanced Search Button with Gradient Hover */}
                  <button className="relative bg-brand-teal text-white px-10 py-5 rounded-2xl font-black text-sm transition-all duration-300 active:scale-95 shadow-lg shadow-brand-teal/30 uppercase tracking-widest whitespace-nowrap overflow-hidden group/button hover:shadow-xl hover:shadow-brand-teal/40 hover:scale-105">
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-teal via-brand-teal-dark to-brand-teal opacity-0 group-hover/button:opacity-100 transition-opacity duration-300"></div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover/button:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      Buscar
                      <ICONS.Search className="group-hover/button:rotate-12 transition-transform duration-300" size={16} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Business Grid */}
      <section className="bg-slate-50 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-30 mb-20 reveal">
          <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-x-auto no-scrollbar">
            <div className="flex gap-4 md:gap-10">
              {Object.values(CategoryType).map((category, idx) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={`flex flex-col items-center group transition-all shrink-0 reveal stagger-${(idx % 4) + 1}`}
                >
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all border-2 mb-4 ${selectedCategory === category ? 'bg-brand-teal border-brand-teal text-white shadow-xl scale-110' : 'bg-slate-50 border-transparent text-brand-teal-deep hover:bg-slate-100'}`}>
                    {React.cloneElement(CATEGORY_ICONS[category] as React.ReactElement<any>, { className: "w-6 h-6 md:w-8 md:h-8" })}
                  </div>
                  <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest text-center ${selectedCategory === category ? 'text-brand-teal' : 'text-slate-400'}`}>{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
            {filteredBusinesses.map((biz, idx) => (
              <div key={biz.id} className={`reveal stagger-${(idx % 3) + 1}`}>
                <BusinessCard business={biz} checkAuth={checkAuth} />
              </div>
            ))}
          </div>
          {filteredBusinesses.length === 0 && (
            <div className="text-center py-20 animate-fade-in">
              <ICONS.Search size={60} className="mx-auto text-slate-200 mb-6" />
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Nenhum resultado encontrado para sua busca.</p>
            </div>
          )}
        </div>
      </section>

      {/* Vagas Section (Dark) - Adicionado Botão "Ver Todas" */}
      <section className="bg-slate-900 py-16 md:py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col justify-center items-center mb-10 md:mb-16 gap-8 reveal">
            <div className="text-center">
              <h2 className="text-3xl md:text-7xl font-black tracking-tighter">Vagas em <span className="text-brand-teal">Pira</span></h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 md:mt-4">Oportunidades em Piracicaba</p>
            </div>
            <Link to="/vagas" className="hidden md:flex items-center gap-3 text-brand-teal font-black uppercase tracking-widest text-xs hover:text-white transition-colors">
              Ver todas as vagas <ICONS.ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {recentJobs.map((job, idx) => (
              <div key={job.id} className={`bg-white/5 backdrop-blur-sm p-5 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-white/10 hover:border-brand-teal/50 transition-all group reveal stagger-${idx + 1}`}>
                <div className="bg-brand-teal/20 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-teal mb-4 md:mb-8 group-hover:scale-110 transition-transform">
                  <ICONS.Briefcase size={20} />
                </div>
                <h3 className="text-sm md:text-2xl font-black mb-1 md:mb-2 leading-tight line-clamp-2">{job.role}</h3>
                <p className="text-brand-orange text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-3 md:mb-6 line-clamp-1">{job.company}</p>
                <Link to="/vagas" className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-teal transition-colors">Detalhes</Link>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center reveal">
            <Link to="/vagas" className="inline-flex items-center gap-4 bg-brand-teal text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-teal/20 hover:bg-brand-teal-dark hover:scale-105 active:scale-95 transition-all">
              Ver Todas as Vagas <ICONS.ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Guia Turístico Section */}
      <section className="bg-white py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-16 reveal">
            <h2 className="text-3xl md:text-7xl font-black text-brand-teal-deep tracking-tighter leading-none">Turismo em <span className="text-brand-orange">Pira</span></h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4 md:mt-6">Descubra Piracicaba</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {featuredSpots.map((spot, idx) => (
              <div key={spot.id} className={`bg-slate-50 rounded-3xl md:rounded-[2rem] p-4 md:p-6 border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center reveal stagger-${idx + 1}`}>
                <div className="bg-brand-teal/10 w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-teal mb-4 md:mb-6 group-hover:bg-brand-teal group-hover:text-white group-hover:scale-110 transition-all duration-500">
                  {getTouristIcon(spot.category, 24)}
                </div>
                <div className="space-y-2 md:space-y-3">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-brand-orange">{spot.category}</span>
                  <h3 className="text-xs md:text-xl font-black text-brand-teal-deep group-hover:text-brand-teal transition-colors leading-tight line-clamp-1">{spot.name.replace(/^\d+\.\s*/, '')}</h3>
                  <p className="hidden md:block text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed">{spot.description}</p>
                </div>
                <Link to="/guia-turistico" className="mt-4 md:mt-6 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-brand-teal-deep hover:text-brand-orange transition-colors flex items-center gap-2">
                  Ver Mais <ICONS.ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Seção de Notícias */}
      <section className="py-16 md:py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center mb-10 md:mb-16 gap-8 reveal">
            <div className="max-w-2xl text-center">
              <h2 className="text-3xl md:text-6xl font-black text-brand-teal-deep tracking-tighter leading-none mb-4 md:mb-6">
                Notícias da <span className="text-brand-orange">Região</span>
              </h2>
              <p className="text-slate-500 font-medium text-lg max-w-xl">
                Acompanhe o que está acontecendo em Piracicaba e fique por dentro das novidades.
              </p>
            </div>
            <Link
              to="/noticias"
              className="group flex items-center gap-3 text-brand-teal font-black text-xs uppercase tracking-widest hover:text-brand-orange transition-colors"
            >
              Ver todas as notícias
              <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                <ICONS.ArrowRight size={14} />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {latestNews.slice(0, 3).map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`group bg-white rounded-2xl md:rounded-3xl p-3 md:p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full reveal stagger-${idx + 1}`}
              >
                <div className="h-32 md:h-48 rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-6 relative">
                  <div className="absolute inset-0 bg-brand-teal/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[7px] md:text-[9px] font-black uppercase tracking-widest text-brand-teal-deep shadow-sm">
                    {item.date}
                  </div>
                </div>
                <h3 className="text-[11px] md:text-xl font-bold text-slate-800 mb-2 md:mb-4 group-hover:text-brand-teal transition-colors line-clamp-2 md:line-clamp-3 leading-tight">
                  {item.title}
                </h3>
                <p className="hidden md:block text-slate-500 text-sm font-medium line-clamp-3 mb-6 flex-1">
                  {item.summary}
                </p>
                <div className="flex items-center text-[7px] md:text-[10px] font-black text-brand-orange uppercase tracking-widest mt-auto">
                  Ler tudo <ICONS.ExternalLink size={10} className="ml-1 md:ml-2" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
