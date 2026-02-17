
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import * as db from '../services/databaseService';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (username === 'admin' && password === '123') {
      const success = await db.createAdminSession();
      if (success) {
        navigate('/admin');
      } else {
        setError('Erro ao criar sessão. Tente novamente.');
      }
    } else {
      setError('Credenciais inválidas. Verifique seu usuário e senha.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="bg-white max-w-md w-full rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-10 text-center">
          <div className="bg-brand-orange/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-orange">
            <ICONS.Wrench size={32} />
          </div>
          <h1 className="text-3xl font-black text-brand-teal-deep mb-2">Painel Admin</h1>
          <p className="text-slate-500 mb-8 font-medium">
            Acesso restrito para administradores
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-left space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
                <input
                  required
                  type="text"
                  placeholder="admin"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 focus:ring-4 focus:ring-brand-teal/10 focus:border-brand-teal outline-none transition-all font-medium text-lg"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                <input
                  required
                  type="password"
                  placeholder="****"
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
              className="w-full bg-brand-teal text-white font-black py-5 rounded-2xl hover:bg-brand-teal-dark transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
            >
              Entrar no Painel
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="mt-6 text-slate-400 text-sm font-bold hover:text-brand-teal transition-colors uppercase tracking-widest text-[10px]"
          >
            Voltar para o site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
