import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LogIn, ShieldCheck, Loader2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanEmail = email.trim().toLowerCase();

      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      );
      const user = userCredential.user;

      // Nemo bayanan matsayin (role) ma'aikaci daga Firestore
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        // AUTH CHECK: Hierarchy validation (Mun hada dukkan matakai)
        const authorizedRoles = [
          "super-admin",
          "admin",
          "malami",
          "instructor",
          "staff",
        ];
        const isAuthorized = authorizedRoles.includes(userRole);

        if (!isAuthorized) {
          await signOut(auth);
          setError("Access Denied: You do not have administrative clearance.");
          setLoading(false);
          return;
        }

        // Duba idan an dakatar da ma'aikacin (Suspension Check)
        if (userData.status === "suspended" || userData.status === "inactive") {
          await signOut(auth);
          setError(
            "Account Revoked: This staff account is currently inactive.",
          );
          setLoading(false);
          return;
        }

        // REDIRECTION LOGIC: Raba hanyar shiga dangane da girman matsayi
        if (userRole === "super-admin") {
          navigate("/super-dashboard"); // Shafi na musamman don Super Admin
        } else if (
          userRole === "admin" ||
          userRole === "staff" ||
          userRole === "malami"
        ) {
          navigate("/admin-dashboard"); // Inda AdminContentManager yake
        }
      } else {
        await signOut(auth);
        setError("Database Error: No staff profile found for this account.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Authentication Failed: Invalid email or security key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 font-sans">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border border-gray-100 transform transition-all"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 text-red-600 rounded-3xl animate-bounce">
            <ShieldCheck size={40} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-center mb-2 text-gray-900 uppercase tracking-tight">
          Staff Command Center
        </h2>
        <p className="text-center text-gray-400 text-[10px] mb-8 font-black uppercase tracking-widest">
          Authorized Personnel Only
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-black flex items-center gap-2 rounded-xl uppercase animate-shake">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-3">
              Institutional Email
            </label>
            <input
              type="email"
              placeholder="admin@ayaxuni.com"
              required
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 transition-all text-gray-900 font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-3">
              Security Key
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 transition-all text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-700 shadow-xl shadow-red-200 disabled:opacity-50 transition-all mt-6"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Verify Credentials <LogIn size={18} />
              </>
            )}
          </button>
        </div>

        <div className="mt-10 text-center border-t border-gray-100 pt-6">
          <p className="text-[9px] text-gray-300 font-black uppercase tracking-widest">
            Level 5 Security &copy; 2026 AYAX UNI
          </p>
        </div>
      </form>
    </div>
  );
};

export default StaffLogin;
