import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowRight, Loader2, UserCheck } from "lucide-react";

const StudentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Tabbatar email din yana kananan haruffa (lowercase) kuma babu sarari (trim)
      const cleanEmail = email.trim().toLowerCase();

      // 2. Yi Login da Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      );
      const user = userCredential.user;

      // 3. Duba matsayin mai login a Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // 4. Duba Role (Dole ya zama student)
        if (userData.role !== "student") {
          await signOut(auth);
          alert("RESTRICTED: This portal is for students only.");
          setLoading(false);
          return;
        }

        // 5. Duba Status (Dole ya zama active)
        if (userData.status === "suspended" || userData.status === "inactive") {
          await signOut(auth);
          alert(
            "ACCOUNT INACTIVE: Your account has been suspended or is inactive.",
          );
          setLoading(false);
          return;
        }

        // Idan komai yayi daidai
        navigate("/student-dashboard");
      } else {
        await signOut(auth);
        alert("ACCOUNT ERROR: No student profile found.");
      }
    } catch (error) {
      console.error(error);
      alert("AUTHENTICATION ERROR: Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 selection:bg-blue-600 selection:text-white font-sans">
      <div className="max-w-md w-full relative">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-200">
            <BookOpen className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none italic">
            Student <br />{" "}
            <span className="text-blue-600 font-black">Portal</span>
          </h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4">
            Authorized Academic Access Only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="ml-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. abubakar@ayax.com"
              required
              // AN GYARA: Na cire 'uppercase' a nan don rubutun ya fito normal
              className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-sm shadow-sm lowercase"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="ml-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-medium text-sm shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin text-white" />
            ) : (
              <>
                Enter Classroom <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gray-100 pt-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <UserCheck size={14} className="text-blue-500" /> Secure Student
            Session
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
