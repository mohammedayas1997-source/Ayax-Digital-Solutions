import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Award, ShieldCheck, Download } from 'lucide-react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const Certificate = ({ 
  courseName = "Full Stack Web Development", 
  dateCompleted = "February 3, 2026", 
  certificateId = "AYX-99281-Z",
  logoUrl = "/logo.png" // Replace with your actual website logo path
}) => {
  const certificateRef = useRef();
  const [studentName, setStudentName] = useState("Loading...");

  useEffect(() => {
    const fetchStudentData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setStudentName(userDoc.data().fullName?.toUpperCase() || "STUDENT NAME");
          } else {
            setStudentName(user.displayName?.toUpperCase() || "STUDENT NAME");
          }
        } catch (error) {
          console.error("Error fetching student data:", error);
          setStudentName("VERIFIED STUDENT");
        }
      }
    };
    fetchStudentData();
  }, []);

  const downloadCertificate = async () => {
    const input = certificateRef.current;
    
    // Using high scale for professional print quality
    const canvas = await html2canvas(input, { 
      scale: 3, 
      useCORS: true, 
      allowTaint: true,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${studentName}_AYAX_Certificate.pdf`);
  };

  const verificationURL = `https://ayax-university.com/verify/${certificateId}`;

  return (
    <div className="flex flex-col items-center p-10 bg-slate-50 min-h-screen font-sans">
      {/* Certificate Design Container */}
      <div 
        ref={certificateRef}
        className="relative w-[842px] h-[595px] bg-white border-[16px] border-double border-[#1e3a8a] p-12 flex flex-col items-center justify-between shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        {/* Real-Life Logo Integration */}
        <div className="text-center z-10 w-full">
          <div className="flex justify-center mb-4">
            <img 
              src={logoUrl} 
              alt="University Logo" 
              className="h-20 w-auto object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <h1 className="text-4xl font-black text-[#1e3a8a] tracking-[0.2em] uppercase italic">Ayax University</h1>
          <div className="h-1 w-24 bg-amber-500 mx-auto mt-2"></div>
          <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-[0.4em]">Official Academic Excellence Credentials</p>
        </div>

        {/* Recipient Section */}
        <div className="text-center z-10">
          <p className="text-lg font-serif italic text-slate-500">This international certification is proudly presented to</p>
          <h2 className="text-5xl font-black text-slate-900 my-4 border-b-4 border-slate-100 inline-block px-12 pb-3 tracking-tight">
            {studentName}
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            for the successful completion of the <span className="font-black text-[#1e3a8a]">{courseName}</span> program. 
            The candidate has demonstrated mastery over 24 weeks of intensive technical training and practical examinations.
          </p>
        </div>

        {/* Authentication & Signatures */}
        <div className="w-full flex justify-between items-end z-10">
          <div className="text-center w-48">
            <p className="font-serif border-t-2 border-slate-200 pt-2 font-bold text-slate-800 italic">Dr. Mohammed Ayax</p>
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">University Chancellor</p>
          </div>

          {/* Secure QR Code */}
          <div className="flex flex-col items-center gap-2 mb-[-10px]">
            <div className="p-1.5 border-2 border-[#1e3a8a] rounded-xl bg-white shadow-sm">
              <QRCodeSVG value={verificationURL} size={65} level="H" />
            </div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Verified Credential</p>
          </div>

          <div className="text-center w-48">
            <p className="font-serif border-t-2 border-slate-200 pt-2 font-bold text-slate-800 italic">{dateCompleted}</p>
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">Date of Achievement</p>
          </div>
        </div>

        {/* Security Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none rotate-12">
          <Award size={450} strokeWidth={1} />
        </div>
        
        {/* Gold Corner Seal */}
        <div className="absolute top-[-40px] left-[-40px] w-24 h-24 bg-amber-500 rotate-45"></div>
      </div>

      {/* Action UI */}
      <div className="mt-12 flex gap-4">
        <button 
          onClick={downloadCertificate}
          className="px-12 py-5 bg-[#1e3a8a] text-white rounded-[2rem] font-black flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl hover:scale-105 active:scale-95"
        >
          <Download size={20} /> Generate Official PDF
        </button>
      </div>
    </div>
  );
};

export default Certificate;