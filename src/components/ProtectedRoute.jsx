import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Navigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      try {
        if (currentUser) {
          // 1. Nemo bayanai daga Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // 2. Duba Status: Idan suspended ne, kore shi nan take
            if (
              userData.status === "suspended" ||
              userData.status === "inactive"
            ) {
              await signOut(auth);
              setUser(null);
              setRole(null);
              setStatus("suspended");
            } else {
              setRole(userData.role);
              setStatus(userData.status || "active");
              setUser(currentUser);
            }
          } else {
            // Idan babu Doc a Firestore (kamar sabon Admin da ba'a saita ba)
            console.error("User security document missing!");
            setRole(null);
            setUser(currentUser);
          }
        } else {
          setUser(null);
          setRole(null);
          setStatus(null);
        }
      } catch (error) {
        console.error("Security Gateway Error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center gap-6 text-white">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
            Verifying Security Credentials...
          </p>
        </div>
      </div>
    );
  }

  // 2. Idan account dinsa a dakatar yake (Suspended)
  if (status === "suspended") {
    // Tura shi login tare da nuna masa sako (zaka iya amfani da state don nuna alert)
    return (
      <Navigate to="/login" state={{ error: "Account Suspended" }} replace />
    );
  }

  // 3. Idan ba'a yi login ba
  if (!user) {
    const loginPath = location.pathname.includes("admin")
      ? "/admin-gateway"
      : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 4. Role-Based Access Control (RBAC)
  if (requiredRole && role !== requiredRole) {
    // Idan Admin ne yake son shiga wajen Student, tura shi Dashboard dinsa
    const redirectPath =
      role === "admin"
        ? "/admin-dashboard"
        : role === "teacher"
          ? "/teacher-dashboard"
          : "/student-portal";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
