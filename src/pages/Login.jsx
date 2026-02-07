import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LogIn, ShieldCheck, Loader2, ShieldAlert } from "lucide-react"; // Changed UserCircle to ShieldCheck
import { useNavigate } from "react-router-dom";

const StaffLogin = () => {
  // Renamed for clarity
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

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        // AUTH CHECK: Only Super Admin, Admin, and Malami allowed
        const isAuthorized =
          userRole === "super-admin" ||
          userRole === "admin" ||
          userRole === "malami" ||
          userRole === "instructor";

        if (!isAuthorized) {
          await signOut(auth);
          setError(
            "Access Denied: Administrative and Faculty credentials required.",
          );
          setLoading(false);
          return;
        }

        if (userData.status === "suspended" || userData.status === "inactive") {
          await signOut(auth);
          setError("Account Revoked: Contact Super Admin.");
          setLoading(false);
          return;
        }

        // Redirect based on specific administrative levels
        if (userRole === "super-admin") {
          navigate("/super-dashboard");
        } else {
          navigate("/admin-dashboard");
        }
      } else {
        await signOut(auth);
        setError("Account Error: Profile not found in authority database.");
      }
    } catch (err) {
      setError("Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-6 font-sans">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-gray-100"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-50 text-red-600 rounded-3xl">
            <ShieldCheck size={40} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-center mb-2 text-gray-900 uppercase tracking-tight">
          Admin Command
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8 font-medium italic">
          Super Admin, Admin & Faculty Only
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2 rounded-lg">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-2">
              Official Email
            </label>
            <input
              type="email"
              placeholder="admin@ayax.com"
              required
              autoComplete="email"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900 normal-case font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-2">
              Security Key
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black shadow-lg disabled:opacity-50 transition-all mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Authorize Access <LogIn size={18} />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            &copy; 2026 AYAX Digital Security Protocol
          </p>
        </div>
      </form>
    </div>
  );
};

export default StaffLogin;
