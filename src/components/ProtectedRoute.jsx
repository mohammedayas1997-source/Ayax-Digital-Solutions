import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Navigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";

/**
 * SECURE GATEWAY: PROTECTED ROUTE INFRASTRUCTURE
 * An gyara don amincewa da AdminContentManager a kowane matakin Admin.
 */
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
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Integrity Check: Dakatar da suspended accounts
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
            setUser(currentUser);
            setRole(null);
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

  if (status === "suspended") {
    return (
      <Navigate to="/login" state={{ error: "Account Suspended" }} replace />
    );
  }

  if (!user) {
    const isAuthorityRoute =
      location.pathname.includes("admin") ||
      location.pathname.includes("super") ||
      location.pathname.includes("supervisor");
    const loginPath = isAuthorityRoute ? "/admin-gateway" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // --- MATAKIN IKO (RBAC LOGIC) ---
  if (requiredRole) {
    // MUN GYARA ANAN: Halatta AdminContentManager shiga duk inda 'admin' yake da bukata
    const hasAccess =
      role === "super-admin" ||
      role === requiredRole ||
      (requiredRole === "admin" &&
        (role === "admin" || role === "AdminContentManager")) ||
      (requiredRole === "supervisor" &&
        (role === "supervisor" || role === "super-admin"));

    if (!hasAccess) {
      // Tura kowa inda ya dace maimakon Home kawai
      const redirectPath =
        role === "super-admin"
          ? "/super-admin"
          : role === "AdminContentManager" || role === "admin"
            ? "/admin-dashboard"
            : role === "supervisor"
              ? "/supervisor-dashboard"
              : "/student-portal";

      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
