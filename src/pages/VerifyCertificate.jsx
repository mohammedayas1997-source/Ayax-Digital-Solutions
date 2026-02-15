import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Award,
  CheckCircle,
} from "lucide-react";

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [status, setStatus] = useState("loading"); // loading, verified, invalid
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    const verifyHash = async () => {
      try {
        // Querying the users collection for the unique certificateId
        const q = query(
          collection(db, "users"),
          where("certificateId", "==", certificateId),
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          setCertData(data);
          setStatus("verified");
        } else {
          setStatus("invalid");
        }
      } catch (error) {
        console.error("Verification Error:", error);
        setStatus("invalid");
      }
    };

    if (certificateId) verifyHash();
  }, [certificateId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="font-black text-slate-400 uppercase tracking-widest text-xs">
          Connecting to Ayax Secure Registry...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        {/* TOP STATUS HEADER */}
        <div
          className={`p-10 text-center ${status === "verified" ? "bg-emerald-500" : "bg-red-500"} text-white`}
        >
          {status === "verified" ? (
            <div className="flex flex-col items-center gap-4">
              <ShieldCheck size={64} className="animate-bounce" />
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                Credential Verified
              </h1>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <ShieldAlert size={64} />
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                Invalid Credential
              </h1>
            </div>
          )}
        </div>

        <div className="p-10 space-y-8">
          {status === "verified" ? (
            <>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Graduate Name
                    </p>
                    <h3 className="text-xl font-black text-slate-900 uppercase italic">
                      {certData.fullName}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </p>
                    <p className="text-sm font-black text-emerald-600 uppercase italic">
                      Authentic
                    </p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      ID Hash
                    </p>
                    <p className="text-[9px] font-black text-slate-900 uppercase truncate">
                      {certificateId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                  This record is officially recognized by Ayax Academy. The
                  recipient has fulfilled all academic requirements and
                  practical assessments for their specialized technical track.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6">
              <p className="text-slate-500 font-bold leading-relaxed">
                The Certificate ID{" "}
                <span className="text-red-500 font-black">{certificateId}</span>{" "}
                could not be located in our secure global database. This
                document may be unauthorized or expired.
              </p>
              <Link
                to="/"
                className="inline-block px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest"
              >
                Return to Home
              </Link>
            </div>
          )}
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Ayax Academy Security Protocol v4.0.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
