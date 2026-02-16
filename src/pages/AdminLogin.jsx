import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ShieldAlert, Terminal, Loader2, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredential.user;

      let userData = null;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        userData = userDocSnap.data();
      } else {
        const q = query(
          collection(db, "users"),
          where("email", "==", email.toLowerCase().trim()),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) userData = querySnapshot.docs[0].data();
      }

      if (userData) {
        const role = userData.role;

        // CIKAKKEN GYARA: Mun halatta AdminContentManager a nan
        const adminRoles = ["super-admin", "admin", "AdminContentManager"];
        const supervisorRoles = ["supervisor", "malami", "teacher"];

        if (adminRoles.includes(role)) {
          navigate("/admin-dashboard");
        } else if (supervisorRoles.includes(role)) {
          navigate("/supervisor-dashboard");
        } else {
          await auth.signOut();
          alert(
            `ACCESS DENIED: Role "${role}" not authorized for this gateway.`,
          );
        }
      } else {
        await auth.signOut();
        alert("SYSTEM ERROR: User profile not found.");
      }
    } catch (error) {
      alert(`CRITICAL: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px]"></div>
      <div className="max-w-md w-full relative z-10">
        <form
          onSubmit={handleLogin}
          className="bg-[#0a0a0a] p-12 rounded-[3.5rem] border border-white/5 shadow-2xl"
        >
          <div className="flex justify-center mb-10">
            <div className="p-6 bg-red-600/10 rounded-3xl text-red-600 border border-red-600/20 shadow-lg">
              <ShieldAlert size={44} />
            </div>
          </div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
              Security <br /> <span className="text-red-600">Gateway</span>
            </h2>
            <p className="text-red-500/40 font-black text-[9px] uppercase tracking-[0.5em] mt-4 flex items-center justify-center gap-2 italic">
              <Key size={12} /> Root Access Protocol
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="IDENTIFIER (Email)"
              className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-red-600 text-white font-bold text-[11px] tracking-[0.1em]"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="SECURITY_KEY"
              className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-red-600 text-white font-bold text-[10px] tracking-[0.2em]"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              disabled={loading}
              className="w-full py-6 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-red-700 transition-all shadow-2xl disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Verify Identity <Terminal size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
