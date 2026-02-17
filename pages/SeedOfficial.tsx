import React, { useState } from 'react';
import { OFFICIAL_BUSINESSES } from '../data/officialBusinesses';
import { createBusiness } from '../services/databaseService';

const SeedOfficial: React.FC = () => {
    const [status, setStatus] = useState<string>('Pronto para cadastrar');
    const [progress, setProgress] = useState<number>(0);
    const [isSeeding, setIsSeeding] = useState<boolean>(false);

    const handleSeed = async () => {
        setIsSeeding(true);
        setStatus('Iniciando cadastro...');

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < OFFICIAL_BUSINESSES.length; i++) {
            const business = OFFICIAL_BUSINESSES[i];
            setStatus(`Cadastrando: ${business.name}...`);
            setProgress(((i + 1) / OFFICIAL_BUSINESSES.length) * 100);

            try {
                const result = await createBusiness(business);
                if (result) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`Erro ao cadastrar ${business.name}:`, error);
                errorCount++;
            }

            // Pequeno delay para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        setStatus(`Concluído! ✅ ${successCount} cadastrados | ❌ ${errorCount} erros`);
        setIsSeeding(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
                <h1 className="text-3xl font-black text-brand-teal-deep mb-4">
                    Cadastro de Comércios Oficiais
                </h1>
                <p className="text-slate-600 mb-6">
                    Esta página cadastrará {OFFICIAL_BUSINESSES.length} estabelecimentos oficiais no banco de dados.
                </p>

                <div className="mb-6">
                    <div className="bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-brand-teal h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-slate-500 mt-2 text-center">{Math.round(progress)}%</p>
                </div>

                <p className="text-center text-lg font-semibold text-slate-700 mb-6">
                    {status}
                </p>

                <button
                    onClick={handleSeed}
                    disabled={isSeeding}
                    className="w-full bg-brand-teal text-white py-4 rounded-2xl font-bold text-lg hover:bg-brand-teal-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSeeding ? 'Cadastrando...' : 'Iniciar Cadastro'}
                </button>

                <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                    <h3 className="font-bold text-slate-700 mb-2">Estabelecimentos a cadastrar:</h3>
                    <ul className="text-sm text-slate-600 space-y-1 max-h-60 overflow-y-auto">
                        {OFFICIAL_BUSINESSES.map((b, idx) => (
                            <li key={idx}>• {b.name} - {b.neighborhood}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SeedOfficial;
