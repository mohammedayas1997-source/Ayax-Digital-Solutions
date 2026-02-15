import React from "react";
import { Award, ShieldCheck, Star, Bookmark } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const CertificatePreview = () => {
  return (
    <div className="py-20 bg-slate-50 flex flex-col items-center">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
          Global Certification
        </h2>
        <p className="text-blue-600 font-black tracking-widest text-[10px] uppercase mt-2">
          Your path to a verified professional career
        </p>
      </div>

      {/* THE ACTUAL PREVIEW CARD */}
      <div className="relative group perspective-1000">
        <div className="relative w-[350px] md:w-[600px] h-[250px] md:h-[420px] bg-white border-[10px] md:border-[15px] border-double border-[#1e3a8a] p-6 md:p-10 flex flex-col items-center justify-between shadow-2xl transition-transform duration-500 group-hover:rotate-1">
          {/* Header */}
          <div className="text-center z-10">
            <h1 className="text-xl md:text-3xl font-black text-[#1e3a8a] uppercase italic tracking-widest">
              Ayax Academy
            </h1>
            <div className="h-0.5 w-16 bg-amber-500 mx-auto mt-1"></div>
          </div>

          {/* Body */}
          <div className="text-center z-10">
            <p className="text-[8px] md:text-[12px] font-serif italic text-slate-500">
              This is to certify that
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 my-2 tracking-tight">
              ELITE STUDENT
            </h2>
            <p className="text-[8px] md:text-[11px] text-slate-600 max-w-sm mx-auto">
              Has successfully mastered the 24-week intensive curriculum of
              <span className="font-black text-[#1e3a8a]">
                {" "}
                SOFTWARE ENGINEERING
              </span>
            </p>
          </div>

          {/* Footer */}
          <div className="w-full flex justify-between items-end z-10">
            <div className="text-center w-24 md:w-32 border-t border-slate-200 pt-1">
              <p className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase italic">
                Director Signature
              </p>
            </div>

            {/* Dummy QR for Preview */}
            <div className="p-1 border border-blue-600 rounded-lg">
              <QRCodeSVG value="https://ayax-university.com" size={35} />
            </div>

            <div className="text-center w-24 md:w-32 border-t border-slate-200 pt-1">
              <p className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase italic">
                Verification ID
              </p>
            </div>
          </div>

          {/* Decorations */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
            <Award size={200} />
          </div>
          <div className="absolute top-0 left-0 w-12 h-12 bg-amber-500 rotate-45 -translate-x-8 -translate-y-8"></div>
        </div>

        {/* Floating Badge */}
        <div className="absolute -right-6 -bottom-6 bg-amber-500 text-white p-4 rounded-full shadow-xl animate-bounce">
          <Star size={24} fill="white" />
        </div>
      </div>

      <div className="mt-12 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" size={18} />
          <span className="text-[10px] font-black uppercase text-slate-400">
            ISO Certified
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Bookmark className="text-blue-500" size={18} />
          <span className="text-[10px] font-black uppercase text-slate-400">
            Global Recognition
          </span>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
