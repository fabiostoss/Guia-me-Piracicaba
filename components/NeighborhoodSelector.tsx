
import React, { useState, useRef, useEffect } from 'react';
import { PIRACICABA_NEIGHBORHOODS, ICONS } from '../constants';

interface NeighborhoodSelectorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string; // Container class
    triggerClassName?: string; // Class for the "select box" look
    dropdownClassName?: string; // Class for the expanded list
}

const NeighborhoodSelector: React.FC<NeighborhoodSelectorProps> = ({
    value,
    onChange,
    placeholder = "Todos os Bairros",
    className = "",
    triggerClassName = "",
    dropdownClassName = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredNeighborhoods = PIRACICABA_NEIGHBORHOODS.filter(n =>
        n.toLowerCase().includes(filter.toLowerCase())
    );

    const handleSelect = (neighborhood: string) => {
        onChange(neighborhood);
        setIsOpen(false);
        setFilter('');
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger looks like a select button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between transition-all ${triggerClassName}`}
            >
                <span className="truncate">{value || placeholder}</span>
                <ICONS.Filter size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded List */}
            {isOpen && (
                <div className={`absolute z-[100] top-full mt-2 left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in ${dropdownClassName}`}>
                    {/* Search Input INSIDE the list */}
                    <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                        <div className="relative flex items-center">
                            <ICONS.Search size={14} className="absolute left-3 text-slate-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Pesquisar Bairro..."
                                className="w-full bg-white pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:border-brand-teal transition-all"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="max-h-60 overflow-y-auto no-scrollbar py-2">
                        <button
                            type="button"
                            onClick={() => handleSelect('')}
                            className={`w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors ${!value ? 'text-brand-teal' : 'text-slate-400'}`}
                        >
                            {placeholder}
                        </button>
                        {filteredNeighborhoods.map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => handleSelect(n)}
                                className={`w-full px-5 py-3 text-left text-[11px] font-bold hover:bg-slate-50 transition-colors ${value === n ? 'text-brand-teal bg-brand-teal/5' : 'text-slate-600'}`}
                            >
                                {n}
                            </button>
                        ))}
                        {filteredNeighborhoods.length === 0 && (
                            <div className="px-5 py-8 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Nenhum bairro encontrado</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NeighborhoodSelector;
