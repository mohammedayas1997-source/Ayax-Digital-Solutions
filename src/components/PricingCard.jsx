import React, { useState } from 'react';
import { 
  Globe, Smartphone, School, Building2, ShieldCheck, Zap, Crown, X, 
  Phone, Mail, User, Send, MessageSquare, ShoppingCart, Layout, 
  HandHeart, Database, ShieldAlert, Cpu, Server, Layers, Code, 
  SmartphoneNfc, Globe2, BookOpen, GraduationCap, Store, Trophy, Users, MapPin, Flag
} from 'lucide-react';

const PricingCard = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [formData, setFormData] = useState({
    clientName: '',
    whatsapp: '',
    organization: '',
    country: '',
    state: '',
    lga: '',
    address: '',
    requirements: ''
  });

  const services = [
    {
      title: "School Management Systems",
      icon: <School className="w-10 h-10 text-blue-400" />,
      bgColor: "bg-[#020617]", 
      accentColor: "bg-blue-600",
      tiers: [
        { name: "Starter", price: "₦250,000", image: "https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Information Website", "Student Records", "Contact Forms", "Staff Profiles", "Basic Gallery"], icon: <Zap /> },
        { name: "Standard", price: "₦450,000", image: "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Result Checker", "Attendance Tracking", "ID Card Gen", "Parent Login", "Fee Receipts"], icon: <BookOpen /> },
        { name: "Advanced", price: "₦750,000", image: "https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["CBT System", "E-Library", "Hostel Manager", "Payroll System", "Inventory Tech"], icon: <GraduationCap />, recommended: true },
        { name: "Cloud Campus", price: "₦2,500,000", image: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Live Video Classes", "Mobile App Link", "SMS Notifications", "Online Exams", "Alumni Portal"], icon: <Server /> },
        { name: "University Tier", price: "₦5,500,000+", image: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Custom API", "Multi-Campus Sync", "Research Database", "Grant Tracking", "Dedicated Support"], icon: <Crown /> }
      ]
    },
    {
      title: "VTU & Fintech Web Portals",
      icon: <Globe2 className="w-10 h-10 text-emerald-400" />,
      bgColor: "bg-[#061a14]", 
      accentColor: "bg-emerald-600",
      tiers: [
        { name: "Retailer", price: "₦250,000", image: "https://images.pexels.com/photos/6266685/pexels-photo-6266685.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["API Connection", "Airtime/Data", "User Dashboard", "Wallet System", "Email Alerts"], icon: <Zap /> },
        { name: "Wholesaler", price: "₦350,000", image: "https://images.pexels.com/photos/163064/play-stone-network-networked-163064.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Bill Payments", "Auto-funding", "Referral System", "Admin Panel", "Ticket System"], icon: <Layers /> },
        { name: "Automated Pro", price: "₦600,000", image: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Monnify/VFD Sync", "Bulk SMS Tool", "Exam Pins", "Reseller API", "Sales Analytics"], icon: <Cpu />, recommended: true },
        { name: "Neo-Bank Web", price: "₦1,200,000", image: "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Virtual Accounts", "Loan Engine", "Agency Panel", "2FA Security", "Custom Domain"], icon: <Database /> },
        { name: "Enterprise Hub", price: "₦2,500,000+", image: "https://images.pexels.com/photos/4433831/pexels-photo-4433831.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Custom Gateway", "Infinite Scaling", "24/7 Monitoring", "Server Control", "Whitelabel API"], icon: <Crown /> }
      ]
    },
    {
      title: "Fintech & VTU Mobile Apps",
      icon: <SmartphoneNfc className="w-10 h-10 text-indigo-400" />,
      bgColor: "bg-[#0c0a1f]", 
      accentColor: "bg-indigo-600",
      tiers: [
        { name: "Lite App", price: "₦350,000", image: "https://images.pexels.com/photos/400588/pexels-photo-400588.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Android Build", "Push Alerts", "Fast Recharge", "Simple Login", "History"], icon: <Zap /> },
        { name: "Pro Hybrid", price: "₦600,000", image: "https://images.pexels.com/photos/1092671/pexels-photo-1092671.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["iOS/Android", "Biometric Lock", "Pin Security", "Receipt Export", "Dark Mode"], icon: <Code /> },
        { name: "Neo-Bank App", price: "₦1,500,000", image: "https://images.pexels.com/photos/50614/pexels-photo-50614.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Virtual Cards", "Smart Analysis", "QR Payments", "Fraud Logic", "Chat Support"], icon: <ShieldAlert />, recommended: true },
        { name: "Industrial", price: "₦3,500,000", image: "https://images.pexels.com/photos/926390/pexels-photo-926390.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Source Code", "Brand Control", "Multi-Language", "Admin App", "Offline Mode"], icon: <Server /> },
        { name: "Global Fintech", price: "Inquiry", image: "https://images.pexels.com/photos/3183183/pexels-photo-3183183.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Switch Link", "Crypto Engine", "Mastercard Issuing", "AI Support", "Cross-Border"], icon: <Crown /> }
      ]
    },
    {
      title: "E-Commerce Web Solutions",
      icon: <Layout className="w-10 h-10 text-orange-400" />,
      bgColor: "bg-[#140b05]", 
      accentColor: "bg-orange-600",
      tiers: [
        { name: "Basic Store", price: "₦250,000", image: "https://images.pexels.com/photos/34577/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600", features: ["Product List", "Cart System", "SEO Setup", "WhatsApp Link", "SSL Secure"], icon: <Zap /> },
        { name: "Standard Pro", price: "₦450,000", image: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Paystack/Flutter", "Inventory Tech", "Coupon System", "User Portal", "Review Logic"], icon: <Store /> },
        { name: "Marketplace", price: "₦800,000", image: "https://images.pexels.com/photos/5632386/pexels-photo-5632386.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Multi-Vendor", "Vendor Panel", "Wallet System", "Advanced SEO", "Admin Dashboard"], icon: <Users />, recommended: true },
        { name: "Mega Mall", price: "₦2,500,000", image: "https://images.pexels.com/photos/3944405/pexels-photo-3944405.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Affiliate System", "Bulk Import", "Auction Module", "Live Chat", "Multi-Currency"], icon: <Layers /> },
        { name: "Global Brand", price: "₦5,000,000+", image: "https://images.pexels.com/photos/1036808/pexels-photo-1036808.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Headless CMS", "AI Recommendations", "Predictive Search", "High Scale", "ERM Link"], icon: <Crown /> }
      ]
    },
    {
      title: "E-Commerce Mobile Apps",
      icon: <ShoppingCart className="w-10 h-10 text-purple-400" />,
      bgColor: "bg-[#11051a]", 
      accentColor: "bg-purple-600",
      tiers: [
        { name: "Lite Native", price: "₦350,000", image: "https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Playstore Link", "Push Alerts", "Fast Browse", "Secure Pay", "Order History"], icon: <Zap /> },
        { name: "Cross-Retail", price: "₦700,000", image: "https://images.pexels.com/photos/5076511/pexels-photo-5076511.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["iOS & Android", "Biometric Pay", "Live Tracking", "Gift Cards", "Voucher System"], icon: <Code /> },
        { name: "Premium App", price: "₦1,200,000", image: "https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["AI Smart Search", "In-App Wallet", "Social Login", "Referral Tech", "Deep Analytics"], icon: <ShieldCheck />, recommended: true },
        { name: "Mega Hybrid", price: "₦2,500,000", image: "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Voice Search", "AR View Tech", "Direct API Link", "Vendor App", "Driver App"], icon: <Smartphone /> },
        { name: "Global Omni", price: "₦5,000,000+", image: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Custom Logic", "Multi-Country", "Infinite Users", "Direct Support", "Source Access"], icon: <Crown /> }
      ]
    },
    {
      title: "NGO & Organization Portals",
      icon: <HandHeart className="w-10 h-10 text-rose-400" />,
      bgColor: "bg-[#1a050a]", 
      accentColor: "bg-rose-600",
      tiers: [
        { name: "Starter", price: "₦150,000", image: "https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Project Pages", "Mission Setup", "Gallery", "Contact Database", "Blog"], icon: <Zap /> },
        { name: "Community", price: "₦250,000", image: "https://images.pexels.com/photos/6646914/pexels-photo-6646914.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Member Login", "Newsletter", "Social Sync", "Event Calendar", "Forms"], icon: <Users /> },
        { name: "Impact Pro", price: "₦500,000", image: "https://images.pexels.com/photos/6646967/pexels-photo-6646967.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Donation Engine", "Volunteer Tech", "Cause Tracking", "Impact Reports", "Certificate Gen"], icon: <Trophy />, recommended: true },
        { name: "International", price: "₦1,200,000", image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Multi-Language", "Regional Admins", "Grant Manager", "Audit Logs", "Transparency Link"], icon: <Globe /> },
        { name: "Foundation", price: "₦2,500,000+", image: "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=600", features: ["Custom Portal", "Fundraising App", "Financial Hub", "Global API", "White-Label"], icon: <Crown /> }
      ]
    }
  ];

  const handleWhatsAppAction = (e) => {
    e.preventDefault();
    const phoneNum = "2348000000000"; // CANZA WANNAN ZUWA LAMBARKA
    const message = `*PROJECT INITIALIZATION REQUEST*%0A%0A` +
      `*Service:* ${selectedTier.serviceTitle}%0A` +
      `*Tier:* ${selectedTier.name} (${selectedTier.price})%0A%0A` +
      `*Client Details:*%0A` +
      `Name: ${formData.clientName}%0A` +
      `WhatsApp: ${formData.whatsapp}%0A` +
      `Org: ${formData.organization}%0A%0A` +
      `*Location:*%0A` +
      `Country: ${formData.country}%0A` +
      `State: ${formData.state}%0A` +
      `LGA: ${formData.lga}%0A` +
      `Address: ${formData.address}%0A%0A` +
      `*Brief:* ${formData.requirements}`;
    
    window.open(`https://wa.me/${phoneNum}?text=${message}`, '_blank');
  };

  return (
    <div className="bg-white py-24 px-4 font-sans selection:bg-blue-100">
      <div className="max-w-[1750px] mx-auto text-center">
        <h2 className="text-6xl font-black text-gray-900 mb-6 tracking-tighter uppercase italic">Next-Gen Solutions</h2>
        <p className="text-xl text-gray-500 mb-24 max-w-4xl mx-auto font-medium tracking-tight">Enterprise digital frameworks built for the world's most demanding industries.</p>

        {services.map((service, sIndex) => (
          <div key={sIndex} className={`${service.bgColor} py-24 mb-16 rounded-[4rem] px-8 transition-all duration-700 border-b border-white/5`}>
            <div className="flex flex-col items-center gap-6 mb-20">
              <div className="p-8 bg-white/5 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/10 ring-8 ring-white/5 transform hover:scale-110 transition-all duration-700">
                {service.icon}
              </div>
              <h3 className="text-5xl font-black text-white tracking-tighter uppercase">{service.title}</h3>
              <div className={`w-56 h-3 ${service.accentColor} rounded-full opacity-60`}></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {service.tiers.map((tier, tIndex) => (
                <div 
                  key={tIndex} 
                  className={`group relative flex flex-col rounded-[3.5rem] bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-700 hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] hover:-translate-y-8 ${tier.recommended ? `border-blue-500 scale-105 z-10 shadow-2xl` : 'border-white/5'}`}
                >
                  <div className="h-52 w-full overflow-hidden rounded-t-[3.4rem] relative">
                    <img 
                      src={tier.image} 
                      alt={tier.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 opacity-80 group-hover:opacity-100" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400?text=System+Ready'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00000080] via-transparent to-transparent"></div>
                  </div>

                  {tier.recommended && (
                    <span className="absolute top-6 right-6 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl z-20 animate-pulse">
                      High Growth
                    </span>
                  )}

                  <div className="p-10 pt-6 flex-grow flex flex-col">
                    <div className="text-blue-400 mb-4 flex justify-start transform group-hover:scale-110 transition-transform">{tier.icon}</div>
                    <h4 className="text-2xl font-black text-white mb-1 text-left tracking-tight">{tier.name}</h4>
                    <div className="text-2xl font-black text-blue-400 mb-8 text-left uppercase">{tier.price}</div>
                    
                    <ul className="text-left space-y-5 mb-12 flex-grow">
                      {tier.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-3 text-gray-300 font-bold text-[12px] leading-tight hover:text-white transition-colors">
                          <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => setSelectedTier({ ...tier, serviceTitle: service.title })}
                      className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2 ${tier.recommended ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xl shadow-blue-900' : 'bg-white text-black hover:bg-gray-200'}`}
                    >
                      Start Project <Send size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl">
          <div className="bg-white text-gray-900 w-full max-w-4xl rounded-[5rem] p-12 md:p-20 relative shadow-2xl animate-in zoom-in duration-500 max-h-[95vh] overflow-y-auto border-[15px] border-gray-50">
            <button onClick={() => setSelectedTier(null)} className="absolute top-16 right-16 p-4 bg-gray-100 hover:bg-red-600 hover:text-white rounded-full transition-all hover:rotate-90">
                <X size={32} />
            </button>
            <div className="mb-14 text-left">
              <span className="bg-blue-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.4em]">Project Manifest</span>
              <h2 className="text-6xl font-black text-gray-900 mt-10 leading-none tracking-tighter italic">{selectedTier.name}</h2>
              <p className="text-blue-600 font-bold text-3xl mt-4 underline decoration-8 decoration-blue-50">{selectedTier.serviceTitle}</p>
              <p className="text-gray-400 mt-6 font-black text-lg uppercase tracking-widest">Base Cost: {selectedTier.price}</p>
            </div>
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-10" onSubmit={handleWhatsAppAction}>
              {/* Basic Details */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-black uppercase mb-4 text-gray-400 tracking-[0.3em] flex items-center gap-3"><User size={16}/> Authorized Client Name</label>
                <input type="text" onChange={(e) => setFormData({...formData, clientName: e.target.value})} placeholder="Full Legal Name" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg transition-all" required />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[11px] font-black uppercase mb-4 text-gray-400 tracking-[0.3em] flex items-center gap-3"><Phone size={16}/> WhatsApp Line</label>
                <input type="tel" onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="+234..." className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg transition-all" required />
              </div>

              {/* Org & Country */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-black uppercase mb-4 text-gray-400 tracking-[0.3em] flex items-center gap-3"><Building2 size={16}/> Organization Identity</label>
                <input type="text" onChange={(e) => setFormData({...formData, organization: e.target.value})} placeholder="Company or NGO Name" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg transition-all" required />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[11px] font-black uppercase mb-4 text-gray-400 tracking-[0.3em] flex items-center gap-3"><Flag size={16}/> Country</label>
                <input type="text" onChange={(e) => setFormData({...formData, country: e.target.value})} placeholder="e.g. Nigeria" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg transition-all" required />
              </div>

              {/* State & LGA */}
              <div className="md:col-span-1">
                <label className="block text-[11px] font-black uppercase mb-4 text-gray-400 tracking-[0.3em] flex items-center gap-3"><MapPin size={16}/> State</label>
                <input type="text" onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="e.g. Kano" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg transition-all" required />
              </div>
              <div className="md:col-span-1">
                <label className="block text-[11px] font-black uppercase mb-4 text-gray-400 tracking-[0.3em] flex items-center gap-3"><MapPin size={16}/> LGA</label>
                <input type="text" onChange={(e) => setFormData({...formData, lga: e.target.value})} placeholder="Local Govt Area" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg transition-all" required />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black uppercase mb-4 text-gray-400 tracking-[0.3em] flex items-center gap-3"><MapPin size={16}/> Full Residential / Office Address</label>
                <input type="text" onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="House No, Street Name, City" className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none font-bold text-lg transition-all" required />
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black uppercase mb-4 text-gray-400 tracking-[0.3em] flex items-center gap-3"><MessageSquare size={16}/> Project Brief</label>
                <textarea rows="4" onChange={(e) => setFormData({...formData, requirements: e.target.value})} placeholder="Specify any custom features..." className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:border-blue-600 outline-none font-bold text-lg transition-all resize-none"></textarea>
              </div>

              {/* Submit */}
              <div className="md:col-span-2">
                <button type="submit" className="w-full py-8 bg-blue-600 text-white rounded-[3rem] font-black text-2xl hover:bg-blue-700 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-6">
                  Initialize Request <Send size={28} />
                </button>
                <p className="mt-8 text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.6em]">Secure Enterprise Gateway System</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingCard;