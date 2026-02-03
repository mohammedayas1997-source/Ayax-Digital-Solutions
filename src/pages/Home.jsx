import React from 'react';
import { 
  ArrowRight, 
  Rocket, 
  CheckCircle2, 
  ChevronRight, 
  MousePointer2,
  Zap,
  Globe,
  ShieldCheck,
  BookOpen,
  Phone,
  User,
  Mail,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; 

// Tabbatar wadannan files din suna nan a folder ta components
import Navbar from '../components/Navbar';
import PricingCard from '../components/PricingCard';
import MaintenancePlans from '../components/MaintenancePlans';
import IndustrySolutions from '../components/IndustrySolutions';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative pt-0 pb-16 overflow-hidden bg-[#020617] min-h-[85vh] flex items-center">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent -z-10" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] opacity-50 animate-pulse -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 pt-32"> 
          <div className="flex flex-col lg:flex-row items-center gap-10">            
            {/* Left Content */}
            <div className="lg:w-1/2 text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                World Class Digital Agency
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter">
                Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Digital</span> Realities.
              </h1>
              
              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-xl font-medium">
                At <span className="font-bold text-white">AYAX Digital Solutions</span>, we turn effort into impact. From high-end apps to global-scale websites, we build it all.
              </p>

              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/enroll')}
                  className="group px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all duration-300 shadow-xl shadow-blue-900/20"
                >
                  Apply for Courses 
                  <BookOpen size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
                
                <button 
                  onClick={() => navigate('/about')}
                  className="px-8 py-4 border-2 border-white/10 text-white rounded-2xl font-bold hover:bg-white/5 transition-all"
                >
                  Our Work
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">AYAX</div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Trusted by <span className="text-gray-300 font-bold">500+</span> organizations worldwide
                </p>
              </div>
            </div>

            {/* Right Side: Visual */}
            <div className="lg:w-1/2 relative group">
              <div className="relative z-10 bg-white/5 p-2 rounded-[2.5rem] shadow-2xl border border-white/10 backdrop-blur-sm transform hover:rotate-1 transition-transform duration-500 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80" 
                  alt="Ayax Dashboard" 
                  className="rounded-[2rem] w-full h-auto opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-blue-50 animate-bounce">
                <div className="p-3 bg-green-100 rounded-2xl text-green-600">
                  <CheckCircle2 />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Project Delivery</p>
                  <p className="text-xl font-bold text-gray-900">100% On Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES & PRICING --- */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-blue-600 font-black tracking-widest uppercase text-xs mb-4">Our Services</h2>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Solutions Tailored For You</h3>
        </div>
        <PricingCard />
      </section>

      {/* --- INDUSTRY SPECIFIC --- */}
      <section id="industry" className="py-24 bg-white">
        <IndustrySolutions />
      </section>

      {/* --- MAINTENANCE ECOSYSTEM --- */}
      <section id="maintenance" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Maintenance & Support</h3>
          <p className="text-gray-500 font-bold mt-2 text-sm uppercase tracking-widest">We ensure your digital systems never stop growing.</p>
        </div>
        <MaintenancePlans />
      </section>

      {/* --- STUDENT PORTAL GATEWAY (NEW) --- */}
      <section className="py-24 bg-[#020617] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <Lock className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Secured Learning Environment</span>
             </div>
             <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-6">Student <span className="text-blue-600">Infrastructure</span></h2>
             <p className="text-gray-400 text-lg font-medium mb-10 max-w-md leading-relaxed">
               Already enrolled? Access your technical dashboard to monitor curriculum progress, resources, and live project terminals.
             </p>
             <button 
               onClick={() => navigate('/login')}
               className="px-10 py-5 bg-white text-[#020617] rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-blue-50 transition-all group"
             >
               Enter Portal <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </button>
          </div>
          <div className="lg:w-1/2 grid grid-cols-2 gap-4">
             <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                <p className="text-3xl font-black text-white mb-1 tracking-tighter text-left">24/7</p>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-left">Uptime Access</p>
             </div>
             <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                <p className="text-3xl font-black text-white mb-1 tracking-tighter text-left">100+</p>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-left">HD Resources</p>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </section>

      {/* --- FINAL CALL TO ACTION --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
              Don’t wait for the future. <br /> <span className="text-blue-200">Build it today.</span>
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
              Ready to take your business to the global stage? Our team is waiting to turn your ideas into powerful digital realities.
            </p>
            <button 
              onClick={() => window.open('https://wa.me/2347087244444', '_blank')}
              className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-xl group uppercase tracking-widest text-xs"
            >
              Get Started <MousePointer2 className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#020617] py-20 px-6 text-center border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">
            AYAX <span className="text-blue-500">DIGITAL</span>
          </h2>
          <div className="flex justify-center gap-8 mb-10 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
            <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-blue-500 transition-colors">About</Link>
            <Link to="/enroll" className="hover:text-blue-500 transition-colors">Courses</Link>
            <Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
          </div>
          <p className="text-gray-500 text-xs max-w-md mx-auto leading-relaxed font-bold uppercase tracking-widest opacity-60">
            © 2026 AYAX Digital Solutions. All Rights Reserved. <br />
            <span className="text-blue-900 mt-4 block">Transforming ideas into digital impact.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;