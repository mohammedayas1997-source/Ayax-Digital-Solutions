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
          const userRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
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
          <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse text-blue-500">
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

  // --- REFINED RBAC LOGIC: STOP THE BOUNCING ---
  if (requiredRole) {
    const isSuperAdmin = role === "super-admin";
    const isAdminGeneral = role === "admin" || role === "AdminContentManager";

    // 1. Check if the user has permission for THIS specific route
    const hasAccessToCurrentPage =
      isSuperAdmin ||
      role === requiredRole ||
      (requiredRole === "admin" && isAdminGeneral);

    if (!hasAccessToCurrentPage) {
      // ONLY redirect if they actually don't have access.
      // If an AdminContentManager is on an "admin" page, hasAccessToCurrentPage is TRUE.

      let redirectPath = "/student-portal";
      if (isSuperAdmin) redirectPath = "/super-admin";
      else if (role === "AdminContentManager")
        redirectPath = "/admin-secret-portal";
      else if (role === "admin") redirectPath = "/admin-dashboard";
      else if (role === "supervisor") redirectPath = "/supervisor-dashboard";

      return <Navigate to={redirectPath} replace />;
    }
  }

  // If they have access, just return the children. No Navigate call = No bouncing.
  return children;
};

export default ProtectedRoute;
