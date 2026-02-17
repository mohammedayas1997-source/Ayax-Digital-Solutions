import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  Trash2,
  Save,
  RefreshCcw,
  LayoutDashboard,
  FileVideo,
  FileText,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  GraduationCap,
  Database,
  Users,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();
  // Karanta theme daga localStorage don ya dore
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [courseId, setCourseId] = useState("web_dev");
  const [weekNum, setWeekNum] = useState(1);
  const [content, setContent] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    assignment: "",
    startDate: "",
  });

  const getDocRef = () =>
    doc(db, "courses", courseId, "weeks", `week_${weekNum}`);

  // Toggling Dark Mode
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Logout Function
  const handleLogout = async (e) => {
    e.preventDefault();
    if (window.confirm("Logout from AYAX Admin?")) {
      try {
        await signOut(auth);
        navigate("/admin-gateway");
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Fetch Data on Change
  useEffect(() => {
    const fetchCurrentContent = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(getDocRef());
        if (snap.exists()) {
          const data = snap.data();
          setContent({
            ...data,
            startDate: data.startDate?.toDate
              ? data.startDate.toDate().toISOString().slice(0, 16)
              : data.startDate || "",
          });
        } else {
          setContent({
            title: "",
            videoUrl: "",
            pdfUrl: "",
            assignment: "",
            startDate: "",
          });
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchCurrentContent();
  }, [courseId, weekNum]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#020617" : "#f8fafc",
        color: isDarkMode ? "white" : "#0f172a",
      }}
    >
      {/* SIDEBAR - Mobile & Desktop Support */}
      <aside
        style={{
          width: "280px",
          backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
          borderRight: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
          display: "flex",
          flexDirection: "column",
          padding: "30px",
          position: "fixed",
          height: "100vh",
          zIndex: 9999, // Tilasta z-index
          left: 0,
          transform: isMenuOpen
            ? "translateX(0)"
            : window.innerWidth < 768
              ? "translateX(-100%)"
              : "translateX(0)",
          transition: "transform 0.3s ease-in-out",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                padding: "10px",
                backgroundColor: "#2563eb",
                borderRadius: "12px",
                color: "white",
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <h1 style={{ fontWeight: 900, fontSize: "18px" }}>AYAX ADMIN</h1>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            style={{
              border: "none",
              background: "none",
              color: isDarkMode ? "white" : "black",
            }}
            className="md-hidden"
          >
            <X />
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Link to="/admin-dashboard" style={navStyle(true, isDarkMode)}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/grading" style={navStyle(false, isDarkMode)}>
            <GraduationCap size={18} /> Student Grading
          </Link>
          <Link to="/admin/questions" style={navStyle(false, isDarkMode)}>
            <Database size={18} /> Question Bank
          </Link>
        </nav>

        {/* LOGOUT & DARK MODE - Tilasta komawa kasa */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            paddingBottom: "20px",
          }}
        >
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={bottomBtnStyle(isDarkMode)}
          >
            {isDarkMode ? (
              <Sun size={18} color="#eab308" />
            ) : (
              <Moon size={18} color="#475569" />
            )}{" "}
            {isDarkMode ? "LIGHT MODE" : "DARK MODE"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              ...bottomBtnStyle(false),
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
            }}
          >
            <LogOut size={18} /> LOGOUT
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9998,
          }}
        ></div>
      )}

      {/* MAIN CONTENT AREA */}
      <main
        style={{
          flex: 1,
          marginLeft: window.innerWidth > 768 ? "280px" : "0",
          padding: "25px",
          transition: "all 0.3s",
        }}
      >
        {/* MOBILE HEADER (Yanzu zai bayyana a waya) */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
          className="mobile-only-header"
        >
          <button
            onClick={() => setIsMenuOpen(true)}
            style={{
              padding: "12px",
              backgroundColor: "#2563eb",
              color: "white",
              borderRadius: "12px",
              border: "none",
            }}
          >
            <Menu size={24} />
          </button>
          <h2 style={{ fontSize: "14px", fontWeight: 900 }}>
            MANAGEMENT <span style={{ color: "#2563eb" }}>CORE</span>
          </h2>
        </header>

        {/* Dash Cards & Quick Actions Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "25px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              padding: "35px",
              borderRadius: "35px",
              color: "white",
            }}
          >
            <h3 style={{ fontSize: "14px" }}>Enrolled Students</h3>
            <h2 style={{ fontSize: "36px", fontWeight: 900, margin: "15px 0" }}>
              ---
            </h2>
            <Link to="/admin/students/all" style={cardBtnStyle}>
              VIEW ROSTER
            </Link>
          </div>
          <div
            style={{
              backgroundColor: isDarkMode ? "#1e293b" : "white",
              padding: "35px",
              borderRadius: "35px",
              border: `1px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                color: isDarkMode ? "#94a3b8" : "#64748b",
              }}
            >
              Grading Queue
            </h3>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: 900,
                margin: "15px 0",
                color: isDarkMode ? "white" : "#0f172a",
              }}
            >
              ---
            </h2>
            <Link
              to="/admin/grading"
              style={{ ...cardBtnStyle, backgroundColor: "#0f172a" }}
            >
              START GRADING
            </Link>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "15px",
            marginBottom: "40px",
          }}
        >
          <Link to="/admin/questions" style={quickActionStyle(isDarkMode)}>
            <Database size={24} color="#2563eb" />
            <span style={{ fontSize: "9px", fontWeight: 900 }}>QUESTIONS</span>
          </Link>
          <Link to="/admin/grading" style={quickActionStyle(isDarkMode)}>
            <GraduationCap size={24} color="#2563eb" />
            <span style={{ fontSize: "9px", fontWeight: 900 }}>GRADING</span>
          </Link>
          <Link to="/admin/students/all" style={quickActionStyle(isDarkMode)}>
            <Users size={24} color="#2563eb" />
            <span style={{ fontSize: "9px", fontWeight: 900 }}>STUDENTS</span>
          </Link>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) { .mobile-only-header { display: flex !important; } }
        @media (min-width: 769px) { .mobile-only-header { display: none !important; } }
      `}</style>
    </div>
  );
};

// Styles
const navStyle = (active, dark) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  borderRadius: "16px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "12px",
  backgroundColor: active ? "#2563eb" : "transparent",
  color: active ? "white" : dark ? "#94a3b8" : "#64748b",
});
const quickActionStyle = (dark) => ({
  backgroundColor: dark ? "#1e293b" : "white",
  padding: "20px",
  borderRadius: "20px",
  border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  textDecoration: "none",
  color: dark ? "white" : "black",
});
const bottomBtnStyle = (dark) => ({
  padding: "15px",
  borderRadius: "15px",
  border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: "bold",
  backgroundColor: dark ? "#1e293b" : "white",
  color: dark ? "white" : "#475569",
});
const cardBtnStyle = {
  padding: "8px 15px",
  background: "rgba(255,255,255,0.2)",
  borderRadius: "10px",
  color: "white",
  fontSize: "10px",
  fontWeight: "bold",
  textDecoration: "none",
};

export default AdminContentManager;
