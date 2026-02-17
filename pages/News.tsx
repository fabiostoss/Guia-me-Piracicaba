
import React, { useState, useEffect } from 'react';
import { getLocalNews, NEWS_MOCK } from '../services/newsService';
import { NewsArticle } from '../types';
import { ICONS } from '../constants';

const News: React.FC = () => {
    const [news, setNews] = useState<NewsArticle[]>(NEWS_MOCK);
    const [loading, setLoading] = useState(false); // Carregamento inicial já resolvido com mock

    useEffect(() => {
        // Tenta buscar notícias frescas
        const fetchNews = async () => {
            try {
                const data = await getLocalNews();
                if (data && data.length > 0) {
                    setNews(data);
                }
            } catch (error) {
                console.error("Failed to load news", error);
            }
        };
        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <section className="bg-brand-teal-deep py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Últimas Notícias de <span className="text-brand-orange">Piracicaba</span>
                    </h1>
                    <p className="text-white/80 text-lg font-medium max-w-2xl mx-auto">
                        Fique por dentro de tudo o que acontece na nossa região. Atualizações diárias direto do G1.
                    </p>
                </div>
            </section>

            {/* News Grid */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item, index) => (
                            <a
                                key={index}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group border border-slate-100 flex flex-col h-full"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-brand-teal/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img
                                        src={item.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60'}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-teal-deep shadow-sm">
                                        {item.date}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand-teal transition-colors line-clamp-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-4 flex-1 mb-6">
                                        {item.summary}
                                    </p>
                                    <div className="flex items-center text-brand-orange font-bold text-xs uppercase tracking-widest mt-auto">
                                        Ler Mais <ICONS.ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default News;
