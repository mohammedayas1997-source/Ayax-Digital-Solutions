import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
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
  Menu,
  X,
  ShieldCheck,
  GraduationCap,
  Database,
  Users,
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Na maida shi true don ya nuna Sidebar nan take
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

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      navigate("/admin-gateway");
    } catch (error) {
      console.error(error);
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
      {/* --- SIDEBAR (Fixed and Forced Visibility) --- */}
      <aside
        style={{
          width: "280px",
          backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
          borderRight: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          position: "relative",
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              padding: "8px",
              backgroundColor: "#2563eb",
              borderRadius: "12px",
              color: "white",
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h1
            style={{
              fontWeight: 900,
              textTransform: "uppercase",
              fontStyle: "italic",
            }}
          >
            AYAX Admin
          </h1>
        </div>

        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <Link
            to="/admin-dashboard"
            className="nav-link active"
            style={navStyle(true)}
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link
            to="/admin/grading"
            className="nav-link"
            style={navStyle(false, isDarkMode)}
          >
            <GraduationCap size={18} /> Grading
          </Link>
          <Link
            to="/admin/questions"
            className="nav-link"
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
            gap: "12px",
          }}
        >
          {/* DARK MODE TOGGLE */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: "transparent",
              color: isDarkMode ? "#eab308" : "#475569",
            }}
          >
            {isDarkMode ? (
              <>
                <Sun size={18} /> Light
              </>
            ) : (
              <>
                <Moon size={18} /> Dark
              </>
            )}
          </button>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              padding: "16px",
              borderRadius: "16px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              fontWeight: 900,
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            backgroundColor: isDarkMode ? "rgba(30, 41, 59, 0.4)" : "#ffffff",
            padding: "48px",
            borderRadius: "40px",
            border: `1px solid ${isDarkMode ? "#1e293b" : "#f1f5f9"}`,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 900,
              textTransform: "uppercase",
              fontStyle: "italic",
              marginBottom: "40px",
            }}
          >
            Content <span style={{ color: "#2563eb" }}>Manager</span>
          </h2>

          {/* Form Content dinka na baya yana nan (Video ID, PDF, etc.) */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <input
              placeholder="Lesson Title"
              style={inputStyle(isDarkMode)}
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
            />
            <input
              placeholder="YouTube Video ID"
              style={inputStyle(isDarkMode)}
              value={content.videoUrl}
              onChange={(e) =>
                setContent({ ...content, videoUrl: e.target.value })
              }
            />
            <input
              placeholder="PDF Link"
              style={inputStyle(isDarkMode)}
              value={content.pdfUrl}
              onChange={(e) =>
                setContent({ ...content, pdfUrl: e.target.value })
              }
            />

            <button
              style={{
                padding: "20px",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Save size={20} /> Deploy Module
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Styles for simplicity
const navStyle = (active, dark) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  borderRadius: "16px",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "12px",
  textTransform: "uppercase",
  backgroundColor: active ? "#2563eb" : "transparent",
  color: active ? "white" : dark ? "#94a3b8" : "#64748b",
});

const inputStyle = (dark) => ({
  width: "100%",
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: dark ? "#1e293b" : "#f8fafc",
  border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
  color: dark ? "white" : "black",
  outline: "none",
});

export default AdminContentManager;
