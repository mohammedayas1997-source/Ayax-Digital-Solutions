import React, { useState } from 'react';
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldAlert, Terminal, LogIn, Loader2, Key } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin-dashboard"; 
    } catch (error) {
      alert("CRITICAL: Unauthorized access attempt detected. Admin credentials rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6 relative overflow-hidden">
      {/* Tactical Glow Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px]"></div>
      
      <div className="max-w-md w-full relative z-10">
        <form onSubmit={handleLogin} className="bg-[#0a0a0a] p-12 rounded-[3.5rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
          <div className="flex justify-center mb-10">
            <div className="p-6 bg-red-600/10 rounded-3xl text-red-600 border border-red-600/20 shadow-[0_0_30px_-5px_rgba(220,38,38,0.3)]">
              <ShieldAlert size={44} />
            </div>
          </div>
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Admin <br/> <span className="text-red-600">Gateway</span></h2>
            <p className="text-red-500/40 font-black text-[9px] uppercase tracking-[0.5em] mt-4 flex items-center justify-center gap-2 italic">
              <Key size={12} /> Root Access Protocol
            </p>
          </div>

          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="ADMIN_IDENTIFIER" 
              required
              className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-red-600 focus:bg-white/10 text-white font-bold text-[10px] tracking-[0.2em] transition-all uppercase placeholder:text-gray-700"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="SECURITY_KEY" 
              required
              className="w-full p-6 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-red-600 focus:bg-white/10 text-white font-bold text-[10px] tracking-[0.2em] transition-all placeholder:text-gray-700"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              disabled={loading}
              className="w-full py-6 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-red-700 transition-all shadow-2xl shadow-red-900/40 disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Verify Identity <Terminal size={18} /></>}
            </button>
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Sys_Mainframe: Connected</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;