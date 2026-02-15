import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck, Award } from "lucide-react";

const PublicVerifier = () => {
  const [certId, setCertId] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (certId.trim()) {
      // Wannan zai tura su zuwa shafin da zai bincika Firestore
      navigate(`/verify/${certId.trim()}`);
    }
  };

  <div
    id="verify-section"
    className="py-24 bg-slate-950 text-white overflow-hidden relative"
  ></div>;

  return (
    <div className="py-24 bg-slate-950 text-white overflow-hidden relative">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-blue-400 mb-6">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Employer Verification Portal
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
            Verify Credentials
          </h2>
          <p className="text-slate-400 font-bold max-w-xl mx-auto leading-relaxed text-sm md:text-base uppercase italic opacity-70">
            Instant validation for Ayax Academy certificates. Enter the unique
            ID to confirm student authenticity.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="ENTER CERTIFICATE ID (e.g., AYX-2026-XXXX)"
            value={certId}
            onChange={(e) => setCertId(e.target.value.toUpperCase())}
            className="w-full bg-white/5 border-2 border-white/10 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] outline-none focus:border-blue-600 focus:bg-white/10 transition-all font-black text-center text-lg md:text-2xl tracking-widest placeholder:opacity-20 uppercase"
          />
          <button
            type="submit"
            className="mt-6 w-full md:w-auto md:absolute md:right-4 md:top-4 md:mt-0 bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-10 py-5 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
          >
            <Search size={18} /> Authenticate
          </button>
        </form>

        <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-40 grayscale">
          <div className="flex items-center gap-2">
            <Award size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              ISO 27001 Certified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Blockchain Verified ID
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicVerifier;
