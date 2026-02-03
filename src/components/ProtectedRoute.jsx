import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        if (currentUser) {
          // GYARA: Mun kara duba Firestore don tabbatar da Role
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userRole = userDoc.data().role;
            setRole(userRole);
            setUser(currentUser);
          } else {
            // Idan Admin ne na farko kuma bashi da doc, zaka iya bashi dama idan email dinsa ne
            console.error("User document missing in Firestore!");
            setUser(currentUser); // Bari ya wuce zuwa state na gaba don duba role
            setRole(null);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error("Security Gateway Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-6 text-white">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Verifying Gateway Access...</p>
        </div>
      </div>
    );
  }

  // 1. Idan ba'a yi login ba
  if (!user) {
    // Idan Admin ne yake son shiga, tura shi asalin Admin Gateway dinsa
    const loginPath = location.pathname.includes('admin') ? "/admin-gateway" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. RBAC (Role-Based Access Control)
  if (requiredRole && role !== requiredRole) {
    // GYARA: Mun tabbatar redirectPath ya dace da App.jsx dinka
    const redirectPath = role === 'admin' ? '/admin-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;