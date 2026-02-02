import React, { useState } from 'react';
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LogIn, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin-dashboard"; // Redirect after success
    } catch (error) {
      alert("Unauthorized Access: Check credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-6">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-2xl text-red-600">
            <ShieldAlert size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-center mb-8 text-gray-900">Admin Gateway</h2>
        <div className="space-y-4">
          <input 
            type="email" placeholder="Admin Email" 
            className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black">
            Access Dashboard <LogIn size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;