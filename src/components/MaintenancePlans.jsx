import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Lock, 
  Activity, 
  LifeBuoy, 
  Zap, 
  X, 
  Phone, 
  Mail, 
  User, 
  Globe, 
  Send,
  ShieldCheck,
  Server,
  CloudLightning,
  RefreshCcw,
  Cpu
} from 'lucide-react';

const MaintenancePlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Starter Care",
      price: "₦30,000 /mo",
      icon: <Settings className="w-8 h-8" />,
      image: "https://images.pexels.com/photos/175039/pexels-photo-175039.jpeg?auto=compress&cs=tinysrgb&w=600",
      features: ["Monthly Security Scans", "Database Backups", "Bug Fixes (48h)", "Software Updates"],
      color: "blue"
    },
    {
      name: "Business Plus",
      price: "₦85,000 /mo",
      icon: <RefreshCcw className="w-8 h-8" />,
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600",
      features: ["Weekly Backups", "Speed Optimization", "Priority Support", "Uptime Monitoring"],
      color: "emerald"
    },
    {
      name: "Corporate Pro",
      price: "₦150,000 /mo",
      icon: <Activity className="w-8 h-8" />,
      image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=600",
      features: ["Daily Backups", "Content Updates (5/mo)", "SEO Health Check", "Dedicated Tech Lead"],
      color: "purple",
      recommended: true
    },
    {
      name: "Enterprise Global",
      price: "₦350,000 /mo",
      icon: <Lock className="w-8 h-8" />,
      image: "https://images.pexels.com/photos/2881229/pexels-photo-2881229.jpeg?auto=compress&cs=tinysrgb&w=600",
      features: ["Real-time Backups", "Anti-DDoS Protection", "Server Management", "Security Firewall"],
      color: "indigo"
    },
    {
      name: "Elite Infinity",
      price: "Custom",
      icon: <Cpu className="w-8 h-8" />,
      image: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=600",
      features: ["24/7 Live Monitoring", "Zero Downtime Policy", "Unlimited Updates", "VIP Emergency Line"],
      color: "rose"
    }
  ];

  return (
    // NAN NE: Na sanya bg-blue-50 (Lite Blue) wanda yake da dadi a kallo
    <section id="maintenance" className="bg-[#f0f9ff] py-24 px-6 relative font-sans transition-colors duration-500">
      <div className="max-w-[1700px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black text-gray-900 mb-6 uppercase tracking-tight italic">Maintenance & Support Ecosystem</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">Ensuring 99.9% uptime and peak performance for your digital infrastructure.</p>
          <div className="w-24 h-2 bg-blue-600 mx-auto mt-8 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`group flex flex-col bg-white rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(30,58,138,0.15)] ${plan.recommended ? 'border-purple-600 ring-4 ring-purple-100 scale-105 z-10' : 'border-blue-100'}`}
            >
              <div className="h-40 w-full overflow-hidden rounded-t-[2.4rem] relative">
                <img 
                  src={plan.image} 
                  alt={plan.name} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/10"></div>
              </div>

              <div className="p-8 pt-6 flex flex-col flex-grow">
                {/* Dynamic BG color handling */}
                <div className={`p-4 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110 duration-500 ${
                  plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  plan.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  plan.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                  plan.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                  'bg-rose-50 text-rose-600'
                }`}>
                  {plan.icon}
                </div>
                
                <h3 className="text-xl font-black mb-1 text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-black text-blue-600 mb-6">{plan.price}</p>
                
                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-600 font-bold text-[11px] leading-tight">
                      <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${plan.recommended ? 'bg-purple-600 text-white shadow-xl hover:bg-purple-700' : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'}`}
                >
                  Activate Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ACTIVATION MODAL FORM --- */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/40 backdrop-blur-xl">
          <div className="bg-white text-gray-900 w-full max-w-xl rounded-[3.5rem] p-10 md:p-14 relative shadow-2xl animate-in zoom-in duration-300 max-h-[92vh] overflow-y-auto border-[8px] border-white">
            
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-10 right-10 p-3 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>
            
            <div className="mb-10 text-left">
              <span className="text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest bg-blue-600 text-white">
                Maintenance Request
              </span>
              <h2 className="text-4xl font-black mt-6 text-gray-900 tracking-tight">{selectedPlan.name}</h2>
              <p className="text-blue-600 mt-2 font-bold text-lg italic">Infrastructure Support Asset</p>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="md:col-span-1">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest"><User size={14}/> Full Name</label>
                <input type="text" placeholder="Johnathan Ayax" className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold transition-all" required />
              </div>

              <div className="md:col-span-1">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest"><Phone size={14}/> Phone / WhatsApp</label>
                <input type="tel" placeholder="+234..." className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold transition-all" required />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase mb-3 text-gray-400 tracking-widest"><Globe size={14}/> Asset URL (Website/App)</label>
                <input type="text" placeholder="https://yourportal.com" className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold transition-all" />
              </div>

              <div className="md:col-span-2">
                <button className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-95">
                  Confirm Activation <Send size={24} />
                </button>
                <p className="text-center text-[9px] text-gray-400 mt-6 uppercase font-black tracking-[0.4em]">Secure System Provisioning</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default MaintenancePlans;