
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { getLatestJobs, OFFICIAL_JOBS_URL } from '../services/jobService';
import { JobVacancy } from '../types';

const Jobs: React.FC = () => {
  const jobs = getLatestJobs();
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);

  const closeModal = () => setSelectedJob(null);

  return (
    <div className="pb-24">
      {/* Hero Jobs */}
      <section className="bg-brand-teal-deep pt-32 pb-24 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-teal/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <span className="text-brand-orange text-xs font-black uppercase tracking-[0.4em] mb-4 block">Oportunidades em Pira</span>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none">VAGAS DE <span className="text-brand-orange">EMPREGO</span></h1>
          <p className="text-white/60 max-w-2xl mx-auto font-bold text-lg leading-relaxed mb-12">
            Encontre sua próxima oportunidade no mercado de trabalho piracicabano. Listamos as principais vagas locais.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[3rem] max-w-2xl mx-auto">
            <h2 className="text-white text-xl font-black mb-4 flex items-center justify-center gap-3">
              <ICONS.Info size={24} className="text-brand-orange" />
              Fonte Oficial de Vagas
            </h2>
            <p className="text-white/70 text-sm font-medium mb-8">
              Para acessar o Painel de Vagas completo da Prefeitura de Piracicaba (SINE) em tempo real, clique no botão abaixo.
            </p>
            <a
              href={OFFICIAL_JOBS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-brand-orange text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-orange/20 hover:scale-105 active:scale-95 transition-all"
            >
              Acessar Painel da Prefeitura
              <ICONS.ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Vacancies List */}
      <section className="max-w-7xl mx-auto px-4 mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-brand-teal-deep mb-2">Vagas Recentes</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Atualizado frequentemente com dados locais</p>
          </div>
          <div className="bg-slate-100 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
            {jobs.length} Oportunidades disponíveis
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden">
              {/* Decorative gradient blob on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="flex justify-between items-start mb-6 relative">
                <div className="w-14 h-14 rounded-2xl bg-brand-teal/5 flex items-center justify-center text-brand-teal mt-1 group-hover:bg-brand-teal group-hover:text-white transition-colors duration-300">
                  <ICONS.Briefcase size={24} />
                </div>
                <span className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border transition-colors ${job.type === 'Efetivo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' :
                    job.type === 'Estágio' ? 'bg-brand-orange/5 text-brand-orange border-brand-orange/10' :
                      'bg-brand-teal/5 text-brand-teal border-brand-teal/10'
                  }`}>
                  {job.type}
                </span>
              </div>

              <div className="mb-6 relative">
                <h3 className="text-xl font-black text-brand-teal-deep mb-2 group-hover:text-brand-teal transition-colors leading-tight line-clamp-2" title={job.role}>
                  {job.role}
                </h3>
                <p className="text-brand-orange text-[10px] font-black uppercase tracking-widest line-clamp-1">
                  {job.company}
                </p>
              </div>

              <div className="space-y-4 mb-8 flex-grow relative">
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 group-hover:border-brand-teal/10 transition-colors">
                  <p className="text-slate-500 text-xs font-medium leading-relaxed italic line-clamp-3">
                    "{job.requirements}"
                  </p>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-xs px-2">
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Salário:</span>
                    {job.salary}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-50 flex flex-col gap-4 mt-auto relative">
                <div className="flex items-center text-slate-400 text-[9px] font-black uppercase tracking-widest">
                  <ICONS.MapPin size={14} className="mr-2 text-brand-orange" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                    {job.postedAt}
                  </span>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-brand-teal font-black text-[9px] uppercase tracking-widest flex items-center gap-2 group/btn hover:text-brand-orange transition-colors"
                  >
                    Ver Detalhes
                    <ICONS.ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div className="mt-24 bg-slate-50 rounded-[4rem] p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 border border-slate-100">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-brand-orange/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="bg-white w-48 h-48 rounded-[3rem] shadow-2xl flex items-center justify-center text-brand-orange relative z-10 border border-slate-100">
                <ICONS.UserCheck size={80} />
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3 text-center md:text-left space-y-6">
            <h2 className="text-4xl font-black text-brand-teal-deep leading-tight">Dicas para se destacar em <span className="text-brand-orange">Piracicaba</span></h2>
            <p className="text-slate-500 font-medium text-lg">
              Mantenha seu currículo atualizado, destaque suas experiências locais e esteja atento às convocações no site oficial. O mercado de trabalho piracicabano valoriza proatividade e conhecimento regional.
            </p>
            <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
              <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 font-black text-[10px] uppercase tracking-widest text-brand-teal flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-teal rounded-full"></div> Currículo Moderno
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 font-black text-[10px] uppercase tracking-widest text-brand-teal flex items-center gap-3">
                <div className="w-2 h-2 bg-brand-teal rounded-full"></div> Networking Local
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Detalhes da Vaga */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-teal-deep/60 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Absolute Position */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors z-10"
            >
              <ICONS.X size={20} />
            </button>

            <div className="p-6 md:p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="bg-brand-teal/10 p-3 rounded-xl text-brand-teal shrink-0">
                  <ICONS.Briefcase size={24} />
                </div>
                <div>
                  <span className="text-brand-orange text-[9px] font-black uppercase tracking-[0.2em] mb-1 block">
                    {selectedJob.company}
                  </span>
                  <h2 className="text-2xl font-black text-brand-teal-deep leading-tight">
                    {selectedJob.role}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                  {selectedJob.type}
                </span>
                {selectedJob.salary && (
                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                    {selectedJob.salary}
                  </span>
                )}
                <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-1">
                  <ICONS.MapPin size={14} className="text-brand-orange" />
                  <span>{selectedJob.location}</span>
                </div>
              </div>

              <div className="space-y-4 border-y border-slate-100 py-5">
                <div>
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Requisitos e Descrição</h4>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed bg-slate-50 p-4 rounded-xl max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    {selectedJob.requirements}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={OFFICIAL_JOBS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-brand-teal text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-teal/20 hover:bg-brand-teal-dark active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                  Candidatar-se Agora
                  <ICONS.ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-widest">
                  Publicado {selectedJob.postedAt}
                </p>
              </div>
            </div>
          </div>
          {/* Overlay invisível para fechar clicando fora */}
          <div className="absolute inset-0 -z-10" onClick={closeModal}></div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
