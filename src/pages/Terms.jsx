import React from 'react';
import { ScrollText, Gavel, ShieldAlert, CreditCard, Clock, Lock, Briefcase, Globe, HelpCircle, CheckCircle2 } from 'lucide-react';

const Terms = () => {
  return (
    <div className="pt-32 pb-24 bg-gray-50 font-sans selection:bg-blue-100">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Decorative Header */}
        <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-xl shadow-gray-200/50 mb-12 border border-gray-100 relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-blue-600 p-5 rounded-3xl text-white mb-8 shadow-lg shadow-blue-200">
              <ScrollText size={48} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight italic">📜 Terms and Conditions</h1>
            <p className="text-blue-600 font-black text-sm uppercase tracking-[0.4em] mt-6">Ayax Digital Solutions</p>
            <div className="w-24 h-2 bg-blue-600 rounded-full mt-4 mb-4"></div>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic">Last Updated: 02/02/2026</p>
          </div>
          <div className="absolute top-0 right-0 opacity-[0.03] -translate-y-1/4 translate-x-1/4">
            <Gavel size={600} />
          </div>
        </div>

        {/* Main Content Body */}
        <div className="max-w-4xl mx-auto bg-white p-10 md:p-20 rounded-[4rem] shadow-sm border border-gray-50">
          
          <div className="prose prose-lg max-w-none space-y-16">
            
            {/* Intro */}
            <div className="pb-10 border-b border-gray-100">
              <p className="text-gray-600 font-bold leading-relaxed italic text-lg">
                Welcome to Ayax Digital Solutions. By accessing our website or using any of our services, you agree to be bound by the following Terms and Conditions. Please read them carefully before engaging our services.
              </p>
            </div>

            {/* Section 1 */}
            <section>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-4">
                <span className="text-blue-600">1.</span> Acceptance of Terms
              </h3>
              <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 text-gray-700 font-bold space-y-4">
                <p>By using our website or engaging our services, you confirm that:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>You are at least 18 years old, or</li>
                  <li>You have the legal authority to represent a company, organization, NGO, or government institution.</li>
                </ul>
                <p className="text-red-600 italic">If you do not agree with these Terms and Conditions, please discontinue use of our services.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-4">
                <span className="text-blue-600">2.</span> Services Offered
              </h3>
              <p className="text-gray-600 font-bold mb-6 italic">Ayax Digital Solutions provides digital services including but not limited to:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Website Design & Development", "Mobile App Development", "Government Websites & Portals",
                  "Organization & NGO Platforms", "School Management Systems", "VTU, Fintech & E-commerce Solutions",
                  "Online Courses & E-learning Platforms", "Branding & Digital Marketing Services"
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl font-bold text-sm text-gray-700">
                    <CheckCircle2 size={16} className="text-blue-600" /> {s}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm text-gray-400 font-bold italic">Specific project scope, pricing, and timelines will be detailed in written proposals or agreements.</p>
            </section>

            {/* Section 3 */}
            <section>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-4">
                <span className="text-blue-600">3.</span> Client Responsibilities
              </h3>
              <div className="space-y-4 text-gray-600 font-bold">
                <p>Clients agree to:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">• Provide accurate, complete, and lawful content</li>
                  <li className="flex items-start gap-3">• Respond promptly with feedback, approvals, and required materials</li>
                  <li className="flex items-start gap-3">• Use delivered systems for legal and ethical purposes only</li>
                  <li className="flex items-start gap-3">• Avoid unauthorized modification, resale, hacking, or misuse of any system</li>
                </ul>
                <p className="text-blue-600 italic">Ayax Digital Solutions shall not be responsible for delays caused by client inaction.</p>
              </div>
            </section>

            {/* Section 4 - CRITICAL POLICY */}
            <section className="bg-red-50 p-10 rounded-[3rem] border-l-8 border-red-600">
              <h3 className="text-2xl font-black text-red-900 mb-6 flex items-center gap-4 italic uppercase">
                <CreditCard /> 4. Payments & Refund Policy
              </h3>
              <div className="space-y-4 text-red-900 font-black text-sm uppercase tracking-wide">
                <p>• All projects require a seventy percent (70%) upfront payment before any work begins.</p>
                <p>• The remaining thirty percent (30%) balance must be paid upon project completion or before final deployment, unless otherwise agreed in writing.</p>
                <p>• No project will commence until the required 70% advance payment is fully received.</p>
                <p>• Payment plans or milestones may apply depending on project scope.</p>
                <p className="bg-red-600 text-white p-4 rounded-xl inline-block mt-4 tracking-tighter italic">All payments made are strictly non-refundable, except where explicitly stated in a signed agreement.</p>
                <p className="mt-4 opacity-80 underline decoration-2 decoration-red-900 underline-offset-4">Failure to complete agreed payments may result in project suspension, delayed delivery, or termination.</p>
              </div>
            </section>

            {/* Section 5 & 6 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2"><Clock size={20} className="text-blue-600"/> 5. Timelines</h4>
                <p className="text-xs text-gray-600 font-bold leading-relaxed italic">Project timelines are estimates and depend on timely client cooperation. Force majeure events (technical outages, etc.) may affect schedules.</p>
              </div>
              <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-blue-400"><Lock size={20}/> 6. Intellectual Property</h4>
                <p className="text-xs opacity-80 font-bold leading-relaxed italic">All designs and source codes remain the property of Ayax Digital Solutions until full payment is received. Ownership transfers only upon full settlement.</p>
              </div>
            </div>

            {/* Section 7, 8, 9, 10, 11, 12, 13 (Consolidated for readability) */}
            <div className="space-y-12">
               <div className="p-8 border border-gray-100 rounded-3xl">
                  <h4 className="font-black text-gray-900 mb-4 uppercase text-sm">7. Online Courses & Digital Content</h4>
                  <p className="text-sm text-gray-600 font-bold italic">Access credentials are personal and non-transferable. Materials may not be copied, resold, or redistributed. Misuse results in termination without refund.</p>
               </div>
               <div className="p-8 border border-gray-100 rounded-3xl">
                  <h4 className="font-black text-gray-900 mb-4 uppercase text-sm">8. Government & Institutional Projects</h4>
                  <p className="text-sm text-gray-600 font-bold italic">Clients are solely responsible for accuracy and legality of content. Ayax Digital Solutions is not liable for misinformation supplied by clients.</p>
               </div>
               <div className="p-8 border border-gray-100 rounded-3xl">
                  <h4 className="font-black text-gray-900 mb-4 uppercase text-sm">9. Limitation of Liability</h4>
                  <p className="text-sm text-gray-600 font-bold italic">We are not liable for loss of revenue, business opportunities, or downtime caused by 3rd parties. Liability is limited to the total amount paid.</p>
               </div>
               <div className="p-8 border-red-100 bg-red-50/20 border-2 rounded-3xl">
                  <h4 className="font-black text-red-600 mb-4 uppercase text-sm">10. Termination of Services</h4>
                  <p className="text-sm text-gray-600 font-bold italic">We reserve the right to terminate services for Terms violation, incomplete payments, or illegal activities. Termination doesn't remove payment obligations.</p>
               </div>
               <div className="p-8 border border-gray-100 rounded-3xl">
                  <h4 className="font-black text-gray-900 mb-4 uppercase text-sm">11. Third-Party Services</h4>
                  <p className="text-sm text-gray-600 font-bold italic">We are not responsible for failures, changes, or downtime caused by third-party providers (hosting, gateways, APIs).</p>
               </div>
               <div className="p-8 border border-gray-100 rounded-3xl">
                  <h4 className="font-black text-gray-900 mb-4 uppercase text-sm italic">12. Amendments & 13. Governing Law</h4>
                  <p className="text-sm text-gray-600 font-bold italic">We reserve the right to modify these terms. Continued use constitutes acceptance. Interpreted in accordance with the laws of our jurisdiction.</p>
               </div>
            </div>

            {/* Section 14 - Contact */}
            <section className="bg-blue-600 rounded-[3rem] p-12 text-center text-white">
              <HelpCircle className="w-16 h-16 mx-auto mb-6" />
              <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">14. Contact Information</h3>
              <p className="font-bold opacity-90 max-w-xl mx-auto mb-10 italic">
                For questions or concerns regarding these Terms and Conditions, please contact Ayax Digital Solutions through our official communication channels.
              </p>
              <div className="bg-white/10 p-6 rounded-3xl inline-block border border-white/20">
                <h4 className="text-2xl font-black italic tracking-widest">AYAX DIGITAL SOLUTIONS</h4>
                <p className="text-xs font-black uppercase tracking-[0.3em] mt-2 opacity-70">Turning Effort into Impact and Ideas into Powerful Digital Realities.</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;