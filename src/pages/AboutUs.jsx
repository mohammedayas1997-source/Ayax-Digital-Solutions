import React from 'react';
import { Rocket, Target, Eye, ShieldCheck, Zap, Heart, CheckCircle2, Globe, Sparkles, Lock } from 'lucide-react';
const AboutUs = () => {
  return (
    <div className="pt-32 pb-24 bg-white font-sans selection:bg-blue-100">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-20">
          <span className="text-blue-600 font-black tracking-[0.4em] uppercase text-xs mb-4 block">Who We Are</span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter italic italic">🌍 About Ayax Digital Solutions</h1>
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
              Ayax Digital Solutions is a forward-thinking digital technology company committed to transforming ideas into powerful digital realities. We help individuals, startups, government institutions, organizations, NGOs, schools, and businesses leverage technology to achieve meaningful impact and sustainable growth.
            </p>
            <p className="text-lg text-gray-500 font-bold italic">
              We believe that progress begins with vision, discipline, and the right digital tools—and our mission is to provide those tools.
            </p>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div className="bg-gray-50 p-12 rounded-[4rem] border border-gray-100 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-blue-600 rounded-3xl text-white">
                <Rocket size={32} />
              </div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">🚀 What We Do</h2>
            </div>
            <p className="text-gray-600 font-bold mb-8">At Ayax Digital Solutions, we design and develop innovative digital solutions tailored to different sectors, including:</p>
            <ul className="space-y-4">
              {[
                "Modern, secure, and scalable Websites and Mobile Applications",
                "Advanced School Management Systems for effective academic administration",
                "Government Websites & Portals that promote transparency, accessibility, and public engagement",
                "Digital platforms for Organizations & NGOs to showcase impact, manage projects, and reach global audiences",
                "Secure and scalable VTU, Fintech, and E-commerce platforms",
                "Professional Online Learning Platforms & Courses for training, skill development, and digital education",
                "Creative Branding and Digital Marketing solutions that strengthen visibility and trust"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 font-bold text-sm leading-relaxed">
                  <CheckCircle2 className="text-blue-600 shrink-0 mt-1" size={18} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-blue-600 font-black italic">Our solutions are not just functional — they are designed to empower users, simplify processes, and drive measurable results.</p>
          </div>

          {/* Motivation Section */}
          <div className="bg-gray-900 p-12 rounded-[4rem] text-white hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-white/10 rounded-3xl text-blue-400">
                <Zap size={32} />
              </div>
              <h2 className="text-4xl font-black tracking-tight text-white">💡 Our Motivation</h2>
            </div>
            <div className="space-y-6 opacity-90">
              <p className="text-xl font-bold italic text-blue-400">"Technology should empower people, institutions, and communities."</p>
              <p className="font-medium leading-relaxed">Many powerful ideas struggle due to the absence of the right digital structure. At Ayax Digital Solutions, we are driven to bridge that gap—helping governments serve better, organizations reach further, NGOs create stronger impact, and individuals turn ambition into achievement.</p>
              <div className="pt-6 border-t border-white/10">
                <p className="font-black uppercase tracking-widest text-xs mb-4 text-gray-400">We are motivated by:</p>
                <ul className="space-y-3">
                   <li className="flex items-center gap-3 font-bold text-sm">• The success and growth of our clients</li>
                   <li className="flex items-center gap-3 font-bold text-sm">• Solving real-world problems through technology</li>
                   <li className="flex items-center gap-3 font-bold text-sm">• Building digital systems that create lasting value</li>
                </ul>
                <p className="mt-8 text-2xl font-black italic text-blue-500">Your progress fuels our passion.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 text-center">
          <div className="p-12 bg-blue-50 rounded-[3rem] border border-blue-100">
            <Target className="w-16 h-16 mx-auto text-blue-600 mb-6" />
            <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">🎯 Our Mission</h3>
            <p className="text-gray-700 font-bold leading-relaxed mb-6">Our mission is to turn effort into impact and ideas into powerful digital realities.</p>
            <div className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] space-y-2">
              <p>User-friendly & Inclusive</p>
              <p>Secure & Reliable</p>
              <p>Flexible & Scalable</p>
            </div>
          </div>
          <div className="p-12 bg-white rounded-[3rem] border-4 border-gray-50 shadow-sm">
            <Eye className="w-16 h-16 mx-auto text-blue-600 mb-6" />
            <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter">🌟 Our Vision</h3>
            <p className="text-gray-700 font-bold leading-relaxed">Our vision is to become a leading digital solutions provider across Africa and beyond; a trusted technology partner for governments, NGOs, organizations, and businesses; a company known for innovation, integrity, and excellence.</p>
          </div>
        </div>

        {/* Why Choose Us & Footer Call to Action */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-2 border-gray-100 rounded-[3rem] p-12 mb-16 shadow-xl">
             <h3 className="text-3xl font-black text-center mb-10">⭐ Why Choose Ayax Digital Solutions?</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="flex items-center gap-3 font-bold"><ShieldCheck className="text-green-500"/> Deep expertise across sectors</div>
                <div className="flex items-center gap-3 font-bold"><Zap className="text-yellow-500"/> Timely delivery & Quality</div>
                <div className="flex items-center gap-3 font-bold"><Lock className="text-blue-500"/> Focus on Security & Compliance</div>
                <div className="flex items-center gap-3 font-bold"><Sparkles className="text-purple-500"/> Modern UI/UX Designs</div>
                <div className="flex items-center gap-3 font-bold"><Heart className="text-rose-500"/> Long-term Support & Partnership</div>
             </div>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-black tracking-tight mb-6">🤝 Let’s Build the Digital Future Together</h2>
            <p className="text-gray-600 font-bold mb-10 max-w-2xl mx-auto text-lg">Whether you are a government agency, an NGO, an organization, a school, or an entrepreneur with a vision, Ayax Digital Solutions is ready to bring your ideas to life.</p>
            
            <a 
                href="https://wa.me/2347087244444" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-12 py-6 rounded-full font-black text-xl hover:bg-green-700 transition-all shadow-2xl shadow-green-200 uppercase tracking-widest inline-flex items-center gap-4 mx-auto"
            >
                Contact Us on WhatsApp <Rocket size={24} />
            </a>
            
            <p className="mt-8 text-gray-500 font-black italic">WhatsApp: +234 708 724 4444</p>
            <p className="mt-2 text-gray-400 font-black italic">Together, let’s build technology that creates real impact 🚀✨</p>
            </div>       
            </div>
      </div>
    </div>
  );
};

export default AboutUs;