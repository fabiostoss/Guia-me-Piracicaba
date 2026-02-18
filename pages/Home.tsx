
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Business, CategoryType, NewsArticle } from '../types';
import { ICONS, CATEGORY_ICONS, WHATSAPP_ADMIN, PIRACICABA_NEIGHBORHOODS } from '../constants';
import BusinessCard from '../components/BusinessCard';
import { getLocalNews, NEWS_MOCK } from '../services/newsService';
import { isBusinessOpen } from '../utils/businessUtils';
import { TOURIST_SPOTS } from '../services/touristService';
import { getLatestJobs } from '../services/jobService';
import { calculateDistance, formatDistance } from '../utils/geoUtils';
import NeighborhoodSelector from '../components/NeighborhoodSelector';

interface HomeProps {
  businesses: Business[];
  checkAuth?: (action: () => void) => void;
}

const Home: React.FC<HomeProps> = ({ businesses, checkAuth }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [is24hOnly, setIs24hOnly] = useState(false);
  const [isDeliveryOnly, setIsDeliveryOnly] = useState(false);
  const [isPickupOnly, setIsPickupOnly] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>(NEWS_MOCK);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isNearestActive, setIsNearestActive] = useState(false);
  const [currentSponsorIndex, setCurrentSponsorIndex] = useState(0);
  const [visibleSponsors, setVisibleSponsors] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  const sponsorBusinesses = useMemo(() =>
    businesses.filter(b => b.isSponsor && b.isActive),
    [businesses]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setVisibleSponsors(1);
      else if (window.innerWidth < 1024) setVisibleSponsors(2);
      else setVisibleSponsors(3);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (sponsorBusinesses.length <= visibleSponsors || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSponsorIndex(prev => {
        const next = prev + 1;
        return next >= sponsorBusinesses.length ? 0 : next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [sponsorBusinesses.length, visibleSponsors, isPaused]);

  // Refs para controle de scroll
  const categoriesRef = useRef<HTMLDivElement>(null);
  const shopsRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);
  const tourismRef = useRef<HTMLDivElement>(null);
  const newsRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const isMobile = window.innerWidth < 768;
      const scrollAmount = direction === 'left' ? (isMobile ? -222 : -336) : (isMobile ? 222 : 336);
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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

    // Request location
    const requestLocation = (isManual = false) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocalização não suportada');
        return;
      }

      setIsLocating(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(coords);
          localStorage.setItem('user_location', JSON.stringify(coords));
          setIsLocating(false);
          setLocationError(null);
        },
        (error) => {
          setIsLocating(false);
          if (isManual) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                setLocationError('Permissão negada. Ative nas configurações do navegador.');
                break;
              case error.POSITION_UNAVAILABLE:
                setLocationError('Sinal de GPS indisponível.');
                break;
              case error.TIMEOUT:
                setLocationError('Tempo esgotado. Tente novamente em local aberto.');
                break;
              default:
                setLocationError('Não foi possível obter sua localização.');
            }
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
      );
    };

    if (!cachedLocation) {
      requestLocation(false);
    }

    // Export function to be used by the component
    (window as any).refreshLocation = () => requestLocation(true);
  }, []);

  useEffect(() => {
    if (userLocation) {
      setIsNearestActive(true);
    }
  }, [userLocation]);

  const handleManualLocation = () => {
    if (typeof (window as any).refreshLocation === 'function') {
      (window as any).refreshLocation();
    }
  };

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

      // Filtro especial para categorias OFICIAIS e PATROCINADORES
      let matchesCategory = true;
      if (selectedCategory === CategoryType.OFICIAIS) {
        matchesCategory = b.isOfficial === true;
      } else if (selectedCategory === CategoryType.PATROCINADORES) {
        matchesCategory = b.isSponsor === true;
      } else if (selectedCategory) {
        matchesCategory = b.category === selectedCategory;
      }

      const matchesNeighborhood = selectedNeighborhood ? b.neighborhood === selectedNeighborhood : true;
      const matches24h = is24hOnly ? b.is24h === true : true;
      const matchesDelivery = isDeliveryOnly ? b.offersDelivery === true : true;
      const matchesPickup = isPickupOnly ? b.offersPickup === true : true;
      const isActive = b.isActive !== false;

      return matchesSearch && matchesCategory && matchesNeighborhood && matches24h && matchesDelivery && matchesPickup && isActive;
    });

    // Ordenar por distância se disponível e ativo
    if (userLocation && isNearestActive) {
      result.sort((a, b) => {
        const distA = (a as any).distance ?? 9999;
        const distB = (b as any).distance ?? 9999;
        return distA - distB;
      });
    }

    return result;
  }, [businessesWithDistance, searchTerm, selectedCategory, selectedNeighborhood, is24hOnly, isDeliveryOnly, isPickupOnly, userLocation]);

  const featuredSpots = (TOURIST_SPOTS || []).slice(0, 3);
  const recentJobs = (getLatestJobs() || []).slice(0, 4);

  const touristRoutes = [
    {
      id: 1,
      name: "Rota Gastronômica",
      description: "Sabores da Rua do Porto e culinária típica caipira.",
      icon: <ICONS.Coffee size={24} />,
      color: "bg-orange-50 text-orange-500",
      bgGradient: "from-orange-400 via-orange-500 to-orange-600",
      query: "Gastronomia"
    },
    {
      id: 2,
      name: "Roteiro Histórico",
      description: "Engenho Central, Museus e a arquitetura do século XIX.",
      icon: <ICONS.Landmark size={24} />,
      color: "bg-amber-50 text-amber-600",
      bgGradient: "from-amber-500 via-amber-600 to-amber-700",
      query: "História"
    },
    {
      id: 3,
      name: "Natureza & Lazer",
      description: "Tanquã, Horto Florestal e parques com paisagens incríveis.",
      icon: <ICONS.Mountain size={24} />,
      color: "bg-emerald-50 text-emerald-600",
      bgGradient: "from-emerald-400 via-emerald-500 to-teal-600",
      query: "Lazer"
    },
    {
      id: 4,
      name: "Rota Cervejeira",
      description: "Deguste as melhores cervejas artesanais produzidas em Pira.",
      icon: <ICONS.Beer size={24} />,
      color: "bg-yellow-50 text-yellow-600",
      bgGradient: "from-yellow-500 via-amber-500 to-orange-500",
      query: "Gastronomia"
    }
  ];

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
      <section className="relative bg-white pt-10 pb-16 md:pt-16 md:pb-24 animate-fade-in z-50">
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


          </div>
        </div>
      </section>

      {/* Patrocinadores Section */}
      {businesses.filter(b => b.isSponsor && b.isActive).length > 0 && (
        <section className="bg-gradient-to-br from-brand-orange/5 via-white to-brand-teal/5 py-12 md:py-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center mb-10 reveal">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange/10 rounded-full border border-brand-orange/20 mb-4">
                <ICONS.Star className="text-brand-orange animate-pulse" size={20} />
                <span className="text-brand-orange text-xs font-black uppercase tracking-[0.3em]">Parceiros Patrocinadores</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-brand-teal-deep tracking-tight mb-3">
                Empresas em <span className="text-brand-orange">Destaque</span>
              </h2>
              <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                Conheça os parceiros que impulsionam o Guia-me Piracicaba
              </p>
            </div>

            <div
              className="relative overflow-hidden -mx-4 px-4 pb-8 group/carousel"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out gap-6"
                style={{
                  transform: `translateX(-${currentSponsorIndex * (100 / visibleSponsors)}%)`,
                  width: '100%'
                }}
              >
                {/* 
                  Repetimos alguns itens para garantir que o espaço final não fique vazio ao mover
                */}
                {sponsorBusinesses.concat(sponsorBusinesses.slice(0, visibleSponsors)).map((biz, idx) => {
                  const isOpen = isBusinessOpen(biz.schedule);
                  const distance = userLocation
                    ? (biz.latitude && biz.longitude ? calculateDistance(userLocation.lat, userLocation.lng, biz.latitude, biz.longitude) : undefined)
                    : undefined;

                  return (
                    <div
                      key={`${biz.id}-${idx}`}
                      className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] group relative shrink-0"
                    >
                      {/* Badge Patrocinador */}
                      <div className="absolute -top-3 -left-3 z-20 bg-brand-orange text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand-orange/30 flex items-center gap-1.5 animate-bounce-subtle">
                        <ICONS.Star size={12} className="animate-pulse" />
                        Patrocinador
                      </div>

                      {/* Card */}
                      <div className="bg-white rounded-[2rem] overflow-hidden border-2 border-brand-orange/20 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-brand-orange/40 flex flex-col h-full">
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-teal/10 to-brand-orange/10">
                          <img
                            src={biz.imageUrl}
                            alt={biz.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                          {/* Logo overlay */}
                          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-xl overflow-hidden border-4 border-white shadow-lg z-10">
                            <img src={biz.logoUrl} alt={biz.name} className="w-full h-full object-cover" />
                          </div>

                          {/* Distance Badge */}
                          {distance !== undefined && (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="text-white text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                                <ICONS.MapPin size={10} className="text-brand-orange" />
                                {formatDistance(distance)}
                              </span>
                            </div>
                          )}

                          {/* Open Status Badge */}
                          <div className="absolute bottom-4 right-4 z-10">
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

                        {/* Content */}
                        <div className="p-6 flex-grow flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-grow">
                              <Link to={`/business/${biz.id}`} className="block">
                                <h3 className="text-xl font-black text-brand-teal-deep mb-1 group-hover:text-brand-orange transition-colors flex items-center gap-2">
                                  <ICONS.Crown size={20} className="text-brand-orange animate-pulse" />
                                  {biz.name}
                                </h3>
                              </Link>

                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <ICONS.Tag size={12} className="text-brand-teal" />
                                  {biz.category}
                                </div>
                                {biz.rating && (
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <ICONS.Star size={10} fill="currentColor" />
                                    <span className="text-slate-700 font-black text-[10px]">{biz.rating}</span>
                                    <span className="text-slate-400 text-[9px]">({biz.reviewsCount})</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 font-medium mb-4 line-clamp-2">
                            {biz.description}
                          </p>

                          {/* Address */}
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <ICONS.MapPin size={12} className="text-brand-orange min-w-[12px]" />
                            <span className="truncate">{biz.street}, {biz.number} - {biz.neighborhood}</span>
                          </div>

                          <div className="mt-auto space-y-3">
                            {/* Badges Delivery/Pickup */}
                            <div className="flex gap-2">
                              {biz.offersDelivery && (
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-100 flex items-center gap-1">
                                  <ICONS.Truck size={10} /> Delivery
                                </span>
                              )}
                              {biz.offersPickup && (
                                <span className="px-2 py-1 bg-brand-teal/5 text-brand-teal text-[8px] font-black uppercase tracking-widest rounded-md border border-brand-teal/10 flex items-center gap-1">
                                  <ICONS.Package size={10} /> Retirada
                                </span>
                              )}
                            </div>

                            {/* CTA Button */}
                            <Link
                              to={`/business/${biz.id}`}
                              className="w-full bg-gradient-to-r from-brand-teal to-brand-teal-dark text-white py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all group/btn"
                            >
                              <ICONS.MessageCircle size={16} className="group-hover/btn:animate-bounce" />
                              Ver Detalhes
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botões de Navegação Lateral */}
              {sponsorBusinesses.length > visibleSponsors && (
                <>
                  <button
                    onClick={() => setCurrentSponsorIndex(prev => prev === 0 ? sponsorBusinesses.length - 1 : prev - 1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl border border-slate-100 text-brand-teal opacity-0 group-hover/carousel:opacity-100 transition-all -translate-x-4 group-hover/carousel:translate-x-6 hover:bg-brand-orange hover:text-white"
                  >
                    <ICONS.ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setCurrentSponsorIndex(prev => (prev + 1) % sponsorBusinesses.length)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md p-4 rounded-full shadow-xl border border-slate-100 text-brand-teal opacity-0 group-hover/carousel:opacity-100 transition-all translate-x-4 group-hover/carousel:-translate-x-6 hover:bg-brand-orange hover:text-white"
                  >
                    <ICONS.ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Indicadores de página */}
              {sponsorBusinesses.length > 3 && (
                <div className="flex justify-center gap-2 mt-6">
                  {sponsorBusinesses.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSponsorIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${currentSponsorIndex === idx ? 'bg-brand-orange w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Ver Todos os Patrocinadores */}
            {businesses.filter(b => b.isSponsor && b.isActive).length > 6 && (
              <div className="text-center mt-10">
                <button className="px-8 py-4 bg-white text-brand-orange border-2 border-brand-orange rounded-full font-black text-sm uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all shadow-lg hover:shadow-xl">
                  Ver Todos os Patrocinadores
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories & Business Grid */}
      <section className="bg-slate-50 pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-30 mb-10 reveal">
          <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-visible">

            {/* Search Bar - Integrated here */}
            <div className="mb-8">
              <div className="bg-white rounded-[2rem] overflow-visible p-2 flex flex-col md:flex-row gap-2 border border-slate-100 ring-4 ring-slate-50/50 shadow-inner group relative z-50">
                {/* Search Input Section */}
                <div className="flex-grow relative flex items-center px-6 py-4 md:border-r border-slate-100 group/input">
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
                <div className="flex items-center px-6 py-4 md:min-w-[240px] group/select relative bg-slate-50 md:bg-transparent rounded-2xl md:rounded-none">
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

                {/* Search Action Button */}
                <button className="relative bg-brand-teal text-white px-8 py-4 rounded-2xl font-black text-sm transition-all duration-300 active:scale-95 shadow-lg shadow-brand-teal/30 uppercase tracking-widest whitespace-nowrap group/button hover:shadow-xl hover:shadow-brand-teal/40 hover:scale-105 flex items-center justify-center gap-2">
                  <ICONS.Search size={18} />
                  <span className="relative z-10">Buscar</span>
                </button>
              </div>
            </div>

            {/* Quick Filters - Integrated with Categories */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 border-b border-slate-50 pb-8">
              <button
                onClick={() => {
                  if (isNearestActive) {
                    setIsNearestActive(false);
                  } else {
                    if (userLocation) {
                      setIsNearestActive(true);
                    } else {
                      handleManualLocation();
                    }
                  }
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isNearestActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-lg shadow-emerald-500/20' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
              >
                <ICONS.MapPin size={14} className={isNearestActive ? 'animate-bounce' : ''} />
                {isNearestActive ? 'Lojas mais próximas ativadas' : 'Lojas mais próximas'}
                {isNearestActive && <ICONS.X size={12} className="ml-1" />}
              </button>
              <button
                onClick={() => setIs24hOnly(!is24hOnly)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${is24hOnly ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
              >
                <ICONS.Clock size={14} className={is24hOnly ? 'animate-pulse' : ''} />
                {is24hOnly ? 'Filtro 24h Ativo' : 'Aberto 24h'}
              </button>
              <button
                onClick={() => setIsDeliveryOnly(!isDeliveryOnly)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isDeliveryOnly ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
              >
                <ICONS.Truck size={14} />
                {isDeliveryOnly ? 'Somente Delivery' : 'Delivery'}
              </button>
              <button
                onClick={() => setIsPickupOnly(!isPickupOnly)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isPickupOnly ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'}`}
              >
                <ICONS.Package size={14} />
                {isPickupOnly ? 'Somente Retirada' : 'Retirada'}
              </button>
            </div>

            {/* Pagination Controls for Categories */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categorias</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll(categoriesRef, 'left')}
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-brand-teal hover:bg-brand-teal hover:text-white transition-all border border-slate-100 shadow-sm"
                >
                  <ICONS.ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll(categoriesRef, 'right')}
                  className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-brand-teal hover:bg-brand-teal hover:text-white transition-all border border-slate-100 shadow-sm"
                >
                  <ICONS.ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div ref={categoriesRef} className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
              {Object.values(CategoryType).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className="flex flex-col items-center group transition-all shrink-0"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all border-2 mb-2 ${selectedCategory === category ? 'bg-brand-teal border-brand-teal text-white shadow-xl scale-110' : 'bg-slate-50 border-transparent text-brand-teal-deep hover:bg-slate-100'}`}>
                    {React.cloneElement(CATEGORY_ICONS[category] as React.ReactElement<any>, { className: "w-5 h-5 md:w-6 md:h-6" })}
                  </div>
                  <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest text-center ${selectedCategory === category ? 'text-brand-teal' : 'text-slate-400'}`}>{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-black text-brand-teal-deep tracking-tight">Resultado da Busca</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Melhores opções para você</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-6 reveal">
            {filteredBusinesses.slice(0, 8).map((biz, index) => (
              <div
                key={biz.id}
                className="w-full animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
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
      <section className="bg-slate-900 py-6 md:py-8 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center mb-4 md:mb-6 gap-2 reveal">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter">Vagas em <span className="text-brand-teal">Pira</span></h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 md:mt-4">Oportunidades em Piracicaba</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => scroll(jobsRef, 'left')}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-brand-teal hover:bg-brand-teal hover:text-white transition-all border border-white/10"
              >
                <ICONS.ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scroll(jobsRef, 'right')}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-brand-teal hover:bg-brand-teal hover:text-white transition-all border border-white/10"
              >
                <ICONS.ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div ref={jobsRef} className="flex gap-3 md:gap-4 overflow-x-auto pb-6 snap-x no-scrollbar px-2 md:px-0 scroll-smooth">
            {recentJobs.slice(0, 4).map((job) => (
              <div key={job.id} className="w-[210px] md:w-[320px] shrink-0 snap-start bg-white/5 backdrop-blur-sm p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/10 hover:border-brand-teal/50 transition-all group">
                <div className="bg-brand-teal/20 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-teal mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <ICONS.Briefcase size={18} />
                </div>
                <h3 className="text-sm md:text-lg font-black mb-1 md:mb-1.5 leading-tight line-clamp-2">{job.role}</h3>
                <p className="text-brand-orange text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-2 md:mb-3 line-clamp-1">{job.company}</p>
                <Link to="/vagas" className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-teal transition-colors">Detalhes</Link>
              </div>
            ))}
            <div className="shrink-0 w-48 flex flex-col items-center justify-center p-8 bg-white/5 rounded-[2rem] border border-dashed border-white/10 snap-start">
              <Link to="/vagas" className="text-brand-teal font-black text-xs uppercase tracking-widest flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center">
                  <ICONS.ArrowRight size={24} />
                </div>
                Ver Todas
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center reveal">
            <Link to="/vagas" className="inline-flex items-center gap-4 bg-brand-teal text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-teal/20 hover:bg-brand-teal-dark hover:scale-105 active:scale-95 transition-all">
              Ver Todas as Vagas <ICONS.ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section >

      {/* Guia Turístico Section - Rotas */}
      <section className="bg-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 reveal">
            <h2 className="text-2xl md:text-3xl font-black text-brand-teal-deep tracking-tighter leading-none mb-2">Turismo em <span className="text-brand-orange">Pira</span></h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Descubra Nossos Roteiros</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 reveal">
            {touristRoutes.map((route) => (
              <Link
                to={`/guia-turistico?categoria=${route.query}`}
                key={route.id}
                className="group relative h-64 md:h-80 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 block"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${route.bgGradient} group-hover:scale-105 transition-transform duration-500`} />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-between p-6 z-10">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${route.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {route.icon}
                  </div>

                  <div>
                    <h3 className="text-white text-lg md:text-2xl font-black leading-tight mb-2 group-hover:text-white/90 transition-colors">
                      {route.name}
                    </h3>

                    <p className="text-white/80 text-xs md:text-sm font-medium line-clamp-2 md:line-clamp-3 mb-4 group-hover:text-white transition-colors">
                      {route.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/90 group-hover:text-white transition-colors">
                      Explorar Rota <ICONS.ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Notícias */}
      < section className="py-6 md:py-8 bg-slate-50 relative overflow-hidden" >
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center mb-4 md:mb-6 gap-2 reveal">
            <div className="max-w-2xl text-center">
              <h2 className="text-2xl md:text-3xl font-black text-brand-teal-deep tracking-tighter leading-none mb-2">
                Notícias da <span className="text-brand-orange">Região</span>
              </h2>
              <p className="text-slate-500 font-medium text-base max-w-xl">
                Acompanhe o que está acontecendo em Piracicaba.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scroll(newsRef, 'left')}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-teal hover:bg-brand-teal hover:text-white transition-all border border-slate-200 shadow-md"
                >
                  <ICONS.ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => scroll(newsRef, 'right')}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-teal hover:bg-brand-teal hover:text-white transition-all border border-slate-200 shadow-md"
                >
                  <ICONS.ChevronRight size={20} />
                </button>
              </div>
              <Link
                to="/noticias"
                className="group flex items-center gap-3 text-brand-teal font-black text-xs uppercase tracking-widest hover:text-brand-orange transition-colors"
              >
                Ver todas
                <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center group-hover:bg-brand-orange/10 group-hover:text-brand-orange transition-colors">
                  <ICONS.ArrowRight size={14} />
                </div>
              </Link>
            </div>
          </div>

          <div ref={newsRef} className="flex gap-3 md:gap-4 overflow-x-auto pb-6 snap-x no-scrollbar px-2 md:px-0 scroll-smooth">
            {latestNews.slice(0, 4).map((item, idx) => (
              <div key={idx} className="w-[210px] md:w-[320px] shrink-0 snap-start">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
                >
                  <div className="h-28 md:h-36 rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-4 relative">
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
                  <h3 className="text-[11px] md:text-lg font-bold text-slate-800 mb-2 md:mb-4 group-hover:text-brand-teal transition-colors line-clamp-2 md:line-clamp-3 leading-tight">
                    {item.title}
                  </h3>
                  <p className="hidden md:block text-slate-500 text-sm font-medium line-clamp-3 mb-6 flex-1">
                    {item.summary}
                  </p>
                  <div className="flex items-center text-[7px] md:text-[10px] font-black text-brand-orange uppercase tracking-widest mt-auto">
                    Ler tudo <ICONS.ExternalLink size={10} className="ml-1 md:ml-2" />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section >
    </div >
  );
};

export default Home;
