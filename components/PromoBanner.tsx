
import React, { useState, useEffect } from 'react';
import { ICONS, WHATSAPP_ADMIN } from '../constants';

const PromoBanner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const banners = [
        {
            id: 1,
            type: 'service',
            title: 'PRECISA DE SITE OU SISTEMA?',
            highlight: 'Nós criamos pra você!',
            cta: 'ORÇAMENTO RÁPIDO',
            icons: [<ICONS.Monitor size={32} />, <ICONS.Smartphone size={32} />, <ICONS.Zap size={32} />],
            color: 'from-slate-900 via-brand-teal-deep to-brand-teal',
            link: `https://wa.me/${WHATSAPP_ADMIN}?text=Olá! Gostaria de um orçamento para site/sistema.`
        },
        {
            id: 2,
            type: 'sponsor',
            title: 'QUER VENDER MAIS EM PIRA?',
            highlight: 'Seja um Patrocinador!',
            cta: 'QUERO DESTAQUE',
            icons: [<ICONS.TrendingUp size={32} />, <ICONS.Star size={32} />, <ICONS.BadgeCheck size={32} />],
            color: 'from-brand-orange-dark via-brand-orange to-amber-500',
            link: `https://wa.me/${WHATSAPP_ADMIN}?text=Olá! Quero ser patrocinador do Guia-me.`
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 8000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    const handleNext = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
            setIsAnimating(false);
        }, 500);
    };

    const currentBanner = banners[currentIndex];

    return (
        <div className="w-full bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 py-3">
                <a
                    href={currentBanner.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`relative flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 rounded-[1.5rem] bg-gradient-to-r ${currentBanner.color} text-white shadow-lg overflow-hidden transition-all duration-500 hover:scale-[1.01] active:scale-100 group`}
                >
                    {/* Background Animated Elements */}
                    <div className="absolute top-0 right-0 w-32 h-full bg-white/5 skew-x-12 translate-x-10 group-hover:translate-x-0 transition-transform duration-1000"></div>

                    {/* Left Side: Icons & Text */}
                    <div className="flex items-center gap-6 z-10">
                        <div className="flex -space-x-3">
                            {currentBanner.icons.map((icon, idx) => (
                                <div
                                    key={idx}
                                    className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition-all duration-700 ${isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0'}`}
                                    style={{ transitionDelay: `${idx * 100}ms` }}
                                >
                                    {icon}
                                </div>
                            ))}
                        </div>

                        <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
                            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-70 mb-1">{currentBanner.title}</h4>
                            <p className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">{currentBanner.highlight}</p>
                        </div>
                    </div>

                    {/* Right Side: CTA Button */}
                    <div className={`z-10 transition-all duration-500 ${isAnimating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
                        <div className="flex items-center gap-4 bg-white/10 hover:bg-white text-white hover:text-brand-teal-deep px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-white/20 hover:border-white transition-all group/btn shadow-xl">
                            <span>{currentBanner.cta}</span>
                            <ICONS.ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                        </div>
                    </div>

                    {/* Time Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full overflow-hidden">
                        <div
                            key={currentIndex}
                            className="h-full bg-white/60 animate-progress-shrink"
                            style={{ animationDuration: '8s' }}
                        ></div>
                    </div>
                </a>

                {/* Manual Dots */}
                <div className="flex justify-center gap-1.5 mt-2">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentIndex(idx);
                            }}
                            className={`h-1 rounded-full transition-all ${currentIndex === idx ? 'w-6 bg-brand-teal' : 'w-1.5 bg-slate-200 hover:bg-slate-300'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromoBanner;
