import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Navigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";

/**
 * SECURE GATEWAY: PROTECTED ROUTE INFRASTRUCTURE
 * Cikakken gyara don magance Redirection Loop da tabbatar da amincewar Roles.
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

            // INTEGRITY CHECK: Dakatar da suspended ko inactive accounts nan take
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
            // Idan babu user doc, amma yana auth, mu bar shi ya gani amma ba role
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

  // 1. LOADING TERMINAL
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

  // 2. ACCOUNT SUSPENSION PROTOCOL
  if (status === "suspended") {
    return (
      <Navigate to="/login" state={{ error: "Account Suspended" }} replace />
    );
  }

  // 3. AUTHENTICATION CHECK
  if (!user) {
    const isAuthorityRoute =
      location.pathname.includes("admin") ||
      location.pathname.includes("super") ||
      location.pathname.includes("supervisor");
    const loginPath = isAuthorityRoute ? "/admin-gateway" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 4. ROLE-BASED ACCESS CONTROL (RBAC) LOGIC
  if (requiredRole) {
    // Tabbatar da matsayin Super-Admin, Admin, ko AdminContentManager
    const isSuperAdmin = role === "super-admin";
    const isAdminGeneral = role === "admin" || role === "AdminContentManager";

    // Logic na amincewa:
    // a. Idan kai super-admin ne (kana da full access)
    // b. Idan role dinka yayi daidai da requiredRole na shafin
    // c. Idan shafin na "admin" ne, kuma matsayinka daya ne daga cikin admin roles
    const hasAccess =
      isSuperAdmin ||
      role === requiredRole ||
      (requiredRole === "admin" && isAdminGeneral);

    if (!hasAccess) {
      // DYNAMIC REDIRECTION: Maimakon tura kowa Home, mu tura su Dashboard dinsu na asali
      let redirectPath = "/student-portal";

      if (isSuperAdmin) redirectPath = "/super-admin";
      else if (isAdminGeneral) redirectPath = "/admin-dashboard";
      else if (role === "supervisor") redirectPath = "/supervisor-dashboard";

      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
