
import React, { useState } from 'react';
import { PIRACICABA_NEIGHBORHOODS } from '../constants';
import { ICONS } from '../constants';

interface NeighborhoodSelectorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    selectClassName?: string;
    inputClassName?: string;
    showIcon?: boolean;
}

const NeighborhoodSelector: React.FC<NeighborhoodSelectorProps> = ({
    value,
    onChange,
    placeholder = "Selecione o bairro...",
    className = "",
    selectClassName = "",
    inputClassName = "",
    showIcon = false
}) => {
    const [filter, setFilter] = useState('');

    const filteredNeighborhoods = PIRACICABA_NEIGHBORHOODS.filter(n =>
        n.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div className="relative flex items-center">
                {showIcon && <ICONS.Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />}
                <input
                    type="text"
                    placeholder="Pesquisar bairro..."
                    className={`w-full text-[10px] font-bold uppercase tracking-widest outline-none bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 focus:border-brand-teal transition-all ${showIcon ? 'pl-9' : ''} ${inputClassName}`}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
            <div className="relative">
                <select
                    required
                    className={`w-full font-bold outline-none cursor-pointer appearance-none ${selectClassName}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">{placeholder}</option>
                    {filteredNeighborhoods.map(bairro => (
                        <option key={bairro} value={bairro}>{bairro}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default NeighborhoodSelector;
