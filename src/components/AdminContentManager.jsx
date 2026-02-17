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
  Clock,
  Users,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();

  // 1. Dark Mode State (Yana adana preference a localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("ayax-admin-theme") === "dark";
  });

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

  // Theme Toggler
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("ayax-admin-theme", newTheme ? "dark" : "light");
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
        console.error("Error fetching data:", e);
      }
      setLoading(false);
    };
    fetchCurrentContent();
  }, [courseId, weekNum]);

  // Handle Deploy (Stop Home redirection)
  const handleCommit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const releaseDate = content.startDate
        ? new Date(content.startDate)
        : new Date();
      await setDoc(
        getDocRef(),
        {
          ...content,
          startDate: releaseDate,
          weekNumber: Number(weekNum),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      alert("Success: Content Deployed!");
    } catch (error) {
      alert("Deployment Error!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      navigate("/admin-gateway");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#020617" : "#f8fafc",
        color: isDarkMode ? "white" : "#0f172a",
      }}
    >
      {/* SIDEBAR - Mobile Responsive Logic */}
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
          zIndex: 2000,
          left: 0,
          top: 0,
          transform: isMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
        }}
        className="sidebar-main"
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
              cursor: "pointer",
              color: isDarkMode ? "white" : "black",
            }}
            className="mobile-only"
          >
            <X size={24} />
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
          <Link
            to="/admin-dashboard"
            onClick={() => setIsMenuOpen(false)}
            style={navStyle(true, isDarkMode)}
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link
            to="/admin/grading"
            onClick={() => setIsMenuOpen(false)}
            style={navStyle(false, isDarkMode)}
          >
            <GraduationCap size={18} /> Student Grading
          </Link>
          <Link
            to="/admin/questions"
            onClick={() => setIsMenuOpen(false)}
            style={navStyle(false, isDarkMode)}
          >
            <Database size={18} /> Question Bank
          </Link>
        </nav>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <button onClick={toggleTheme} style={bottomBtnStyle(isDarkMode)}>
            {isDarkMode ? (
              <Sun size={18} color="#eab308" />
            ) : (
              <Moon size={18} color="#475569" />
            )}
            {isDarkMode ? "LIGHT MODE" : "DARK MODE"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              ...bottomBtnStyle(isDarkMode),
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
            zIndex: 1500,
          }}
        ></div>
      )}

      {/* MAIN CONTENT AREA */}
      <main
        style={{
          flex: 1,
          marginLeft: "0", // Default mobile
          padding: "20px",
          transition: "margin 0.3s",
        }}
        className="content-area"
      >
        {/* MOBILE HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "30px",
          }}
          className="mobile-header"
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
        </div>

        {/* TOP CARDS GRID */}
        <div
          className="grid-cards"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              padding: "30px",
              borderRadius: "30px",
              color: "white",
            }}
          >
            <h3 style={{ fontSize: "14px" }}>Enrolled Students</h3>
            <h2 style={{ fontSize: "32px", fontWeight: 900, margin: "10px 0" }}>
              ---
            </h2>
            <Link to="/admin/students/all" style={cardBtnStyle}>
              VIEW ROSTER
            </Link>
          </div>
          <div
            style={{
              backgroundColor: isDarkMode ? "#1e293b" : "white",
              padding: "30px",
              borderRadius: "30px",
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
                fontSize: "32px",
                fontWeight: 900,
                margin: "10px 0",
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
        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            color: "#94a3b8",
            letterSpacing: "2px",
            marginBottom: "15px",
          }}
        >
          QUICK ACTIONS
        </p>
        <div
          className="quick-actions-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "15px",
            marginBottom: "40px",
          }}
        >
          <Link to="/admin/questions" style={quickActionStyle(isDarkMode)}>
            <Database size={24} color="#2563eb" />
            <span style={quickLabelStyle(isDarkMode)}>QUESTIONS</span>
          </Link>
          <Link to="/admin/grading" style={quickActionStyle(isDarkMode)}>
            <GraduationCap size={24} color="#2563eb" />
            <span style={quickLabelStyle(isDarkMode)}>GRADING</span>
          </Link>
          <Link to="/admin/students/all" style={quickActionStyle(isDarkMode)}>
            <Users size={24} color="#2563eb" />
            <span style={quickLabelStyle(isDarkMode)}>STUDENTS</span>
          </Link>
          <Link to="/admin/chat/all" style={quickActionStyle(isDarkMode)}>
            <MessageSquare size={24} color="#2563eb" />
            <span style={quickLabelStyle(isDarkMode)}>CHAT</span>
          </Link>
        </div>

        {/* CONTENT FORM */}
        <div
          style={{
            backgroundColor: isDarkMode ? "#0f172a" : "white",
            padding: "30px",
            borderRadius: "40px",
            border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
            boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: 900 }}>
              CONTENT <span style={{ color: "#2563eb" }}>MANAGER</span>
            </h2>
            {loading && (
              <RefreshCcw size={20} className="animate-spin text-blue-600" />
            )}
          </div>
          <form
            onSubmit={handleCommit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <input
              placeholder="Module Title"
              style={inputStyle(isDarkMode)}
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <input
                placeholder="YouTube Video ID"
                style={inputStyle(isDarkMode)}
                value={content.videoUrl}
                onChange={(e) =>
                  setContent({ ...content, videoUrl: e.target.value })
                }
              />
              <input
                placeholder="PDF Asset URL"
                style={inputStyle(isDarkMode)}
                value={content.pdfUrl}
                onChange={(e) =>
                  setContent({ ...content, pdfUrl: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "20px",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "20px",
                fontWeight: 900,
                border: "none",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "SAVING..." : "DEPLOY MODULE"}
            </button>
          </form>
        </div>
      </main>

      {/* Responsive Styles Injection */}
      <style>{`
        @media (min-width: 769px) {
          .sidebar-main { transform: translateX(0) !important; }
          .content-area { margin-left: 280px !important; }
          .mobile-header { display: none !important; }
          .mobile-only { display: none !important; }
        }
        @media (max-width: 768px) {
          .content-area { margin-left: 0 !important; padding: 15px !important; }
          .grid-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

// --- STYLING HELPERS ---
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
  padding: "25px",
  borderRadius: "25px",
  border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  textDecoration: "none",
});

const quickLabelStyle = (dark) => ({
  fontSize: "8px",
  fontWeight: "900",
  color: dark ? "white" : "#0f172a",
});
const inputStyle = (dark) => ({
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: `2px solid ${dark ? "#1e293b" : "#f1f5f9"}`,
  backgroundColor: dark ? "#020617" : "#f8fafc",
  color: dark ? "white" : "black",
  outline: "none",
  fontWeight: "bold",
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
