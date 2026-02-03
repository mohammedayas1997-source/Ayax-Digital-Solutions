import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { ShieldCheck, XCircle, Award, CheckCircle2 } from 'lucide-react';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      // Idan babu certificateId, kada mu bata lokacin kiran Firebase
      if (!certificateId) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "certificates", certificateId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData(docSnap.data());
        }
      } catch (error) {
        // Idan akwai error, za mu gani a console daki-daki
        console.error("🔥 Firebase Verification Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 p-8 text-center text-white">
          <Award size={60} className="mx-auto mb-4 opacity-80" />
          <h1 className="text-2xl font-black uppercase tracking-widest">Certificate Verification</h1>
        </div>

        <div className="p-10 text-center">
          {data ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Valid Certificate</h2>
              <p className="text-gray-500 font-medium mb-8">This document is officially recognized by Ayax University.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Student Name</p>
                  <p className="font-bold text-gray-800">{data.studentName}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Course Completed</p>
                  <p className="font-bold text-gray-800">{data.courseName}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Issue Date</p>
                  <p className="font-bold text-gray-800">{data.issueDate}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="font-bold text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={16} /> Verified Official
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-full mb-6">
                <XCircle size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Invalid Certificate</h2>
              <p className="text-gray-500 font-medium">The certificate ID provided does not match our official records.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-black text-sm uppercase"
              >
                Back to Home
              </button>
            </>
          )}
        </div>
        
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Ayax University Academic Registry • 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;