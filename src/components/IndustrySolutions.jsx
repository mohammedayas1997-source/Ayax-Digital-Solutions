import React, { useState } from 'react';
import { HeartPulse, Landmark, GraduationCap, X, Phone, Send, Mail, User, Building2, MessageSquare } from 'lucide-react';

const IndustrySolutions = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const industries = [
    {
      title: "Smart Hospital Systems",
      icon: <HeartPulse />,
      color: "text-red-500",
      tiers: [
        { name: "Pro Care", price: "₦550,000", feature: "Patient Portal & Lab Results" },
        { name: "Global Telemed", price: "₦1,500,000+", feature: "AI Diagnosis & Video Consulting" }
      ]
    },
    {
      title: "Government E-Portals",
      icon: <Landmark />,
      color: "text-emerald-600",
      tiers: [
        { name: "E-Governance", price: "₦1,500,000", feature: "Digital Forms & Public Records" },
        { name: "Smart City", price: "₦5,000,000+", feature: "E-Voting & Blockchain Security" }
      ]
    },
    {
      title: "School Management System",
      icon: <GraduationCap />,
      color: "text-blue-500",
      tiers: [
        { name: "Basic School", price: "₦150,000", feature: "Attendance & Result Sheets" },
        { name: "Standard School", price: "₦350,000", feature: "Fees Management & SMS Alerts" },
        { name: "Premium School", price: "₦750,000", feature: "Mobile App & E-Learning Portal" }
      ]
    }
  ];

  return (
    <div className="bg-gray-900 py-20 text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12 text-center underline decoration-emerald-500 tracking-tight">
          Enterprise Industry Solutions
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {industries.map((industry, i) => (
            <div key={i} className="bg-gray-800 p-10 rounded-3xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 shadow-2xl">
              <div className={`mb-6 flex items-center gap-4 text-2xl font-bold ${industry.color}`}>
                {industry.icon} {industry.title}
              </div>
              <div className="space-y-6">
                {industry.tiers.map((tier, j) => (
                  <div 
                    key={j} 
                    onClick={() => setSelectedPlan({ ...tier, industry: industry.title })}
                    className="flex justify-between items-center border-b border-gray-700 pb-4 cursor-pointer group hover:bg-gray-700/50 p-3 rounded-xl transition-all"
                  >
                    <div>
                      <p className="font-bold text-xl group-hover:text-blue-400 transition-colors">{tier.name}</p>
                      <p className="text-gray-400 text-sm">{tier.feature}</p>
                    </div>
                    <div className="text-emerald-400 font-mono font-bold bg-emerald-400/10 px-4 py-2 rounded-xl border border-emerald-400/20">
                      {tier.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ENHANCED FORM MODAL --- */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white text-gray-900 w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-red-500 hover:text-white rounded-full transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="mb-8">
              <span className="text-xs font-black bg-blue-600 text-white px-4 py-1.5 rounded-full uppercase tracking-widest">
                Application Form
              </span>
              <h2 className="text-3xl font-black mt-4 text-gray-900 leading-none">Apply for {selectedPlan.name}</h2>
              <p className="text-gray-500 mt-2 font-medium">Industry: {selectedPlan.industry}</p>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={(e) => e.preventDefault()}>
              {/* Full Name */}
              <div className="md:col-span-1">
                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700"><User size={16}/> Full Name</label>
                <input type="text" placeholder="John Doe" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" required />
              </div>

              {/* Phone / WhatsApp */}
              <div className="md:col-span-1">
                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700"><Phone size={16}/> Phone / WhatsApp No.</label>
                <input type="tel" placeholder="+234 800 000 0000" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" required />
              </div>

              {/* Organization Name */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700"><Building2 size={16}/> Organization Name</label>
                <input type="text" placeholder="Your Hospital, School, or Agency Name" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" required />
              </div>

              {/* Email Address */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700"><Mail size={16}/> Professional Email</label>
                <input type="email" placeholder="contact@organization.com" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" required />
              </div>

              {/* Additional Message */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-bold mb-2 text-gray-700"><MessageSquare size={16}/> Additional Requirements</label>
                <textarea rows="3" placeholder="Tell us more about your specific needs..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"></textarea>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 pt-2">
                <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all active:scale-95">
                  Submit Application <Send size={22} />
                </button>
                <p className="text-center text-xs text-gray-400 mt-4 uppercase font-bold tracking-widest">Secure 256-bit Encrypted Transmission</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrySolutions;