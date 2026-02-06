import React, { useState } from "react";
import { auth, db } from "../firebaseConfig"; // Ka tabbata 'db' yana nan
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { LogIn, UserCircle, Loader2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentLogin = () => {
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
      // 1. Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredential.user;

      // 2. Fetch User Data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // 3. Role Validation (Student Only)
        if (userData.role !== "student") {
          await signOut(auth); // Kore shi idan ba student ba ne
          setError("Unauthorized: Wannan kofar ta dalibai ce kadai.");
          setLoading(false);
          return;
        }

        // 4. Status Validation (Active Check)
        if (userData.status === "suspended" || userData.status === "inactive") {
          await signOut(auth); // Kore shi idan an dakatar da shi
          setError("Account dinka ba ya aiki. Tuntubi babban admin.");
          setLoading(false);
          return;
        }

        // 5. Success - Navigate to Student Portal
        navigate("/student-portal");
      } else {
        await signOut(auth);
        setError("Babu bayananka a tsarinmu.");
      }
    } catch (err) {
      console.error(err.message);
      setError("Email ko Password ba su daidai ba.");
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
          <div className="p-4 bg-blue-50 rounded-3xl text-blue-600">
            <UserCircle size={40} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-center mb-2 text-gray-900 uppercase tracking-tight">
          Student Portal
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8 font-medium">
          Shiga dandalin koyo na dalibai
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold flex items-center gap-2 rounded-lg">
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="sunana@misali.com"
              required
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setEmail(e.target.value.toLowerCase())}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 ml-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Sign In <LogIn size={18} />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            &copy; 2026 Academy Management System
          </p>
        </div>
      </form>
    </div>
  );
};

export default StudentLogin;
