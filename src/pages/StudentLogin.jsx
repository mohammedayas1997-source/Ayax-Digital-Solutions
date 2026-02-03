import React, { useState } from 'react';
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Lock, ArrowRight, Loader2, UserCheck } from 'lucide-react';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/student-dashboard"); 
    } catch (error) {
      alert("AUTHENTICATION ERROR: Student record not found or invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 selection:bg-blue-600 selection:text-white">
      <div className="max-w-md w-full relative">
        {/* Academic Branding */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-200">
            <BookOpen className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Student <br/> <span className="text-blue-600">Portal</span></h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4">Authorized Academic Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="group relative">
            <input 
              type="email" 
              placeholder="STUDENT EMAIL ADDRESS" 
              required
              className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-xs tracking-widest uppercase placeholder:text-gray-300"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="group relative">
            <input 
              type="password" 
              placeholder="ACCOUNT PASSWORD" 
              required
              className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-xs tracking-widest uppercase placeholder:text-gray-300"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin text-white" /> : <>Enter Classroom <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gray-100 pt-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <UserCheck size={14} className="text-blue-500" /> Secure Student Session
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;