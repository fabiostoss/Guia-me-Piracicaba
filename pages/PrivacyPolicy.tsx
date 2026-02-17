
import React from 'react';
import { ICONS } from '../constants';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Simples */}
      <section className="bg-brand-teal-deep py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Política de Privacidade</h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Guia-me Piracicaba | Compromisso com sua segurança</p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-4xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-100">
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed">
            
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 italic">
              <h2 className="text-2xl font-black text-brand-teal-deep mb-4 not-italic">Bem Vindo ao Guia-me Piracicaba</h2>
              <p>
                Pedimos que leia com atenção as informações contidas em nossa política de privacidade, para conhecer as vantagens, facilidades e recursos disponíveis no site, bem como os termos e condições em que suas informações pessoais serão utilizadas, entre outros aspectos importantes.
              </p>
              <p className="mt-4">
                Esta política está sujeita a atualizações quando mostrar-se necessário, portanto, verifique sempre as eventuais mudanças ocorridas, mantendo-se em dia com os novos procedimentos adotados.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">1</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Privacidade</h3>
              </div>
              <p>
                O Guia-me Piracicaba é um serviço desenvolvido visando atender as necessidades da região, sem infringir a sua privacidade on-line, assegurando que suas informações pessoais sejam respeitadas e protegidas dentro das dependências do Portal.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">2</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Informações Coletadas</h3>
              </div>
              <p>
                Através do Guia-me Piracicaba, nossa empresa busca criar um canal de comunicação com você, oferecendo serviços e informações para poder atender as necessidades, expectativas e preferências dos internautas.
              </p>
              <p>
                Os seus dados pessoais serão coletados quando e se você desejar preencher um de nossos formulários. Você perceberá que algumas informações são essenciais para seu cadastramento, sendo certo que outras se fazem importantes para que o Portal possa identifica-lo e atendê-lo melhor.
              </p>
              <p>
                Você poderá atualizar, adicionar ou até mesmo excluir, a qualquer tempo, quaisquer informações que tenham sido compartilhadas conosco. Para tanto, basta solicitar-nos. Seus dados pessoais somente serão para uso exclusivo de nossa empresa, e não serão divulgados para terceiros sem a devida autorização do usuário.
              </p>
              <p>
                Os Usuários garantem e respondem, em qualquer caso, pela veracidade, precisão, vigência e autenticidade dos Dados Pessoais fornecidos, e se comprometem a mantê-los devidamente atualizados.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">3</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Links a outros Web Sites</h3>
              </div>
              <p>
                A Empresa não se responsabiliza por danos provocados por vírus, ou qualquer outro tipo de ameaça virtual aos usuários do Portal, mesmo, que vindos de links citados no site.
              </p>
              <p>
                É certo que o Guia-me Piracicaba envidará seus melhores esforços para só inserir em seu Portal links de empresas idôneas e confiáveis. Porém, não somos responsáveis pelas informações, produtos e serviços obtidos pelos usuários em referidos sites, nem tampouco pelas práticas comerciais e políticas de privacidade adotadas por estas empresas.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">4</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Os Cookies e Web Beacons</h3>
              </div>
              <p>
                Este site pode utilizar cookies e/ou web beacons quando um usuário tem acesso às páginas. Os cookies que podem ser utilizados associam-se (se for o caso) unicamente com o navegador de um determinado computador.
              </p>
              <p>
                O usuário tem a possibilidade de configurar seu navegador para ser avisado, na tela do computador, sobre a recepção dos cookies e para impedir a sua instalação no disco rígido. As informações pertinentes a esta configuração estão disponíveis em instruções e manuais do próprio navegador.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-brand-orange">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center font-black">5</div>
                <h3 className="text-xl font-black uppercase tracking-tight">Publicidade via terceiros</h3>
              </div>
              <p>
                Usamos empresas de publicidade de terceiros para veicular anúncios durante a sua visita ao nosso website. Essas empresas podem usar informações (que não incluem o seu nome, endereço, endereço de e-mail ou número de telefone) sobre suas visitas a este e a outros websites a fim de exibir anúncios relacionados a produtos e serviços de seu interesse.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>O Google, como fornecedor de terceiros, utiliza cookies para exibir anúncios no seu site.</li>
                <li>Com o cookie DART, o Google pode exibir anúncios para seus usuários com base nas visitas feitas aos seus e a outros sites na Internet.</li>
                <li>Os usuários podem desativar o cookie DART visitando a Política de privacidade da rede de conteúdo e dos anúncios do Google.</li>
              </ul>
            </div>

            <div className="pt-12 border-t border-slate-100 text-center">
              <p className="font-black text-brand-teal-deep uppercase tracking-widest text-sm">Atenciosamente,</p>
              <p className="text-brand-orange font-black text-xl mt-2">Diretoria Guia-me Piracicaba</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
