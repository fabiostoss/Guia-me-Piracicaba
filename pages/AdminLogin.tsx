
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ICONS } from '../constants';
import * as db from '../services/databaseService';
import { useUI } from '../components/CustomUI';
import emailjs from '@emailjs/browser';

const AdminLogin: React.FC = () => {
  const [view, setView] = useState<'login' | 'forgot-password' | 'verify-reset'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [screenPart, setScreenPart] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useUI();

  // Configurações do EmailJS
  const EMAILJS_SERVICE_ID = 'service_lbhqb29';
  const EMAILJS_TEMPLATE_ID = 'template_q3t253f';
  const EMAILJS_PUBLIC_KEY = 'KJd-u4DO4X_TOjre4';

  const EMAILJS_SUCCESS_TEMPLATE_ID = 'template_apcx9t3';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showNotification('Preencha os campos', 'warning');
      return;
    }

    setLoading(true);
    try {
      const isValid = await db.validateAdminLogin(username, password);
      if (isValid) {
        const token = await db.createAdminSession();
        if (token) {
          localStorage.setItem('pira_admin_auth', 'true');
          showNotification('Acesso autorizado!', 'success');
          navigate('/admin');
        }
      } else {
        showNotification('Dados incorretos', 'error');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      showNotification('Erro de conexão', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      showNotification('Informe seu usuário', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await db.generateAdminResetCode(username);
      if (result.success && result.email && result.screenPart && result.whatsappPartEncoded) {
        setEmail(result.email);
        setScreenPart(result.screenPart);

        const part2 = atob(result.whatsappPartEncoded);

        const templateParams = {
          code_part2: part2,
          to_email: result.email,
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        showNotification('E-mail enviado!', 'success');
        setView('verify-reset');
      } else {
        showNotification('Usuário não existe', 'error');
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      showNotification('Falha ao enviar segurança', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCodeInput || !newPassword) {
      showNotification('Preencha tudo', 'warning');
      return;
    }

    if (newPassword.length < 8) {
      showNotification('Mínimo 8 caracteres', 'warning');
      return;
    }

    setLoading(true);
    try {
      const success = await db.verifyAndResetAdminPassword(username, resetCodeInput, newPassword);
      if (success) {
        // Enviar e-mail de confirmação com as novas credenciais usando o NOVO MODELO
        const confirmParams = {
          to_email: email,
          user_name: username,
          new_password: newPassword,
        };

        try {
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_SUCCESS_TEMPLATE_ID,
            confirmParams,
            EMAILJS_PUBLIC_KEY
          );
        } catch (e) {
          console.error('Erro ao enviar confirmação:', e);
        }

        showNotification('Senha alterada e e-mail enviado!', 'success');
        setView('login');
        setPassword('');
        setResetCodeInput('');
      } else {
        showNotification('Código inválido', 'error');
      }
    } catch (error) {
      console.error('Erro no reset:', error);
      showNotification('Erro ao salvar senha', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-slate-100">
      {/* Decoração sutil */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-teal via-brand-orange to-brand-teal-deep"></div>

      <div className="bg-white max-w-sm w-full rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-white relative z-10 overflow-hidden">
        <div className="p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-teal/10 text-brand-teal mb-6">
            <ICONS.Shield size={24} />
          </div>

          <h1 className="text-xl font-black text-brand-teal-deep tracking-wider uppercase mb-1">
            {view === 'login' ? 'Autenticação' : 'Segurança'}
          </h1>
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em] mb-8">
            Guia-me Piracicaba • Admin
          </p>

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 ml-1 uppercase">Usuário</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-teal focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="admin"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 ml-1 uppercase">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-teal focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-teal text-white font-black py-4 rounded-xl shadow-lg shadow-brand-teal/20 hover:bg-brand-teal-deep transition-all uppercase tracking-widest text-[10px] mt-4 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Entrar'}
              </button>

              <button
                type="button"
                onClick={() => setView('forgot-password')}
                className="text-[9px] font-bold text-slate-400 hover:text-brand-orange uppercase tracking-widest mt-6 transition-colors block mx-auto"
              >
                Esqueci minha senha
              </button>
            </form>
          )}

          {view === 'forgot-password' && (
            <form onSubmit={handleSendResetEmail} className="space-y-6">
              <div className="p-5 rounded-xl bg-brand-teal/5 border border-brand-teal/10 text-left">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  Confirme seu usuário para receber o código no e-mail cadastrado.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-black text-slate-400 ml-1 uppercase">Confirmar Usuário</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-teal outline-none transition-all font-bold text-slate-700 text-sm"
                  placeholder="admin"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-teal text-white font-black py-4 rounded-xl shadow-lg shadow-brand-teal/20 hover:bg-brand-teal-deep transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Enviar E-mail'}
                </button>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {view === 'verify-reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-2xl p-6">
                  <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Parte 1 (Tela)</p>
                  <div className="text-4xl font-black text-brand-teal font-mono tracking-widest">
                    {screenPart}
                  </div>
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-3">Parte 2 enviada ao seu e-mail</p>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black text-slate-400 ml-1 uppercase">Código de 6 Dígitos</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetCodeInput}
                    onChange={(e) => setResetCodeInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-brand-teal text-center text-3xl font-black tracking-[0.3em] outline-none transition-all text-slate-700"
                    placeholder="------"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[9px] font-black text-slate-400 ml-1 uppercase">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 border border-slate-100 focus:border-brand-teal outline-none transition-all font-bold text-slate-700 text-sm"
                    placeholder="8+ caracteres"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-teal text-white font-black py-4 rounded-xl shadow-lg shadow-brand-teal/20 hover:bg-brand-teal-deep transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirmar Alteração'}
              </button>
            </form>
          )}

          <button
            onClick={() => navigate('/')}
            className="mt-8 group flex items-center justify-center gap-2 mx-auto text-slate-300 text-[8px] font-black hover:text-brand-teal transition-all uppercase tracking-widest"
          >
            <ICONS.ArrowLeft size={10} />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
