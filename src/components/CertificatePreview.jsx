import React from "react";
import { Award, ShieldCheck, Star, Bookmark } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// MATAKI NA FARKO: Dole kayi import nasu anan idan suna cikin src/assets
// Idan kuma suna cikin public folder ne, ka tabbatar sunansu ya dace da wanda ke kasa
import logoImg from "../assets/logo.png";
import signatureImg from "../assets/signature.png";
const CertificatePreview = ({
  // Idan ba a sa komai ba, zai dauki wadannan imports din na sama
  logoUrl = logoImg,
  signatureUrl = signatureImg,
}) => {
  return (
    <div className="py-24 bg-slate-50 flex flex-col items-center overflow-hidden">
      {/* SECTION HEADER */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
          <Star size={14} className="fill-blue-700" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Industry Standard
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900">
          Global Certification
        </h2>
        <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase mt-2 opacity-70">
          Your path to a verified professional career
        </p>
      </div>

      {/* THE ACTUAL PROFESSIONAL PREVIEW */}
      <div className="relative group perspective-1000 scale-90 md:scale-100">
        <div className="relative w-[842px] h-[595px] bg-white border-[16px] border-double border-[#1e3a8a] p-12 flex flex-col items-center justify-between shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:rotate-1">
          {/* 1. ACADEMY BRANDING (LOGO) */}
          <div className="text-center z-10 w-full">
            <div className="flex justify-center mb-4">
              {/* AN GYARA: An sa src ta gaske */}
              <img
                src={logoImg} // Maimakon logoUrl, yi amfani da variable din da muka yi import
                alt="Academy Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <h1 className="text-3xl font-black text-[#1e3a8a] tracking-[0.2em] uppercase italic">
              Ayax Academy
            </h1>
            <div className="h-1.5 w-24 bg-amber-500 mx-auto mt-2"></div>
            <p className="text-[9px] font-black text-slate-400 mt-3 uppercase tracking-[0.5em]">
              Academic Excellence Credentials
            </p>
          </div>

          {/* 2. RECIPIENT DATA (SAMPLE) */}
          <div className="text-center z-10">
            <p className="text-lg font-serif italic text-slate-500">
              This international certification is proudly presented to
            </p>
            <h2 className="text-5xl font-black text-slate-900 my-4 border-b-4 border-slate-100 inline-block px-12 pb-3 tracking-tight">
              ELITE GRADUATE
            </h2>
            <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              for the successful completion of the{" "}
              <span className="font-black text-[#1e3a8a]">
                SOFTWARE ENGINEERING
              </span>{" "}
              program. The candidate has demonstrated mastery over intensive
              technical training.
            </p>
          </div>

          {/* 3. SIGNATORIES & VALIDATION */}
          <div className="w-full flex justify-between items-end z-10 px-4">
            {/* DIRECTOR SIDE */}
            <div className="text-center w-48 relative">
              <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none opacity-80">
                {/* AN GYARA: An sa src ta gaske */}
                <img
                  src={signatureImg}
                  alt="Director Signature"
                  className="h-14 w-auto object-contain mix-blend-multiply"
                />
              </div>
              <p className="font-serif border-t-2 border-slate-200 pt-2 font-bold text-slate-800 italic">
                Abdulrahman M. Ayas
              </p>
              <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mt-1">
                Academy Director
              </p>
            </div>

            {/* REAL-LIFE VERIFICATION QR PREVIEW */}
            <div className="flex flex-col items-center gap-1 mb-[-10px]">
              <div className="p-1.5 border-2 border-[#1e3a8a] rounded-xl bg-white shadow-sm">
                <QRCodeSVG
                  value="https://ayax-university.com/verify/SAMPLE"
                  size={60}
                  level="H"
                />
              </div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mt-1">
                Verify Credential
              </p>
            </div>

            {/* DATE SIDE */}
            <div className="text-center w-48">
              <p className="font-serif border-t-2 border-slate-200 pt-2 font-bold text-slate-800 italic">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-[8px] uppercase font-black text-slate-400 tracking-widest mt-1">
                Date of Issuance
              </p>
            </div>
          </div>

          {/* BACKGROUND SECURITY ASSETS */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12">
            <Award size={400} strokeWidth={0.5} />
          </div>
          <div className="absolute top-[-40px] left-[-40px] w-24 h-24 bg-amber-500 rotate-45 shadow-lg"></div>
          <div className="absolute bottom-10 right-10 opacity-5">
            <ShieldCheck size={80} color="#1e3a8a" />
          </div>
        </div>

        {/* Floating Verified Badge */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-6 rounded-full shadow-2xl border-4 border-white animate-pulse hidden md:block">
          <ShieldCheck size={32} />
        </div>
      </div>

      {/* TRUST INDICATORS */}
      <div className="mt-20 flex flex-wrap justify-center gap-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white shadow-lg rounded-2xl">
            <ShieldCheck className="text-emerald-500" size={24} />
          </div>
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">
            ISO 27001 Verified
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white shadow-lg rounded-2xl">
            <Bookmark className="text-blue-600" size={24} />
          </div>
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">
            Global Recognition
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white shadow-lg rounded-2xl">
            <Award className="text-amber-500" size={24} />
          </div>
          <span className="text-[11px] font-black uppercase text-slate-500 tracking-widest">
            Gold Standard Award
          </span>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
