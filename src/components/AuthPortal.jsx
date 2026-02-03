import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { LogIn, UserPlus, Mail, Lock, GraduationCap, ArrowRight } from 'lucide-react';

const AuthPortal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        // Login Logic
        await signInWithEmailAndPassword(auth, email, password);
        alert("Barka da dawowa!");
      } else {
        // Register Logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save additional student info to Firestore
        await setDoc(doc(db, "students", user.uid), {
          uid: user.uid,
          fullName: fullName,
          email: email,
          role: 'student',
          joinedAt: new Date()
        });
        alert("An yi rajista cikin nasara!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-6">
      <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
        
        {/* Left Side: Brand/Visual */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <GraduationCap size={40} className="text-blue-200" />
              <h1 className="text-2xl font-black tracking-tighter">AYAX UNIVERSITY</h1>
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              {isLogin ? "Global Learning at Your Fingertips." : "Join the Future of Education Today."}
            </h2>
            <p className="text-blue-100 font-medium">Access world-class courses and a community of global students.</p>
          </div>
          <div className="relative z-10 bg-blue-700/40 p-6 rounded-2xl backdrop-blur-md border border-blue-400/20">
            <p className="text-sm italic font-medium">"Education is the most powerful weapon which you can use to change the world."</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-10 lg:p-16">
          <div className="flex gap-8 mb-10 border-b border-gray-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`pb-4 font-black text-sm uppercase tracking-widest transition-all ${isLogin ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`pb-4 font-black text-sm uppercase tracking-widest transition-all ${!isLogin ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-lg">{error}</p>}
            
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><LogIn size={18} /></span>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Mail size={18} /></span>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="name@university.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group"
            >
              {isLogin ? "Sign In" : "Create Account"} 
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
            Protected by Ayax Security Suite
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;