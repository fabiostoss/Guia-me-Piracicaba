
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import * as db from '../services/databaseService';

const AdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const success = await db.createAdminSession();
      if (success) {
        localStorage.setItem('pira_admin_auth', 'true');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-50">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-teal/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white/80 backdrop-blur-xl max-w-md w-full rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white overflow-hidden relative z-10">
        <div className="p-12 text-center">
          <div className="relative inline-block mb-8">
            <div className="bg-gradient-to-br from-brand-teal to-brand-teal-deep w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-brand-teal/30 rotate-3 hover:rotate-0 transition-transform duration-500">
              <ICONS.BadgeCheck size={38} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white p-2 rounded-xl shadow-lg animate-bounce">
              <ICONS.Star size={14} fill="currentColor" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-brand-teal-deep mb-4 tracking-tighter">
            Área do <span className="text-brand-teal">Administrador</span>
          </h1>
          <p className="text-slate-500 mb-10 font-bold text-sm uppercase tracking-widest opacity-60">
            Acesso Restrito • Guia-me Piracicaba
          </p>

          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-100 flex flex-col items-center gap-4 mb-8">
              <div className="p-4 rounded-full bg-white shadow-sm">
                <ICONS.Info size={20} className="text-brand-teal" />
              </div>
              <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-widest">
                O acesso seguro por senha está desativado temporariamente para facilitar os ajustes de configuração.
              </p>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full group relative bg-brand-teal-deep text-white font-black h-20 rounded-3xl overflow-hidden shadow-2xl shadow-brand-teal/20 active:scale-95 transition-all text-sm uppercase tracking-[0.3em] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-teal to-brand-teal-deep opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center gap-3">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Acessar Painel
                    <ICONS.ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-10 group flex items-center justify-center gap-2 mx-auto text-slate-400 text-[10px] font-black hover:text-brand-teal transition-all uppercase tracking-[0.2em]"
          >
            <ICONS.X size={14} className="group-hover:rotate-90 transition-transform" />
            Sair e Voltar ao Site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
