import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { Award, ShieldCheck, Download } from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

/**
 * PRODUCTION-READY CERTIFICATE SYSTEM
 * Features:
 * - Real-life QR Verification Path
 * - Dynamic Serial Number Assignment
 * - High-Resolution PDF Rendering
 */

const Certificate = ({
  courseName = "Web development",
  dateCompleted = "February 15, 2026",
  logoUrl = "/logo.png",
  signatureUrl = "/signature.png",
}) => {
  const certificateRef = useRef();
  const [studentName, setStudentName] = useState("LOADING...");
  const [serialNumber, setSerialNumber] = useState("PENDING");

  useEffect(() => {
    const initializeCertificate = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setStudentName(
              userData.fullName?.toUpperCase() || "VERIFIED STUDENT",
            );

            // REAL-LIFE SERIAL GENERATOR: Checks Firestore for existing ID or creates one
            if (userData.certificateId) {
              setSerialNumber(userData.certificateId);
            } else {
              const timestamp = Date.now().toString().slice(-6);
              const randomString = Math.random()
                .toString(36)
                .substr(2, 4)
                .toUpperCase();
              const newSerial = `AYX-2026-${timestamp}-${randomString}`;

              setSerialNumber(newSerial);

              // Persist the Serial ID to Firestore for real-life verification persistence
              await updateDoc(userRef, { certificateId: newSerial });
            }
          }
        } catch (error) {
          console.error("CERTIFICATE_INIT_ERROR:", error);
          setStudentName("VERIFIED STUDENT");
        }
      }
    };
    initializeCertificate();
  }, []);

  const downloadCertificate = async () => {
    const input = certificateRef.current;

    // High scale (3) for professional print quality
    const canvas = await html2canvas(input, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${studentName}_AYAX_OFFICIAL_CERTIFICATE.pdf`);
  };

  // REAL-LIFE QR DESTINATION
  const verificationURL = `https://ayax-university.com/verify/${serialNumber}`;

  return (
    <div className="flex flex-col items-center p-10 bg-slate-100 min-h-screen font-sans">
      {/* CERTIFICATE TEMPLATE */}
      <div
        ref={certificateRef}
        className="relative w-[842px] h-[595px] bg-white border-[16px] border-double border-[#1e3a8a] p-12 flex flex-col items-center justify-between shadow-2xl overflow-hidden"
      >
        {/* ACADEMY BRANDING */}
        <div className="text-center z-10 w-full">
          <div className="flex justify-center mb-4">
            <img
              src={logoUrl}
              alt="Academy Logo"
              className="h-20 w-auto object-contain"
              crossOrigin="anonymous"
            />
          </div>
          <h1 className="text-4xl font-black text-[#1e3a8a] tracking-[0.2em] uppercase italic">
            Ayax Academy
          </h1>
          <div className="h-1.5 w-32 bg-amber-500 mx-auto mt-2"></div>
          <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-[0.5em]">
            Official Academic Excellence Credentials
          </p>
        </div>

        {/* RECIPIENT DATA */}
        <div className="text-center z-10">
          <p className="text-lg font-serif italic text-slate-500">
            This international certification is proudly presented to
          </p>
          <h2 className="text-5xl font-black text-slate-900 my-4 border-b-4 border-slate-100 inline-block px-12 pb-3 tracking-tight">
            {studentName}
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            for the successful completion of the{" "}
            <span className="font-black text-[#1e3a8a]">{courseName}</span>{" "}
            program. The candidate has demonstrated mastery over 24 weeks of
            intensive technical training and practical examinations.
          </p>
        </div>

        {/* SIGNATORIES & VALIDATION */}
        <div className="w-full flex justify-between items-end z-10">
          {/* DIRECTOR SIDE */}
          <div className="text-center w-56 relative">
            <div className="absolute top-[-55px] left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
              <img
                src={signatureUrl}
                alt="Director Signature"
                className="h-20 w-auto object-contain mix-blend-multiply"
                crossOrigin="anonymous"
              />
            </div>
            <p className="font-serif border-t-2 border-slate-300 pt-2 font-bold text-slate-800 italic">
              Abdulrahman Mohammed Ayas
            </p>
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">
              Academy Director
            </p>
          </div>

          {/* REAL-LIFE VERIFICATION QR */}
          <div className="flex flex-col items-center gap-1 mb-[-15px]">
            <div className="p-1.5 border-2 border-[#1e3a8a] rounded-xl bg-white shadow-md">
              <QRCodeSVG
                value={verificationURL}
                size={75}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center mt-1">
              <p className="text-[7px] font-black text-slate-500 uppercase">
                Credential ID
              </p>
              <p className="text-[8px] font-black text-[#1e3a8a]">
                {serialNumber}
              </p>
            </div>
          </div>

          {/* DATE SIDE */}
          <div className="text-center w-56">
            <p className="font-serif border-t-2 border-slate-300 pt-2 font-bold text-slate-800 italic">
              {dateCompleted}
            </p>
            <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest mt-1">
              Date of Issuance
            </p>
          </div>
        </div>

        {/* SECURITY ASSETS */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none rotate-12">
          <Award size={480} strokeWidth={0.5} />
        </div>
        <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-amber-500 rotate-45 shadow-inner"></div>
        <div className="absolute bottom-10 right-10 opacity-10">
          <ShieldCheck size={100} color="#1e3a8a" />
        </div>
      </div>

      {/* ACTION PANEL */}
      <div className="mt-12">
        <button
          onClick={downloadCertificate}
          className="px-16 py-5 bg-[#1e3a8a] text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:bg-slate-900 transition-all shadow-xl hover:scale-105 active:scale-95"
        >
          <Download size={20} /> Export Official Credential (PDF)
        </button>
      </div>
    </div>
  );
};

export default Certificate;
