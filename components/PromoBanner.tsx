
import React, { useState, useEffect } from 'react';
import { ICONS, WHATSAPP_ADMIN } from '../constants';

const PromoBanner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const banners = [
        {
            id: 1,
            type: 'service',
            label: 'SOLUÇÕES DIGITAIS',
            title: 'Sistemas e Sites',
            highlight: 'Profissionais',
            cta: 'ORÇAMENTO',
            icon: <ICONS.Monitor size={20} />,
            color: 'from-brand-teal-deep via-brand-teal to-brand-teal-dark',
            link: `https://wa.me/${WHATSAPP_ADMIN}?text=Olá! Gostaria de um orçamento para site/sistema.`
        },
        {
            id: 2,
            type: 'sponsor',
            label: 'CRESCIMENTO LOCAL',
            title: 'Seja Patrocinador',
            highlight: 'Oficial do Guia',
            cta: 'SABER MAIS',
            icon: <ICONS.Star size={20} />,
            color: 'from-brand-orange-dark via-brand-orange to-orange-400',
            link: `https://wa.me/${WHATSAPP_ADMIN}?text=Olá! Quero ser patrocinador do Guia-me.`
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 10000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    const handleNext = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
            setIsAnimating(false);
        }, 600);
    };

    const currentBanner = banners[currentIndex];

    return (
        <div className="w-full bg-slate-50 border-b border-slate-200/60 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                <a
                    href={currentBanner.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`group relative flex flex-col md:flex-row items-center gap-4 md:gap-8 p-1 md:p-1.5 rounded-[1.2rem] bg-white shadow-lg shadow-slate-200/40 overflow-hidden transition-all duration-700 hover:shadow-brand-teal/10`}
                >
                    {/* Visual Decorator Side - COMPACTO */}
                    <div className={`w-full md:w-[30%] h-24 md:h-32 rounded-[1rem] bg-gradient-to-br ${currentBanner.color} relative overflow-hidden flex items-center justify-center transition-all duration-700 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className={`relative z-10 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-1000 ${isAnimating ? 'rotate-[360deg] scale-0' : 'rotate-0 scale-100'}`}>
                            {React.cloneElement(currentBanner.icon as React.ReactElement<any>, { className: "text-white" })}
                        </div>

                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                            <span className="text-[7px] font-black text-white uppercase tracking-[0.2em] font-heading">{currentBanner.label}</span>
                        </div>
                    </div>

                    {/* Content Side - COMPACTO */}
                    <div className="flex-grow p-2 md:p-4 space-y-3 text-center md:text-left relative">
                        <div className={`space-y-0.5 transition-all duration-700 delay-100 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                            <h3 className="text-xl md:text-3xl font-black text-brand-teal-deep tracking-tighter leading-tight">
                                {currentBanner.title}
                            </h3>
                            <p className="text-brand-orange text-lg md:text-2xl font-black tracking-tight uppercase">
                                {currentBanner.highlight}
                            </p>
                        </div>

                        <div className={`flex flex-col md:flex-row items-center gap-4 transition-all duration-700 delay-200 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                            <div className="relative inline-block">
                                <div className="relative bg-brand-teal-deep text-white px-6 py-3 rounded-xl font-black text-[11px] md:text-xs uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-brand-teal active:scale-95">
                                    {currentBanner.cta}
                                    <ICONS.ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                            </div>

                            {/* Trust Indicator - COMPACTO */}
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-1.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full border border-white bg-slate-100 flex items-center justify-center">
                                            <ICONS.User size={10} className="text-slate-400" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Marcas parceiras</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Dots - COMPACTO */}
                    <div className="absolute bottom-4 right-6 hidden md:flex flex-col gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                                className={`w-2 h-2 rounded-full transition-all duration-500 ${currentIndex === idx ? 'bg-brand-teal h-5 shadow-lg shadow-brand-teal/30' : 'bg-slate-200 hover:bg-brand-teal/20'}`}
                            />
                        ))}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-100">
                        <div
                            key={currentIndex}
                            className="h-full bg-brand-teal/30 animate-progress-shrink"
                            style={{ animationDuration: '10s' }}
                        ></div>
                    </div>
                </a>
            </div>
        </div>
    );
};

export default PromoBanner;
