
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Business, CategoryType, NewsArticle } from '../types';
import { ICONS, CATEGORY_ICONS, WHATSAPP_ADMIN, PIRACICABA_NEIGHBORHOODS } from '../constants';
import BusinessCard from '../components/BusinessCard';
import { getLocalNews } from '../services/newsService';
import { isBusinessOpen } from '../utils/businessUtils';
import { TOURIST_SPOTS } from '../services/touristService';
import { getLatestJobs } from '../services/jobService';

interface HomeProps {
  businesses: Business[];
  checkAuth?: (action: () => void) => void;
}

const Home: React.FC<HomeProps> = ({ businesses, checkAuth }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');

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

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory ? b.category === selectedCategory : true;
      const matchesNeighborhood = selectedNeighborhood ? b.neighborhood === selectedNeighborhood : true;
      const isActive = b.isActive !== false;

      return matchesSearch && matchesCategory && matchesNeighborhood && isActive;
    });
  }, [businesses, searchTerm, selectedCategory, selectedNeighborhood]);

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
      <section className="relative overflow-hidden bg-white pt-24 pb-32 animate-fade-in">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-teal/5 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl space-y-8 text-center md:text-left animate-slide-up">
            <span className="text-brand-orange text-xs font-black uppercase tracking-[0.5em] block mb-4">Marketplace Oficial Piracicaba</span>
            <h1 className="text-4xl md:text-8xl font-black text-brand-teal-deep tracking-tighter leading-[0.9]">
              Conectando <span className="text-brand-orange">Piracicaba</span> ao comércio local.
            </h1>
            <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl">
              Pesquise, encontre e peça via WhatsApp sem intermediários. O guia direto da Noiva da Colina.
            </p>

            {/* Search Bar - Enhanced Visual Design */}
            <div className="relative max-w-3xl mx-auto md:mx-0 pt-4">
              <div className="flex flex-col gap-6">
                {/* Multi-layered shadow container with hover effects */}
                <div className="bg-white rounded-[2.5rem] overflow-visible p-2 flex flex-col md:flex-row gap-2 border border-slate-200/50 ring-1 ring-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15),0_10px_25px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.2),0_15px_35px_-10px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-all duration-500 ease-out backdrop-blur-sm group">

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
                  <div className="flex items-center px-6 py-4 min-w-[200px] group/select relative">
                    <ICONS.MapPin className="text-brand-orange mr-4 group-hover/select:scale-110 transition-transform duration-300" size={20} />
                    <select
                      className="w-full bg-transparent text-slate-600 font-bold outline-none cursor-pointer appearance-none pr-8 focus:text-brand-teal transition-colors"
                      value={selectedNeighborhood}
                      onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    >
                      <option value="">Todos os Bairros</option>
                      {Object.entries(PIRACICABA_NEIGHBORHOODS).map(([region, neighborhoods]) => (
                        <optgroup key={region} label={region}>
                          {neighborhoods.map(bairro => (
                            <option key={bairro} value={bairro}>{bairro}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute right-8 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400 group-hover/select:text-brand-orange transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
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
          <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 overflow-x-auto no-scrollbar">
            <div className="flex gap-10">
              {Object.values(CategoryType).map((category, idx) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={`flex flex-col items-center group transition-all shrink-0 reveal stagger-${(idx % 4) + 1}`}
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all border-2 mb-4 ${selectedCategory === category ? 'bg-brand-teal border-brand-teal text-white shadow-xl scale-110' : 'bg-slate-50 border-transparent text-brand-teal-deep hover:bg-slate-100'}`}>
                    {CATEGORY_ICONS[category]}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-center ${selectedCategory === category ? 'text-brand-teal' : 'text-slate-400'}`}>{category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
      <section className="bg-slate-900 py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 reveal">
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter">Vagas em <span className="text-brand-teal">Pira</span></h2>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-4">As melhores oportunidades para trabalhar em Piracicaba</p>
            </div>
            <Link to="/vagas" className="hidden md:flex items-center gap-3 text-brand-teal font-black uppercase tracking-widest text-xs hover:text-white transition-colors">
              Ver todas as vagas <ICONS.ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentJobs.map((job, idx) => (
              <div key={job.id} className={`bg-white/5 backdrop-blur-sm p-10 rounded-[2.5rem] border border-white/10 hover:border-brand-teal/50 transition-all group reveal stagger-${idx + 1}`}>
                <div className="bg-brand-teal/20 w-14 h-14 rounded-2xl flex items-center justify-center text-brand-teal mb-8 group-hover:scale-110 transition-transform">
                  <ICONS.Briefcase size={24} />
                </div>
                <h3 className="text-2xl font-black mb-2 leading-tight">{job.role}</h3>
                <p className="text-brand-orange text-[10px] font-black uppercase tracking-widest mb-6">{job.company}</p>
                <Link to="/vagas" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-teal transition-colors">Detalhes da Vaga</Link>
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
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl md:text-7xl font-black text-brand-teal-deep tracking-tighter leading-none">Turismo em <span className="text-brand-orange">Pira</span></h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-6">Descubra os pontos icônicos da Noiva da Colina</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredSpots.map((spot, idx) => (
              <div key={spot.id} className={`bg-slate-50 rounded-[2rem] p-6 border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center reveal stagger-${idx + 1}`}>
                <div className="bg-brand-teal/10 w-16 h-16 rounded-2xl flex items-center justify-center text-brand-teal mb-6 group-hover:bg-brand-teal group-hover:text-white group-hover:scale-110 transition-all duration-500">
                  {getTouristIcon(spot.category, 32)}
                </div>
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-orange">{spot.category}</span>
                  <h3 className="text-xl font-black text-brand-teal-deep group-hover:text-brand-teal transition-colors leading-tight">{spot.name.replace(/^\d+\.\s*/, '')}</h3>
                  <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed">{spot.description}</p>
                </div>
                <Link to="/guia-turistico" className="mt-6 text-[10px] font-black uppercase tracking-widest text-brand-teal-deep hover:text-brand-orange transition-colors flex items-center gap-2">
                  Ver Mais <ICONS.ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
