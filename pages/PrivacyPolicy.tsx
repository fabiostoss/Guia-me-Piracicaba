
import React from 'react';
import { Link } from 'react-router-dom';
import { ICONS } from '../constants';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-brand-teal p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <ICONS.ChevronLeft className="text-white" size={20} />
            </div>
            <span className="font-black text-brand-teal-deep text-sm uppercase tracking-widest">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <ICONS.Shield className="text-brand-orange" size={20} />
            <span className="font-black text-slate-800 text-sm uppercase tracking-widest hidden md:inline">Políticas de Privacidade</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-24 md:py-32">
        <article className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 prose prose-slate max-w-none prose-headings:font-black prose-headings:text-brand-teal-deep prose-a:text-brand-teal">
          <h1 className="text-3xl md:text-5xl mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-brand-teal-deep to-brand-teal">
            Política de Privacidade
          </h1>

          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-12 border-b border-slate-100 pb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </div>

          <h3>1. Introdução</h3>
          <p>
            O Guia-me Piracicaba ("nós", "nosso") respeita a sua privacidade e está comprometido em proteger os seus dados pessoais.
            Esta política de privacidade informará como cuidamos dos seus dados pessoais quando você visita nosso aplicativo e informa sobre seus direitos de privacidade.
          </p>

          <h3>2. Dados que Coletamos</h3>
          <p>Podemos coletar, usar, armazenar e transferir diferentes tipos de dados pessoais sobre você, que agrupamos da seguinte forma:</p>
          <ul>
            <li><strong>Dados de Identidade:</strong> inclui nome, sobrenome.</li>
            <li><strong>Dados de Contato:</strong> inclui número de telefone (WhatsApp) e endereço (bairro).</li>
            <li><strong>Dados Técnicos:</strong> inclui endereço de protocolo de internet (IP), tipo e versão do navegador, configuração e localização do fuso horário.</li>
          </ul>

          <h3>3. Como Usamos Seus Dados</h3>
          <p>Só usaremos seus dados pessoais quando a lei nos permitir. Mais comumente, usaremos seus dados pessoais nas seguintes circunstâncias:</p>
          <ul>
            <li>Para facilitar o contato com os lojistas cadastrados em nossa plataforma via WhatsApp.</li>
            <li>Para personalizar sua experiência com base no seu bairro (ex: mostrar distância e taxa de entrega).</li>
            <li>Para melhorar nosso site, produtos/serviços, marketing e relacionamento com o cliente.</li>
          </ul>

          <h3>4. Compartilhamento de Dados</h3>
          <p>
            Seus dados de identificação (nome e bairro) podem ser compartilhados com os lojistas parceiros <strong>apenas quando você inicia uma conversa ou realiza um pedido</strong> através da nossa plataforma, para facilitar o atendimento. Não vendemos seus dados para terceiros.
          </p>

          <h3>5. Segurança de Dados</h3>
          <p>
            Implementamos medidas de segurança apropriadas para impedir que seus dados pessoais sejam acidentalmente perdidos, usados ou acessados de forma não autorizada, alterados ou divulgados.
          </p>

          <h3>6. Seus Direitos Legais</h3>
          <p>Sob certas circunstâncias, você tem direitos sob as leis de proteção de dados (LGPD) em relação aos seus dados pessoais, incluindo o direito de solicitar acesso, correção, apagamento, restrição acesso aos seus dados pessoais.</p>

          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="flex items-center gap-2 text-brand-teal-deep m-0 mb-2">
              <ICONS.MessageCircle size={20} />
              Fale Conosco
            </h4>
            <p className="m-0 text-sm text-slate-600">
              Se você tiver alguma dúvida sobre esta política de privacidade ou nossas práticas de privacidade, entre em contato conosco através do e-mail: <a href="mailto:contato@guiamepiracicaba.com.br" className="font-bold">contato@guiamepiracicaba.com.br</a>
            </p>
          </div>
        </article>
      </main>

      <footer className="bg-white border-t border-slate-100 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Guia-me Piracicaba. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
