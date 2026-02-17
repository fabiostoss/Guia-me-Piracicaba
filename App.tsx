
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Business, CategoryType, Customer } from './types';
import { INITIAL_BUSINESSES } from './data/mockData';
import { ICONS, CATEGORY_ICONS, WHATSAPP_ADMIN, PIRACICABA_NEIGHBORHOODS, INSTAGRAM_URL } from './constants';
import NeighborhoodSelector from './components/NeighborhoodSelector';
import Home from './pages/Home';
import BusinessDetail from './pages/BusinessDetail';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import MerchantLogin from './pages/MerchantLogin';
import MerchantDashboard from './pages/MerchantDashboard';
import MerchantRegister from './pages/MerchantRegister';
import TouristGuide from './pages/TouristGuide';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Jobs from './pages/Jobs';
import News from './pages/News';
import SeedOfficial from './pages/SeedOfficial';
import { Calendar, Clock as ClockIcon } from 'lucide-react';
import * as db from './services/databaseService';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const localAuth = localStorage.getItem('pira_admin_auth');
      if (!localAuth) {
        setIsAuthenticated(false);
        return;
      }
      const remoteAuth = await db.checkAdminSession();
      setIsAuthenticated(remoteAuth);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }
  return <>{children}</>;
};

const WeatherBar = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  const formatTime = (date: Date) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);

  return (
    <div className="bg-brand-teal-deep py-2.5 px-4 shadow-inner relative z-[60]">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] font-bold text-white/70 uppercase tracking-widest overflow-x-auto no-scrollbar whitespace-nowrap gap-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <ICONS.MapPin size={12} className="text-brand-orange" />
            <span>Piracicaba, SP</span>
          </div>
          <div className="flex items-center gap-4 border-l border-white/10 pl-4">
            <div className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-orange" /><span>{formatDate(now)}</span></div>
            <div className="flex items-center gap-1.5"><ClockIcon size={12} className="text-brand-orange" /><span className="tabular-nums">{formatTime(now)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Modal de Cadastro de Cliente
const CustomerRegistrationModal: React.FC<{
  onRegister: (customer: Customer) => void,
  onClose: () => void
}> = ({ onRegister, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+55');
  const [neighborhood, setNeighborhood] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 3) return alert('Por favor, informe seu nome completo.');
    if (!neighborhood) return alert('Por favor, selecione seu bairro.');

    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name,
      phone,
      neighborhood,
      createdAt: Date.now()
    };

    const created = await db.createCustomer(newCustomer);
    if (created) {
      onRegister(created);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-teal-deep/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in duration-300 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-300 hover:text-brand-orange transition-colors"
        >
          <ICONS.X size={24} />
        </button>
        <div className="text-center space-y-2">
          <div className="bg-brand-orange/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-brand-orange">
            <ICONS.UserCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-brand-teal-deep">Identifique-se</h2>
          <p className="text-slate-500 text-sm font-medium">Cadastro rápido para liberar seu pedido no WhatsApp.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input
              required
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="João Silva"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
            <input
              required
              type="tel"
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+55 19..."
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Onde você mora em Piracicaba?</label>
            <NeighborhoodSelector
              value={neighborhood}
              onChange={setNeighborhood}
              placeholder="Selecione o Bairro..."
              triggerClassName="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-bold outline-none focus:border-brand-teal focus:bg-white transition-all appearance-none"
            />
          </div>
          <button className="w-full bg-brand-teal text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-teal/20 hover:scale-105 active:scale-95 transition-all mt-4">
            Confirmar e Continuar
          </button>
        </form>
        <button onClick={onClose} className="w-full text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-500">Talvez depois</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [businessesData, customersData] = await Promise.all([
          db.getAllBusinesses(),
          db.getAllCustomers()
        ]);

        // If no businesses exist, seed with initial data
        if (businessesData.length === 0) {
          console.log('Seeding initial businesses...');
          for (const biz of INITIAL_BUSINESSES) {
            await db.createBusiness(biz);
          }
          const newBusinesses = await db.getAllBusinesses();
          setBusinesses(newBusinesses);
        } else {
          setBusinesses(businessesData);
        }

        setCustomers(customersData);

        // Try to restore current customer from localStorage (migration support)
        const savedCustomerId = localStorage.getItem('pira_current_customer');
        if (savedCustomerId) {
          try {
            const parsed = JSON.parse(savedCustomerId);
            if (parsed && parsed.id) {
              const customer = await db.getCustomerById(parsed.id);
              if (customer) {
                setCurrentCustomer(customer);
              }
            }
          } catch (e) {
            console.error('Error parsing saved customer:', e);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save current customer to localStorage for backward compatibility
  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('pira_current_customer', JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem('pira_current_customer');
    }
  }, [currentCustomer]);

  const addBusiness = useCallback(async (biz: Business) => {
    const created = await db.createBusiness({ ...biz, views: biz.views || 0 });
    if (created) {
      setBusinesses(prev => [created, ...prev]);
    }
  }, []);

  const updateBusiness = useCallback(async (biz: Business) => {
    // Optimistic update: update local state immediately
    setBusinesses(prev => prev.map(b => String(b.id) === String(biz.id) ? { ...b, ...biz } : b));

    // Sync with database
    const updated = await db.updateBusiness(biz);
    if (updated) {
      // Final sync with data from server
      setBusinesses(prev => prev.map(b => String(b.id) === String(biz.id) ? updated : b));
    }
  }, []);

  const incrementView = useCallback(async (id: string) => {
    await db.incrementBusinessViews(id);
    setBusinesses(prev => prev.map(b =>
      String(b.id) === String(id) ? { ...b, views: (b.views || 0) + 1 } : b
    ));
  }, []);

  const deleteBusiness = async (id: string) => {
    const success = await db.deleteBusiness(id);
    if (success) {
      setBusinesses(prev => prev.filter(b => String(b.id) !== String(id)));
    }
  };

  const handleRegisterCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer]);
    setCurrentCustomer(customer);
    setCustomerModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const checkCustomerAuth = (onAuth: () => void) => {
    if (currentCustomer) {
      onAuth();
    } else {
      setPendingAction(() => onAuth);
      setCustomerModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-teal mx-auto"></div>
          <p className="text-brand-teal-deep font-bold">Carregando Guia-me Piracicaba...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-slate-50">
        <WeatherBar />
        <nav className="bg-white sticky top-0 z-50 shadow-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="bg-brand-teal p-2.5 rounded-xl shadow-lg shadow-brand-teal/20"><ICONS.Package className="text-white w-6 h-6" /></div>
              <div><span className="text-2xl font-black text-brand-teal-deep tracking-tight block">Guia-me</span><span className="text-xs font-bold text-brand-orange tracking-[0.2em] uppercase">Piracicaba</span></div>
            </Link>
            <div className="hidden md:flex items-center space-x-12">
              <Link to="/" className="text-slate-600 hover:text-brand-teal font-bold transition-colors">Início</Link>
              <Link to="/noticias" className="text-slate-600 hover:text-brand-teal font-bold transition-colors">Noticias</Link>
              <Link to="/guia-turistico" className="text-slate-600 hover:text-brand-teal font-bold transition-colors">Guia Turístico</Link>
              <Link to="/vagas" className="text-slate-600 hover:text-brand-teal font-bold transition-colors">Vagas</Link>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="bg-brand-teal text-white px-8 py-3 rounded-2xl font-black text-sm uppercase transition-all hover:bg-brand-teal-dark active:scale-95 shadow-lg shadow-brand-teal/10">Anunciar</a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              {currentCustomer && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-brand-orange flex items-center justify-center text-white text-[8px] font-black">
                    {currentCustomer.name.charAt(0)}
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 bg-slate-50 rounded-xl text-brand-teal-deep hover:bg-brand-teal/10 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <ICONS.X size={24} /> : <ICONS.Menu size={24} />}
              </button>
            </div>

            {currentCustomer && (
              <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-[10px] font-black">
                  {currentCustomer.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-brand-teal-deep uppercase leading-none">{currentCustomer.name.split(' ')[0]}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{currentCustomer.neighborhood}</span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Side Menu (Overlay) */}
          {isMenuOpen && (
            <div
              className="md:hidden fixed inset-0 z-40 bg-brand-teal-deep/20 backdrop-blur-sm animate-fade-in"
              onClick={() => setIsMenuOpen(false)}
            />
          )}

          {/* Mobile Menu Transitions */}
          <div className={`md:hidden fixed top-24 left-4 right-4 z-50 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 flex flex-col gap-6 transition-all duration-300 transform ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-brand-teal-deep font-black uppercase text-xs tracking-widest hover:bg-brand-teal/10 transition-all">
              <div className="p-2 bg-white rounded-xl shadow-sm"><ICONS.HomeIcon size={18} className="text-brand-teal" /></div>
              Início
            </Link>
            <Link to="/noticias" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-brand-teal-deep font-black uppercase text-xs tracking-widest hover:bg-brand-teal/10 transition-all">
              <div className="p-2 bg-white rounded-xl shadow-sm"><ICONS.Newspaper size={18} className="text-brand-teal" /></div>
              Noticias
            </Link>
            <Link to="/guia-turistico" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-brand-teal-deep font-black uppercase text-xs tracking-widest hover:bg-brand-teal/10 transition-all">
              <div className="p-2 bg-white rounded-xl shadow-sm"><ICONS.MapPin size={18} className="text-brand-teal" /></div>
              Guia Turístico
            </Link>
            <Link to="/vagas" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-brand-teal-deep font-black uppercase text-xs tracking-widest hover:bg-brand-teal/10 transition-all">
              <div className="p-2 bg-white rounded-xl shadow-sm"><ICONS.Briefcase size={18} className="text-brand-teal" /></div>
              Vagas de Emprego
            </Link>
            <hr className="border-slate-100 my-2" />
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-brand-teal text-white py-5 rounded-2xl font-black text-center uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-brand-teal/20"
            >
              Anunciar no Guia
            </a>
            <div className="text-center pt-2">
              <Link to="/merchant-login" onClick={() => setIsMenuOpen(false)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-teal">Painel do Lojista</Link>
            </div>
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home businesses={businesses} checkAuth={checkCustomerAuth} />} />
            <Route path="/guia-turistico" element={<TouristGuide />} />
            <Route path="/vagas" element={<Jobs />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/seed-official" element={<SeedOfficial />} />
            <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
            <Route path="/termos-de-uso" element={<TermsOfUse />} />
            <Route path="/business/:id" element={<BusinessDetail businesses={businesses} onIncrementView={incrementView} checkAuth={checkCustomerAuth} />} />
            <Route path="/merchant-login" element={<MerchantLogin businesses={businesses} />} />
            <Route path="/merchant-register" element={<MerchantRegister />} />
            <Route path="/merchant-dashboard" element={<MerchantDashboard businesses={businesses} onUpdate={updateBusiness} />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Admin
                    businesses={businesses}
                    customers={customers}
                    onAdd={addBusiness}
                    onUpdate={updateBusiness}
                    onDelete={deleteBusiness}
                  />
                </ProtectedAdminRoute>
              }
            />
          </Routes>
        </main>

        <footer className="bg-brand-teal-deep py-20 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            <div className="md:col-span-1 space-y-6">
              <div className="flex items-center justify-center md:justify-start space-x-2.5">
                <div className="bg-brand-orange p-1.5 rounded-lg"><ICONS.Package className="text-white w-5 h-5" /></div>
                <span className="text-xl font-black">Guia-me Piracicaba</span>
              </div>
              <p className="text-white/60 text-sm font-medium">Conectando Piracicaba. O guia definitivo para encontrar os melhores comércios locais.</p>
            </div>
            <div>
              <h4 className="font-bold text-brand-orange mb-8 uppercase text-xs tracking-widest">Serviços</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><Link to="/guia-turistico" className="hover:text-brand-orange transition-colors">Turismo Local</Link></li>
                <li><Link to="/noticias" className="hover:text-brand-orange transition-colors">Notícias Regionais</Link></li>
                <li><Link to="/vagas" className="hover:text-brand-orange transition-colors">Vagas de Emprego</Link></li>
                <li><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="hover:text-brand-orange transition-colors">Anunciar no Instagram</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-brand-orange mb-8 uppercase text-xs tracking-widest">Acesso</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><Link to="/merchant-login" className="hover:text-brand-orange transition-colors">Login Lojista</Link></li>
                <li><Link to="/admin" className="hover:text-brand-orange transition-colors">Painel Admin</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-brand-orange mb-8 uppercase text-xs tracking-widest">Jurídico</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><Link to="/politica-de-privacidade" className="hover:text-brand-orange transition-colors">Privacidade</Link></li>
                <li><Link to="/termos-de-uso" className="hover:text-brand-orange transition-colors">Termos de Uso</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-white/10 text-center text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
            © 2025 Guia-me Piracicaba - Todos os direitos reservados
          </div>
        </footer>

        {
          customerModalOpen && (
            <CustomerRegistrationModal
              onRegister={handleRegisterCustomer}
              onClose={() => setCustomerModalOpen(false)}
            />
          )
        }

        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white p-3.5 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 ring-4 ring-white/10 shadow-purple-500/20"><ICONS.Instagram size={24} /></a>
      </div >
    </Router >
  );
};

export default App;
