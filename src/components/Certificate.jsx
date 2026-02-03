import React, { useRef, useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Award, ShieldCheck } from 'lucide-react';
import { auth, db } from '../firebaseConfig'; // Mun kara wannan domin dauko sunan dalibi
import { doc, getDoc } from 'firebase/firestore';

const Certificate = ({ courseName = "Full Stack Web Development", dateCompleted = "February 3, 2026", certificateId = "AYX-99281-Z" }) => {
  const certificateRef = useRef();
  const [studentName, setStudentName] = useState("Loading...");

  // Wannan logic din zai dauko ainihin sunan dalibin daga Firebase
  useEffect(() => {
    const fetchStudentData = async () => {
      const user = auth.currentUser;
      if (user) {
        // Idan kana da collection na 'users' ko 'students' a Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setStudentName(userDoc.data().fullName || user.displayName || "Student Name");
        } else {
          setStudentName(user.displayName || "Student Name");
        }
      }
    };
    fetchStudentData();
  }, []);

  const downloadCertificate = () => {
    const input = certificateRef.current;
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${studentName}_Certificate.pdf`);
    });
  };

  // The link that will be encoded in the QR code for verification
  const verificationURL = `https://ayax-university.com/verify/${certificateId}`;

  return (
    <div className="flex flex-col items-center p-10 bg-gray-100 min-h-screen">
      {/* Certificate Design Container */}
      <div 
        ref={certificateRef}
        className="relative w-[842px] h-[595px] bg-white border-[20px] border-double border-blue-900 p-10 flex flex-col items-center justify-between shadow-2xl overflow-hidden"
      >
        {/* Background Decorative Element */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full opacity-50"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full opacity-50"></div>

        {/* Header: Logo & School Name */}
        <div className="text-center z-10">
          <div className="flex justify-center mb-4">
             <div className="bg-blue-600 p-4 rounded-xl text-white font-black text-2xl italic tracking-tighter">
               AYAX
             </div>
          </div>
          <h1 className="text-4xl font-black text-blue-900 tracking-widest uppercase">Ayax University</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 uppercase tracking-[0.3em]">Official Certification of Completion</p>
        </div>

        {/* Content */}
        <div className="text-center z-10">
          <p className="text-xl italic font-medium text-gray-600">This is to certify that</p>
          <h2 className="text-5xl font-black text-gray-900 my-6 border-b-2 border-blue-600 inline-block px-10 pb-2">
            {studentName}
          </h2>
          <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
            has successfully completed the intensive 24-week professional program in 
            <span className="block font-black text-blue-800 text-2xl mt-2 uppercase">{courseName}</span>
          </p>
        </div>

        {/* Footer: QR Code & Signatures */}
        <div className="w-full flex justify-between items-end z-10">
          <div className="text-center">
            <p className="font-serif border-t border-gray-400 pt-2 px-6 font-bold text-gray-800 italic">Dr. Mohammed Ayax</p>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Chancellor</p>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 border-2 border-blue-900 rounded-lg bg-white">
              <QRCodeSVG value={verificationURL} size={70} />
            </div>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Scan to Verify</p>
          </div>

          <div className="text-center">
            <p className="font-serif border-t border-gray-400 pt-2 px-6 font-bold text-gray-800 italic">{dateCompleted}</p>
            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Date of Issue</p>
          </div>
        </div>

        {/* Watermark Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <Award size={400} />
        </div>
      </div>

      {/* Download Button */}
      <button 
        onClick={downloadCertificate}
        className="mt-10 px-10 py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl"
      >
        <ShieldCheck /> Download High-Resolution PDF
      </button>
    </div>
  );
};

export default Certificate;