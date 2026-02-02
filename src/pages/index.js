import React from 'react';
import { ArrowRight, Code2, Globe2, Rocket, Zap, ShieldCheck, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import PricingCard from '../components/PricingCard';
import MaintenancePlans from '../components/MaintenancePlans';
import IndustrySolutions from '../components/IndustrySolutions';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-6 animate-bounce">
            <Rocket className="w-4 h-4" /> Build the Future Digitally
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-8">
            Turn Effort into <span className="text-blue-600">Impact</span> <br />
            and Ideas into <span className="text-indigo-600">Reality.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
            We empower businesses, schools, and organizations through world-class website design, 
            mobile app development, and high-performance digital marketing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              Start Your Project <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-blue-600 transition-all">
              View Portfolio
            </button>
          </div>
        </div>
        
        {/* Background Decorative Circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-100/30 rounded-full blur-3xl -z-0"></div>
      </header>

      {/* --- STATS / TRUST SECTION --- */}
      <section className="py-12 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600">100+</p>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Projects Delivered</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">50+</p>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Global Clients</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">99.9%</p>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Uptime Support</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">24/7</p>
            <p className="text-sm text-gray-500 uppercase tracking-widest">Expert Help</p>
          </div>
        </div>
      </section>

      {/* --- CORE SERVICES (REUSING COMPONENTS) --- */}
      <PricingCard />
      
      {/* --- SPECIALIZED INDUSTRY SOLUTIONS --- */}
      <IndustrySolutions />

      {/* --- WHY CHOOSE US --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Why Partner with Ayax Digital?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-green-100 rounded-xl text-green-600 h-fit"><ShieldCheck /></div>
                  <div>
                    <h4 className="font-bold text-xl">Bank-Grade Security</h4>
                    <p className="text-gray-600">We prioritize the safety of your data with end-to-end encryption.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600 h-fit"><Zap /></div>
                  <div>
                    <h4 className="font-bold text-xl">High Performance</h4>
                    <p className="text-gray-600">Ultra-fast loading speeds optimized for SEO and global ranking.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl text-purple-600 h-fit"><Users /></div>
                  <div>
                    <h4 className="font-bold text-xl">Scalable Architecture</h4>
                    <p className="text-gray-600">Systems that grow as your business scales from 10 to 1 million users.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-3xl h-[400px] flex items-center justify-center border-2 border-dashed border-gray-300">
               <span className="text-gray-400 font-medium">Video Showcase / Product Demo</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAINTENANCE SECTION --- */}
      <MaintenancePlans />

      {/* --- FOOTER CTA --- */}
      <section className="bg-blue-600 py-20 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to Build Your Digital Future?</h2>
        <p className="mb-10 text-blue-100 text-lg">Don’t wait for the future - build it digitally today.</p>
        <button className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all shadow-2xl">
          Get a Free Consultation
        </button>
      </section>
    </div>
  );
};

export default HomePage;