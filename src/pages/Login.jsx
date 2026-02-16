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

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        const authorizedRoles = [
          "super-admin",
          "admin",
          "instructor",
          "staff",
          "supervisor",
          "AdminContentManager",
        ];

        if (!authorizedRoles.includes(userRole)) {
          await signOut(auth);
          setError("Access Denied: You do not have administrative clearance.");
          setLoading(false);
          return;
        }

        if (userData.status === "suspended" || userData.status === "inactive") {
          await signOut(auth);
          setError(
            "Account Revoked: This staff account is currently inactive.",
          );
          setLoading(false);
          return;
        }

        // REDIRECTION LOGIC
        if (userRole === "super-admin") {
          navigate("/super-admin");
        } else if (userRole === "supervisor") {
          navigate("/supervisor-dashboard");
        } else {
          // Both 'admin' and 'AdminContentManager' go here
          navigate("/admin-dashboard");
        }
      } else {
        await signOut(auth);
        setError("Database Error: No staff profile found.");
      }
    } catch (err) {
      setError("Authentication Failed: Invalid email or security key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 font-sans">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border border-gray-100"
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
          <input
            type="email"
            placeholder="Institutional Email"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Security Key"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-600"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            disabled={loading}
            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
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
