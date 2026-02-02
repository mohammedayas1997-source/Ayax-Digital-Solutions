import React from 'react';
// Na gyara 'link' zuwa 'Link' a layin kasa
import { Lock, ShieldCheck, Database, Eye, ShieldAlert, FileText, Globe, UserCheck, Bell, Link as LinkIcon, RefreshCcw, Mail } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="pt-32 pb-24 bg-white font-sans selection:bg-blue-100">
      <div className="max-w-5xl mx-auto px-6">
        {/* Hero Section */}
        <div className="bg-blue-600 rounded-[4rem] p-12 md:p-20 text-white mb-16 relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10">
            <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-md">
              <Lock size={40} />
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic">🔐 Privacy Policy</h1>
            <p className="text-xl font-bold opacity-90 max-w-2xl">Ayax Digital Solutions is committed to protecting your personal and organizational information.</p>
            <div className="mt-8 flex items-center gap-3 text-sm font-black uppercase tracking-widest bg-black/20 w-fit px-6 py-3 rounded-full">
              <RefreshCcw size={16} /> Last Updated: 02/02/2026
            </div>
          </div>
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <ShieldCheck size={500} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-gray-600 font-bold leading-relaxed mb-16 text-center italic">
            At Ayax Digital Solutions, we value your privacy and are committed to protecting your personal and organizational information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website, services, applications, and digital platforms. By using our services, you agree to the practices described in this policy.
          </p>

          <div className="space-y-20">
            
            {/* 1. Information We Collect */}
            <section>
              <h3 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
                <span className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">1</span>
                Information We Collect
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <UserCheck className="text-blue-600 mb-4" />
                  <h4 className="font-black mb-3">a. Personal Information</h4>
                  <ul className="text-sm text-gray-600 space-y-2 font-bold">
                    <li>• Full name</li>
                    <li>• Email address</li>
                    <li>• Phone number</li>
                    <li>• Business/Org details</li>
                    <li>• Billing information</li>
                  </ul>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <Globe className="text-blue-600 mb-4" />
                  <h4 className="font-black mb-3">b. Technical Info</h4>
                  <ul className="text-sm text-gray-600 space-y-2 font-bold">
                    <li>• IP address</li>
                    <li>• Browser & Device info</li>
                    <li>• Operating system</li>
                    <li>• Usage data</li>
                  </ul>
                </div>
                <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <Database className="text-blue-600 mb-4" />
                  <h4 className="font-black mb-3">c. Project Data</h4>
                  <ul className="text-sm text-gray-600 space-y-2 font-bold">
                    <li>• Website/App content</li>
                    <li>• NGO/Gov platforms</li>
                    <li>• Course registration</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. How We Use */}
            <section>
              <h3 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
                <span className="bg-blue-100 text-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">2</span>
                How We Use Your Information
              </h3>
              <div className="bg-white border-4 border-gray-50 p-10 rounded-[3rem] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {[
                  "Provide and manage our services",
                  "Communicate with clients and users",
                  "Process payments and invoices",
                  "Develop, maintain, and improve digital platforms",
                  "Deliver online courses and educational services",
                  "Ensure security, compliance, and system integrity",
                  "Meet legal and regulatory obligations"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-700 font-bold text-sm">
                    <ShieldCheck className="text-green-500 shrink-0" size={18} />
                    {text}
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Data Sharing */}
            <section>
               <h3 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-4 italic underline decoration-blue-100">3. Data Sharing & Disclosure</h3>
               <p className="text-gray-600 font-bold leading-relaxed mb-6">Ayax Digital Solutions does not sell or rent personal data to third parties. We may share information only:</p>
               <ul className="space-y-4 text-gray-700 font-bold">
                 <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">• With trusted third-party service providers (hosting, payment gateways, APIs)</li>
                 <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">• When required by law or government authorities</li>
                 <li className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">• To protect our legal rights, users, or systems</li>
               </ul>
               <p className="mt-6 text-sm text-blue-600 font-black uppercase">All third-party partners are required to follow strict data protection standards.</p>
            </section>

            {/* 4 & 5 Special Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-blue-50 p-10 rounded-[3rem] border border-blue-100">
                  <h3 className="text-xl font-black mb-4">4. Gov, NGO & Institutional Data</h3>
                  <p className="text-sm text-gray-700 font-bold leading-relaxed">All data provided remains the property of the client. We process such data strictly for project delivery and maintenance. Clients are responsible for data accuracy and lawful usage. Ayax Digital Solutions does not use institutional data for any purpose outside the agreed scope.</p>
               </div>
               <div className="bg-gray-900 p-10 rounded-[3rem] text-white">
                  <h3 className="text-xl font-black mb-4">5. Online Courses & E-Learning</h3>
                  <p className="text-sm opacity-80 font-bold leading-relaxed">User data is collected solely for enrollment, access control, and certification. Login credentials are confidential and must not be shared. Course activity may be monitored to prevent misuse or fraud.</p>
               </div>
            </div>

            {/* 6. Data Security */}
            <section className="bg-red-50 p-12 rounded-[4rem] border border-red-100">
               <h3 className="text-3xl font-black text-red-900 mb-6 flex items-center gap-4">6. Data Security</h3>
               <p className="text-red-900/80 font-bold leading-relaxed mb-6">We implement appropriate technical and organizational measures to protect data, including secure servers, encryption, restricted access, and regular updates.</p>
               <div className="bg-white/50 p-6 rounded-3xl flex items-center gap-4 text-red-600 font-black italic">
                  <ShieldAlert size={24}/> 
                  <p>However, no digital system is 100% secure, and we cannot guarantee absolute security.</p>
               </div>
            </section>

            {/* 7-10 Compact Sections */}
            <div className="space-y-12 border-y border-gray-100 py-16">
              {[
                { id: 7, title: "Data Retention", content: "We retain data as long as necessary to fulfill obligations or as required by law. When no longer required, it is securely deleted." },
                { id: 8, title: "Cookies & Tracking", content: "Our website uses cookies to improve experience and analyze traffic. You may disable cookies through browser settings." },
                { id: 9, title: "Your Rights", content: "You may have the right to access, correct, delete, or withdraw consent for data processing. Requests can be made through official channels." },
                { id: 10, title: "Third-Party Links", content: "Our platforms may contain links to external sites. We are not responsible for their privacy practices or content." }
              ].map((item) => (
                <div key={item.id}>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{item.id}. {item.title}</h3>
                  <p className="text-gray-600 font-bold text-sm leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>

            {/* Final Sections */}
            <section className="text-center">
               <h3 className="text-2xl font-black mb-4">11. Changes to This Privacy Policy</h3>
               <p className="text-gray-500 font-bold max-w-2xl mx-auto mb-16">We reserve the right to update this Privacy Policy at any time. Continued use of our services constitutes acceptance of the updated policy.</p>
               
               <div className="bg-gray-50 rounded-[4rem] p-12 md:p-16 border-2 border-dashed border-gray-200">
                  <h3 className="text-4xl font-black text-gray-900 mb-6">12. Contact Us</h3>
                  <p className="text-lg text-gray-600 font-bold mb-8">If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us.</p>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl mb-4">
                      <Mail size={32} />
                    </div>
                    <h4 className="text-2xl font-black tracking-widest text-blue-600 uppercase">Ayax Digital Solutions</h4>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Turning Effort into Impact and Ideas into Powerful Digital Realities.</p>
                  </div>
               </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;