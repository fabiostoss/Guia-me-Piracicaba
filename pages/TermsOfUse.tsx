
import React from 'react';
import { ICONS } from '../constants';

const TermsOfUse: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Simples */}
      <section className="bg-brand-teal-deep py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Termos de Uso</h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Guia-me Piracicaba | Regras e Diretrizes da Plataforma</p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-100">
          <div className="prose prose-slate max-w-none space-y-10 text-slate-600 font-medium leading-relaxed">
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 italic">
              <h2 className="text-2xl font-black text-brand-teal-deep mb-4 not-italic">Acordo de Utilização</h2>
              <p>
                Ao acessar e utilizar o Guia-me Piracicaba, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concorda com qualquer parte destes termos, não deve utilizar nossa plataforma.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">1</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Natureza do Serviço</h3>
              </div>
              <p>
                O Guia-me Piracicaba atua exclusivamente como um <strong>guia comercial e ponte de conexão</strong> entre consumidores e lojistas de Piracicaba-SP. 
              </p>
              <p>
                Não realizamos transações financeiras dentro da plataforma, não processamos pagamentos e não nos responsabilizamos pela entrega física de produtos ou prestação de serviços. Toda a negociação e conclusão de venda ocorre diretamente entre as partes via WhatsApp ou outros canais externos.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">2</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Responsabilidades do Usuário</h3>
              </div>
              <ul className="list-disc pl-6 space-y-3">
                <li>Fornecer informações verdadeiras e precisas no formulário de identificação (nome, telefone e bairro).</li>
                <li>Utilizar a plataforma de maneira ética, respeitando os lojistas e demais usuários.</li>
                <li>Ter consciência de que o Guia-me Piracicaba não é responsável pela qualidade, segurança ou legalidade dos itens anunciados pelos comerciantes.</li>
                <li>É proibido o uso da plataforma para fins ilícitos, spam ou qualquer atividade que comprometa a estabilidade do sistema.</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">3</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Responsabilidades do Lojista</h3>
              </div>
              <p>
                Os comerciantes cadastrados são os únicos responsáveis por:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Manter seus dados de contato (WhatsApp) e horários de funcionamento atualizados.</li>
                <li>Honrar as ofertas e descrições publicadas em seu perfil na plataforma.</li>
                <li>Garantir que possuem todas as licenças e autorizações necessárias para comercializar seus produtos ou serviços em Piracicaba.</li>
                <li>Responder às solicitações dos clientes de forma respeitosa e ágil.</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">4</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Propriedade Intelectual</h3>
              </div>
              <p>
                O nome "Guia-me Piracicaba", logotipos, design da plataforma e conteúdo proprietário são protegidos por direitos autorais. As imagens de produtos e marcas dos lojistas são de propriedade de seus respectivos donos.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">5</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Modificações nos Termos</h3>
              </div>
              <p>
                Reservamos o direito de alterar estes Termos de Uso a qualquer momento. Alterações entrarão em vigor imediatamente após sua publicação no site. O uso continuado da plataforma após tais alterações constitui sua aceitação dos novos termos.
              </p>
            </div>

            <div className="pt-12 border-t border-slate-100 text-center">
              <p className="font-black text-brand-teal-deep uppercase tracking-widest text-sm">Atualizado em 15 de Junho de 2025</p>
              <p className="text-brand-orange font-black text-xl mt-2">Guia-me Piracicaba</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfUse;
