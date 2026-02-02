import React from 'react';
import { 
  ArrowRight, 
  Rocket, 
  CheckCircle2, 
  ChevronRight, 
  MousePointer2 
} from 'lucide-react';

// Importing the sections we built earlier
import Navbar from '../../../src/components/Navbar';
import PricingCard from '../../../src/components/PricingCard';
import MaintenancePlans from '../../../src/components/MaintenancePlans';
import IndustrySolutions from '../../../src/components/IndustrySolutions';

const Home = () => {
  return (
    <div className="bg-white min-h-screen selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* --- PREMIUM HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 animate-pulse" />

        <div className="max-w-7xl mx-auto px-6 pt-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Content */}
            <div className="lg:w-1/2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                World Class Digital Agency
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black text-gray-900 leading-[0.9] mb-8">
                Building <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Digital</span> Realities.
              </h1>
              
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                At <span className="font-bold text-gray-900">AYAX Digital Solutions</span>, we turn effort into impact. From high-end apps to global-scale websites, we build it all.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="group px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-gray-200">
                  Launch Your Project 
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="px-8 py-4 border-2 border-gray-100 text-gray-700 rounded-2xl font-bold hover:border-blue-200 hover:bg-gray-50 transition-all">
                  Our Work
                </button>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold">User</div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Trusted by <span className="text-gray-900 font-bold">500+</span> organizations worldwide
                </p>
              </div>
            </div>

            {/* Right Side: Interactive Visual */}
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 bg-white p-2 rounded-[2.5rem] shadow-2xl border border-gray-100 transform hover:rotate-2 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80" 
                  alt="Ayax Dashboard" 
                  className="rounded-[2rem] w-full h-auto"
                />
              </div>
              {/* Floating Badge */}
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
      <PricingCard />

      {/* --- INDUSTRY SPECIFIC (Hospital/Gov) --- */}
      <IndustrySolutions />

      {/* --- MAINTENANCE ECOSYSTEM --- */}
      <MaintenancePlans />

      {/* --- FINAL CALL TO ACTION --- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Don’t wait for the future. <br /> <span className="text-blue-200">Build it today.</span>
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Ready to take your business to the global stage? Our team is waiting to turn your ideas into powerful digital realities.
            </p>
            <button className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-xl">
              Get Started <MousePointer2 />
            </button>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-500 text-sm">
        <p>© 2026 AYAX Digital Solutions. All Rights Reserved. Built for Impact.</p>
      </footer>
    </div>
  );
};

export default Home;