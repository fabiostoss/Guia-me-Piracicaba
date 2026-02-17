
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryType } from '../types';
import { ICONS, WHATSAPP_ADMIN, PIRACICABA_NEIGHBORHOODS } from '../constants';
import NeighborhoodSelector from '../components/NeighborhoodSelector';

const MerchantRegister: React.FC = () => {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: CategoryType.RESTAURANTES,
    whatsapp: '+55',
    street: '',
    number: '',
    neighborhood: '',
    description: '',
    offersDelivery: false,
    offersPickup: false,
  });

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message = `*NOVA SOLICITAÇÃO DE CADASTRO - GUIA-ME PIRACICABA*
---------------------------------------
*Estabelecimento:* ${formData.name}
*Categoria:* ${formData.category}
*WhatsApp Contato:* ${formData.whatsapp}
---------------------------------------
*ENDEREÇO:*
*Rua/Av:* ${formData.street}, ${formData.number}
*Bairro:* ${formData.neighborhood}
---------------------------------------
*DESCRIÇÃO:*
${formData.description}
---------------------------------------
*SERVIÇOS:*
- Delivery: ${formData.offersDelivery ? 'Sim ✅' : 'Não ❌'}
- Retirada: ${formData.offersPickup ? 'Sim ✅' : 'Não ❌'}
---------------------------------------
_Enviado via formulário de cadastro_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_ADMIN}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    alert('Sua solicitação foi enviada! Você será redirecionado para o WhatsApp do administrador para concluir o cadastro.');
    navigate('/');
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+55')) {
      val = '+55' + val.replace(/\D/g, '');
    } else {
      const numbers = val.slice(3).replace(/\D/g, '');
      val = '+55' + numbers;
    }
    setFormData({ ...formData, whatsapp: val });
  };

  const benefits = [
    {
      icon: <ICONS.MessageCircle size={32} />,
      title: "Conexão Direta",
      desc: "Receba pedidos direto no seu WhatsApp. Sem taxas abusivas por venda ou intermediários."
    },
    {
      icon: <ICONS.Eye size={32} />,
      title: "Alta Visibilidade",
      desc: "Apareça para milhares de piracicabanos que buscam serviços locais todos os dias."
    },
    {
      icon: <ICONS.MapPin size={32} />,
      title: "Foco Regional",
      desc: "Sua marca posicionada no maior guia comercial exclusivo de Piracicaba."
    },
    {
      icon: <ICONS.Package size={32} />,
      title: "Painel Exclusivo",
      desc: "Gerencie seus horários, fotos e descrição em um painel simples e intuitivo."
    }
  ];

  return (
    <div className="pb-24">
      {/* Hero / Por que anunciar */}
      <section className="bg-brand-teal-deep pt-32 pb-48 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-96 h-96 bg-brand-orange rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-brand-teal rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <span className="text-brand-orange text-xs font-black uppercase tracking-[0.4em] mb-4 block animate-fade-in">Seu negócio no mapa</span>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none animate-slide-up">POTENCIALIZE SUAS <span className="text-brand-orange">VENDAS</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto font-bold text-lg leading-relaxed mb-16 animate-slide-up">
            Junte-se a centenas de comerciantes que já descobriram o poder de estar onde o cliente piracicabano procura.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, idx) => (
              <div key={idx} className={`bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[2.5rem] text-left hover:bg-white/10 transition-all group reveal stagger-${idx + 1}`}>
                <div className="text-brand-orange mb-6 group-hover:scale-110 transition-transform duration-500">
                  {b.icon}
                </div>
                <h3 className="text-white text-xl font-black mb-3">{b.title}</h3>
                <p className="text-white/50 text-sm font-medium leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="max-w-4xl mx-auto px-4 -mt-32 relative z-20 reveal">
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden ring-8 ring-slate-50">
          <div className="p-8 md:p-12 border-b border-slate-50 text-center">
            <h2 className="text-3xl font-black text-brand-teal-deep tracking-tight">Formulário de Adesão</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Nossa equipe entrará em contato em até 24h</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
            {/* Dados Básicos */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Identificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                  <input
                    required
                    placeholder="Ex: Pira Burguer"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Segmento</label>
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as CategoryType })}
                  >
                    {Object.values(CategoryType).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                <input
                  required
                  type="tel"
                  placeholder="+55 19..."
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all"
                  value={formData.whatsapp}
                  onChange={handleWhatsappChange}
                />
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Localização</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                  <input
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all"
                    value={formData.street}
                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº</label>
                  <input
                    required
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all"
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                <NeighborhoodSelector
                  value={formData.neighborhood}
                  onChange={val => setFormData({ ...formData, neighborhood: val })}
                  placeholder="Selecione o bairro..."
                  triggerClassName="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Detalhes */}
            <div className="space-y-6">
              <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest border-l-4 border-brand-teal pl-4">Detalhes do Negócio</h3>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sobre o seu Comércio</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva o que você vende ou qual serviço oferece..."
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center cursor-pointer p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all">
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg border-slate-300 text-brand-teal focus:ring-brand-teal mr-4"
                    checked={formData.offersDelivery}
                    onChange={e => setFormData({ ...formData, offersDelivery: e.target.checked })}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700">Delivery</span>
                    <span className="text-[9px] text-slate-400 font-medium">Faço entregas em Piracicaba</span>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all">
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg border-slate-300 text-brand-teal focus:ring-brand-teal mr-4"
                    checked={formData.offersPickup}
                    onChange={e => setFormData({ ...formData, offersPickup: e.target.checked })}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700">Retirada</span>
                    <span className="text-[9px] text-slate-400 font-medium">Aceito busca no local</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-brand-teal text-white py-6 rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-brand-teal/20 hover:bg-brand-teal-dark active:scale-[0.98] transition-all flex items-center justify-center gap-4"
              >
                <ICONS.MessageCircle size={24} />
                Solicitar Cadastro no Marketplace
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                Sua marca merece estar na vitrine oficial de Piracicaba.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default MerchantRegister;
