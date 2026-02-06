import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { LogIn, ShieldAlert, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Mun ƙara wannan

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Shigar da user
      await signInWithEmailAndPassword(auth, email, password);

      // Maimakon window.location, yi amfani da navigate
      navigate("/admin-dashboard");
    } catch (error) {
      alert("Unauthorized Access: Check credentials.");
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-2xl text-red-600">
            <ShieldAlert size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-center mb-8 text-gray-900">
          Admin Gateway
        </h2>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            required
            className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value.toLowerCase())} // lower case!
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Access Dashboard <LogIn size={20} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
