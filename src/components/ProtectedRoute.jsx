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
          // 1. Fetch data from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // 2. Status Check
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
            console.error("Security profile missing for UID:", currentUser.uid);
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

  // 1. Loading UI
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

  // 2. Handle Suspended Accounts
  if (status === "suspended") {
    return (
      <Navigate to="/login" state={{ error: "Account Suspended" }} replace />
    );
  }

  // 3. Handle Unauthenticated Users
  if (!user) {
    const loginPath = location.pathname.includes("admin")
      ? "/admin-gateway"
      : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 4. Role-Based Access Control (RBAC)
  if (requiredRole && role !== requiredRole) {
    // IMPORTANT: Path normalization to prevent redirect loops
    const redirectPath =
      role === "admin"
        ? "/admin-dashboard"
        : role === "teacher"
          ? "/teacher-dashboard"
          : "/student-dashboard"; // Match this with your Login navigate path

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
