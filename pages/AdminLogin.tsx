
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import * as db from '../services/databaseService';
import { useUI } from '../components/CustomUI';

const AdminLogin: React.FC = () => {
  const [view, setView] = useState<'login' | 'forgot-password' | 'verify-reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useUI();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showNotification('Preencha todos os campos', 'warning');
      return;
    }

    setLoading(true);
    try {
      const isValid = await db.validateAdminLogin(username, password);
      if (isValid) {
        await db.createAdminSession();
        localStorage.setItem('pira_admin_auth', 'true');
        showNotification('Bem-vindo ao Painel!', 'success');
        navigate('/admin');
      } else {
        showNotification('Usuário ou senha inválidos', 'error');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showNotification('Erro na conexão com o servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      showNotification('Digite seu usuário primeiro', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await db.generateAdminResetCode(username);
      if (result.success && result.phone && result.code) {
        setPhone(result.phone);
        // Gerar link do WhatsApp
        const message = encodeURIComponent(`Guia-me Piracicaba: Seu código de segurança para redefinir a senha do Painel Admin é: ${result.code}`);
        const whatsappUrl = `https://wa.me/${result.phone.replace(/\D/g, '')}?text=${message}`;

        showNotification('Código gerado! Enviando para o WhatsApp...', 'success');

        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        setView('verify-reset');
      } else {
        showNotification('Usuário não encontrado', 'error');
      }
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      showNotification('Erro ao processar solicitação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || !newPassword) {
      showNotification('Preencha o código e a nova senha', 'warning');
      return;
    }

    if (newPassword.length < 8) {
      showNotification('A senha deve ter pelo menos 8 caracteres', 'warning');
      return;
    }

    setLoading(true);
    try {
      const success = await db.verifyAndResetAdminPassword(username, resetCode, newPassword);
      if (success) {
        showNotification('Senha alterada com sucesso! Faça login agora.', 'success');
        setView('login');
        setPassword('');
      } else {
        showNotification('Código inválido ou expirado', 'error');
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      showNotification('Erro ao resetar senha', 'error');
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
        <div className="p-8 md:p-12 text-center">
          <div className="relative inline-block mb-8">
            <div className="bg-gradient-to-br from-brand-teal to-brand-teal-deep w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-brand-teal/30 rotate-3">
              <ICONS.BadgeCheck size={38} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white p-2 rounded-xl shadow-lg">
              <ICONS.Shield size={14} fill="currentColor" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-brand-teal-deep mb-2 tracking-tighter">
            {view === 'login' ? 'Área Restrita' : 'Recuperar Acesso'}
          </h1>
          <p className="text-slate-400 mb-8 font-bold text-[10px] uppercase tracking-widest">
            Acesso Administrativo • Guia-me Piracicaba
          </p>

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
                <div className="relative">
                  <ICONS.User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-teal focus:bg-white outline-none transition-all font-bold text-slate-700"
                    placeholder="Nome de usuário"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <ICONS.Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-teal focus:bg-white outline-none transition-all font-bold text-slate-700"
                    placeholder="Sua senha forte"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-teal text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-teal/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Entrar no Sistema'}
              </button>

              <button
                type="button"
                onClick={() => setView('forgot-password')}
                className="text-[10px] font-black text-slate-400 hover:text-brand-orange uppercase tracking-widest mt-2 transition-colors"
              >
                Esqueci minha senha
              </button>
            </form>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleSendResetCode} className="space-y-6">
              <div className="p-6 rounded-3xl bg-brand-orange/5 border border-brand-orange/10 text-left space-y-3">
                <div className="bg-brand-orange/10 w-8 h-8 rounded-lg flex items-center justify-center text-brand-orange">
                  <ICONS.MessageSquare size={16} />
                </div>
                <p className="text-[11px] font-bold text-brand-orange uppercase leading-relaxed tracking-wider">
                  Por segurança, enviaremos um código de verificação para o seu WhatsApp cadastrado.
                </p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirmar Usuário</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-teal focus:bg-white outline-none transition-all font-bold text-slate-700"
                  placeholder="Seu nome de usuário"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Receber Código no WhatsApp'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                  Voltar ao Login
                </button>
              </div>
            </form>
          )}

          {view === 'verify-reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-5 rounded-2xl bg-brand-teal/5 border border-brand-teal/10 text-center mb-6">
                <p className="text-[10px] font-black text-brand-teal-deep uppercase tracking-widest mb-1">Código enviado para:</p>
                <p className="text-xs font-black text-slate-600">{phone}</p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código de 6 dígitos</label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-teal text-center text-2xl font-black tracking-[0.5em] outline-none transition-all"
                  placeholder="000000"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha Forte</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-teal outline-none transition-all font-bold"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-teal text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-teal/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs mt-4 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Redefinir Senha'}
              </button>
            </form>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-10 group flex items-center justify-center gap-2 mx-auto text-slate-300 text-[9px] font-black hover:text-brand-teal transition-all uppercase tracking-[0.2em]"
          >
            <ICONS.ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
