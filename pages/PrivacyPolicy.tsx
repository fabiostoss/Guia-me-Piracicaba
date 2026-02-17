import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

const PrivacyPolicy: React.FC = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'intro',
      icon: <ICONS.Info className="w-6 h-6 text-brand-teal" />,
      title: "1. Introdução",
      content: (
        <p className="text-slate-600 leading-relaxed">
          O <strong className="text-brand-teal-deep">Guia-me Piracicaba</strong> ("nós", "nosso") respeita a sua privacidade e está comprometido em proteger os seus dados pessoais.
          Esta política de privacidade informará como cuidamos dos seus dados pessoais quando você visita nosso aplicativo e informa sobre seus direitos de privacidade.
        </p>
      )
    },
    {
      id: 'collection',
      icon: <ICONS.UserCheck className="w-6 h-6 text-brand-orange" />,
      title: "2. Dados que Coletamos",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Podemos coletar, usar, armazenar e transferir diferentes tipos de dados pessoais sobre você, que agrupamos da seguinte forma:</p>
          <ul className="space-y-3 mt-4">
            <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="bg-brand-orange/10 p-1.5 rounded-lg text-brand-orange shrink-0 mt-0.5">
                <ICONS.Check size={14} strokeWidth={3} />
              </span>
              <span><strong className="text-slate-800">Dados de Identidade:</strong> inclui nome, sobrenome.</span>
            </li>
            <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="bg-brand-orange/10 p-1.5 rounded-lg text-brand-orange shrink-0 mt-0.5">
                <ICONS.MapPin size={14} strokeWidth={3} />
              </span>
              <span><strong className="text-slate-800">Dados de Contato:</strong> inclui número de telefone (WhatsApp) e endereço (bairro).</span>
            </li>
            <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="bg-brand-orange/10 p-1.5 rounded-lg text-brand-orange shrink-0 mt-0.5">
                <ICONS.Smartphone size={14} strokeWidth={3} />
              </span>
              <span><strong className="text-slate-800">Dados Técnicos:</strong> inclui endereço de protocolo de internet (IP), tipo e versão do navegador, configuração e localização do fuso horário.</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'usage',
      icon: <ICONS.Zap className="w-6 h-6 text-amber-500" />,
      title: "3. Como Usamos Seus Dados",
      content: (
        <div className="space-y-4 text-slate-600 leading-relaxed">
          <p>Só usaremos seus dados pessoais quando a lei nos permitir. Mais comumente, usaremos seus dados pessoais nas seguintes circunstâncias:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
              <h5 className="font-bold text-amber-700 text-sm mb-2 uppercase tracking-wide">Comunicação</h5>
              <p className="text-sm">Para facilitar o contato com os lojistas cadastrados em nossa plataforma via WhatsApp.</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
              <h5 className="font-bold text-amber-700 text-sm mb-2 uppercase tracking-wide">Personalização</h5>
              <p className="text-sm">Para personalizar sua experiência com base no seu bairro (ex: mostrar distância e taxa de entrega).</p>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50 md:col-span-2">
              <h5 className="font-bold text-amber-700 text-sm mb-2 uppercase tracking-wide">Melhorias</h5>
              <p className="text-sm">Para melhorar nosso site, produtos/serviços, marketing e relacionamento com o cliente.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'sharing',
      icon: <ICONS.ExternalLink className="w-6 h-6 text-indigo-500" />,
      title: "4. Compartilhamento de Dados",
      content: (
        <p className="text-slate-600 leading-relaxed">
          Seus dados de identificação (nome e bairro) podem ser compartilhados com os lojistas parceiros <strong className="text-indigo-600 bg-indigo-50 px-1 rounded">apenas quando você inicia uma conversa ou realiza um pedido</strong> através da nossa plataforma, para facilitar o atendimento. Não vendemos seus dados para terceiros.
        </p>
      )
    },
    {
      id: 'security',
      icon: <ICONS.Shield className="w-6 h-6 text-emerald-500" />,
      title: "5. Segurança de Dados",
      content: (
        <p className="text-slate-600 leading-relaxed">
          Implementamos medidas de segurança apropriadas para impedir que seus dados pessoais sejam acidentalmente perdidos, usados ou acessados de forma não autorizada, alterados ou divulgados. Utilizamos criptografia e protocolos seguros.
        </p>
      )
    },
    {
      id: 'rights',
      icon: <ICONS.BadgeCheck className="w-6 h-6 text-brand-teal-deep" />,
      title: "6. Seus Direitos Legais",
      content: (
        <p className="text-slate-600 leading-relaxed">
          Sob certas circunstâncias, você tem direitos sob as leis de proteção de dados (LGPD) em relação aos seus dados pessoais, incluindo o direito de solicitar acesso, correção, apagamento, restrição acesso aos seus dados pessoais.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">

      {/* Hero Header Moderno */}
      <div className="relative bg-brand-teal-deep text-white py-20 md:py-32 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-teal blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-brand-orange blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors group bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/20">
            <ICONS.ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Voltar para Início</span>
          </Link>

          <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-2xl shadow-brand-teal-deep/50 ring-1 ring-white/20">
            <ICONS.Shield size={48} className="text-brand-orange drop-shadow-lg" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Política de <span className="text-brand-teal-light">Privacidade</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Sua segurança e transparência são nossas prioridades. Entenda como cuidamos dos seus dados.
          </p>

          <div className="mt-8 inline-block bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Última atualização: <span className="text-white">{new Date().toLocaleDateString('pt-BR')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo em Cards */}
      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20 space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100/50 hover:shadow-2xl hover:border-brand-teal/20 transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-50 pb-6">
              <div className="bg-slate-50 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:bg-white group-hover:shadow-md">
                {section.icon}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                {section.title}
              </h2>
            </div>
            <div className="pl-0 md:pl-4">
              {section.content}
            </div>
          </div>
        ))}

        {/* Card de Contato */}
        <div className="bg-gradient-to-br from-brand-teal-deep to-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl shadow-brand-teal-deep/30 relative overflow-hidden mt-12 text-center md:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-teal/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
            <div>
              <h3 className="text-2xl font-black mb-3 flex items-center gap-3 justify-center md:justify-start">
                <ICONS.MessageCircle className="text-brand-orange" />
                Ficou com dúvidas?
              </h3>
              <p className="text-slate-300 leading-relaxed max-w-md">
                Nossa equipe está à disposição para esclarecer qualquer ponto sobre seus dados e privacidade.
              </p>
            </div>

            <a
              href="mailto:contato@guiamepiracicaba.com.br"
              className="bg-white text-brand-teal-deep px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-brand-orange hover:text-white transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </div>

      <footer className="mt-24 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
        &copy; {new Date().getFullYear()} Guia-me Piracicaba.
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
