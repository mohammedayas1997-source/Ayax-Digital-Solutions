import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ShieldCheck, Loader2, ShieldAlert, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

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

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        const authorizedStaff = [
          "super-admin",
          "admin",
          "supervisor",
          "AdminContentManager",
          "instructor",
          "staff",
        ];

        if (!authorizedStaff.includes(userRole)) {
          await signOut(auth);
          setError(
            "ACCESS_DENIED: Unauthorized access. Staff credentials required.",
          );
          setLoading(false);
          return;
        }

        if (userData.status === "suspended" || userData.status === "inactive") {
          await signOut(auth);
          setError("ACCOUNT_REVOKED: This administrative account is inactive.");
          setLoading(false);
          return;
        }

        if (userRole === "super-admin") {
          navigate("/super-admin", { replace: true });
        } else if (userRole === "supervisor") {
          navigate("/supervisor-dashboard", { replace: true });
        } else if (userRole === "AdminContentManager") {
          navigate("/admin-secret-portal", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/instructor-portal", { replace: true });
        }
      } else {
        await signOut(auth);
        setError("DATABASE_ERROR: No administrative profile found.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("AUTHENTICATION_FAILED: Invalid institutional credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 font-sans relative">
      {/* UMURNI: CLOSE BUTTON INTEGRATION (An dan saukar da shi kasa zuwa top-16) */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute top-16 right-10 p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all duration-300 group z-50"
      >
        <X
          size={32}
          strokeWidth={3}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
        <span className="sr-only">Close Portal</span>
      </button>

      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border border-gray-100 relative"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 text-red-600 rounded-3xl animate-bounce">
            <ShieldCheck size={40} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-center mb-2 text-gray-900 uppercase tracking-tight">
          Staff Command Center
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-black flex items-center gap-2 rounded-xl uppercase">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">
              Institutional Email
            </label>
            <input
              type="email"
              placeholder="admin@ayax.com"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold transition-all text-slate-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-2 text-slate-400">
              Security Key
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold transition-all text-slate-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Verify Credentials"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StaffLogin;
