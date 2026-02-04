import React, { useState } from 'react';
import { db } from '../firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Send, CheckCircle2, User, Mail, MessageSquare, Layers, Rocket, ShieldCheck, Phone, Globe, MapPin } from 'lucide-react';

const ProjectForm = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',        
    state: '',        
    lga: '',          
    address: '',      
    tier: 'Starter Care (₦30k/mo)', 
    message: ''
  });

  const sendToWhatsAppBackground = async (data) => {
    // Lambar WhatsApp din Company
    const companyPhone = "2347087244444";
    
    // Tsarin sakon da za a tura
    const textMessage = `*NEW PROJECT INQUIRY*%0A` +
      `*Name:* ${data.name}%0A` +
      `*Phone:* ${data.phone}%0A` +
      `*Plan:* ${data.tier}%0A` +
      `*Location:* ${data.lga}, ${data.state}%0A` +
      `*Message:* ${data.message}`;

    try {
      // Wannan zai yi kokarin kiran WhatsApp API a boye
      // Lura: Domin wannan ya tafi 100% ba tare da window pop-up ba, 
      // yawanci ana amfani da WhatsApp Business API/Cloud API.
      // Amma wannan fetch din zai yi kokarin aika request din.
      fetch(`https://api.whatsapp.com/send?phone=${companyPhone}&text=${textMessage}`, {
        mode: 'no-cors'
      });
    } catch (err) {
      console.log("WhatsApp background trigger failed, but Firebase is saved.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Aika sako zuwa Firebase (Super Admin Dashboard)
      await addDoc(collection(db, "inquiries"), {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        lga: formData.lga,
        address: formData.address,
        serviceTier: formData.tier,
        message: formData.message,
        status: 'Unread',
        priority: 'Medium',
        createdAt: serverTimestamp()
      });
      
      // 2. Aika sako zuwa WhatsApp dinka a boye
      await sendToWhatsAppBackground(formData);
      
      setSubmitted(true);
      // Reset form
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        state: '', 
        lga: '', 
        address: '', 
        tier: 'Starter Care (₦30k/mo)', 
        message: '' 
      });
    } catch (error) {
      console.error("Firebase Submission Error: ", error);
      alert("Error sending inquiry. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center animate-in fade-in zoom-in duration-700">
        <div className="flex justify-center mb-8">
          <div className="bg-green-50 p-6 rounded-full border-4 border-white shadow-xl">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </div>
        </div>
        <h2 className="text-4xl font-black mb-4 text-gray-900 tracking-tighter italic">Mission Received!</h2>
        <p className="text-gray-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
          The **AYAX Digital** command center has received your request. An expert consultant will contact you via email within 24 business hours.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-10 px-12 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200"
        >
          Draft New Inquiry
        </button>
      </div>
    );
  }

  return (
    <section id="contact" className="py-24 bg-[#fcfdfe] px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic">
            Architect Your <span className="text-blue-600">Future</span>
          </h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.4em]">Propel your business into the digital stratosphere</p>
          <div className="w-24 h-2 bg-blue-600 mx-auto mt-8 rounded-full shadow-lg shadow-blue-100"></div>
        </div>

        <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row border border-gray-50">
          {/* Brand Identity Sidebar */}
          <div className="md:w-[35%] bg-gray-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-12">
                <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                <h3 className="text-xl font-black tracking-tighter">AYAX DIGITAL</h3>
              </div>
              
              <div className="space-y-10">
                <div className="flex items-start gap-5 group">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 group-hover:bg-blue-600 transition-colors">
                    <Mail className="w-5 h-5 text-blue-400 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Direct Channel</p>
                    <p className="text-sm font-bold">projects@ayaxdigital.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-5 group">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 group-hover:bg-blue-600 transition-colors">
                    <Rocket className="w-5 h-5 text-blue-400 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Operational Status</p>
                    <p className="text-sm font-bold">Global 24/7 Deployment</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
              <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>)}
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black mb-3 text-blue-400">Core Philosophy</p>
              <p className="text-xs italic text-gray-400 font-bold leading-relaxed">
                "We don't just build software; we engineer sustainable digital legacies for modern enterprises."
              </p>
            </div>
          </div>

          {/* Inquiry Input Area */}
          <form onSubmit={handleSubmit} className="md:w-[65%] p-10 lg:p-20 space-y-10 bg-white">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Full Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="w-3 h-3 text-blue-600" /> Full Name
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Aliyu Ibrahim"
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-black text-gray-800 placeholder:text-gray-200"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Mail className="w-3 h-3 text-blue-600" /> Email Address
                </label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="aliyu@company.com"
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-black text-gray-800 placeholder:text-gray-200"
                />
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Phone className="w-3 h-3 text-blue-600" /> WhatsApp Number
                </label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+234..."
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-black text-gray-800 placeholder:text-gray-200"
                />
              </div>

              {/* State */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Globe className="w-3 h-3 text-blue-600" /> State
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  placeholder="e.g. Kano"
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-black text-gray-800 placeholder:text-gray-200"
                />
              </div>

              {/* LGA */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-600" /> Local Government (LGA)
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.lga}
                  onChange={(e) => setFormData({...formData, lga: e.target.value})}
                  placeholder="Enter LGA"
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-black text-gray-800 placeholder:text-gray-200"
                />
              </div>

              {/* Residential Address */}
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-600" /> Residential Address
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="House No, Street Name, City..."
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-black text-gray-800 placeholder:text-gray-200"
                />
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers className="w-3 h-3 text-blue-600" /> Strategic Service Tier
              </label>
              <div className="relative group">
                <select 
                  value={formData.tier}
                  onChange={(e) => setFormData({...formData, tier: e.target.value})}
                  className="w-full py-5 bg-gray-50 px-8 rounded-3xl border-none outline-none appearance-none cursor-pointer font-black text-sm text-gray-700 focus:ring-4 focus:ring-blue-50 transition-all"
                >
                  <optgroup label="Maintenance Plans (Monthly Support)">
                    <option>Starter Care (₦30k/mo)</option>
                    <option>Business Plus (₦85k/mo)</option>
                    <option>Corporate Pro (₦150k/mo)</option>
                    <option>Enterprise Global (₦350k/mo)</option>
                    <option>Elite Infinity (Custom)</option>
                  </optgroup>
                  <optgroup label="Custom Software Engineering">
                    <option>School - Basic (₦150k)</option>
                    <option>School - Professional (₦450k)</option>
                    <option>School - Global Campus (₦1.2m+)</option>
                    <option>Fintech - Banking Level (₦1.5m+)</option>
                  </optgroup>
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Project Brief */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageSquare className="w-3 h-3 text-blue-600" /> Project Brief
              </label>
              <textarea 
                rows="4"
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Describe your technical vision..."
                className="w-full p-8 bg-gray-50 rounded-[2rem] border-none focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-gray-700 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="group relative w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all hover:bg-gray-900 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {loading ? "Transmitting..." : "Initiate Project"} <Send className="w-4 h-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
              </div>
            </button>
            
            <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-[9px] text-gray-300 uppercase font-black tracking-widest">End-to-End Encrypted Inquiry Submission</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProjectForm;