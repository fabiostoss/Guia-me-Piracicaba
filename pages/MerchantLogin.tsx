
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Business } from '../types';
import { ICONS, WHATSAPP_ADMIN } from '../constants';
import * as db from '../services/databaseService';

interface MerchantLoginProps {
  businesses: Business[];
}

const MerchantLogin: React.FC<MerchantLoginProps> = ({ businesses }) => {
  const [identifier, setIdentifier] = useState(''); // Pode ser usuário ou WhatsApp
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const cleanIdentifier = identifier.toLowerCase().trim();
    const cleanPhone = identifier.replace(/\D/g, '');

    const found = businesses.find(b =>
      (b.username?.toLowerCase() === cleanIdentifier || b.phone.replace(/\D/g, '') === cleanPhone) &&
      (b.password === password)
    );

    if (found) {
      const success = await db.createMerchantSession(found.id);
      if (success) {
        navigate('/merchant-dashboard');
      } else {
        setError('Erro ao criar sessão. Tente novamente.');
      }
    } else {
      setError('Credenciais incorretas. Verifique seu usuário/telefone e senha.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="bg-white max-w-md w-full rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-10 text-center">
          <div className="bg-brand-teal/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-teal">
            <ICONS.ShoppingBag size={32} />
          </div>
          <h1 className="text-3xl font-black text-brand-teal-deep mb-2">Área do Lojista</h1>
          <p className="text-slate-500 mb-8 font-medium">
            Gerencie seu comércio no Pira Marketplace
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuário ou WhatsApp</label>
                <input
                  required
                  type="text"
                  placeholder="Seu usuário ou telefone"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal outline-none transition-all font-medium text-lg"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError('');
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha de Acesso</label>
                <input
                  required
                  type="password"
                  placeholder="Sua senha"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal outline-none transition-all font-medium text-lg"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold mt-2 ml-1 animate-bounce">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-teal text-white font-black py-5 rounded-2xl hover:bg-brand-teal-dark transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Acessar meu Comércio'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50">
            <p className="text-slate-400 text-sm mb-4 font-medium">Ainda não tem cadastro ou esqueceu os dados?</p>
            <a
              href={`https://wa.me/${WHATSAPP_ADMIN}?text=Olá! Gostaria de ajuda com meu acesso de lojista no Pira Marketplace.`}
              target="_blank"
              rel="noreferrer"
              className="text-brand-teal font-black hover:underline inline-flex items-center uppercase tracking-widest text-[10px]"
            >
              Falar com o Suporte Admin <ICONS.ArrowRight className="ml-2" size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantLogin;
