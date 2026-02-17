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
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  // FETCH DATA LOGIC
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
      alert("Error!");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin-gateway");
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
      {/* SIDEBAR - forced Z-index and visibility */}
      <aside
        style={{
          width: "280px",
          backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          padding: "30px",
          position: "fixed",
          height: "100vh",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "40px",
          }}
        >
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

        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Link to="/admin-dashboard" style={navStyle(true)}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/grading" style={navStyle(false)}>
            <GraduationCap size={18} /> Grading Queue
          </Link>
          <Link to="/admin/questions" style={navStyle(false)}>
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
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: "15px",
              borderRadius: "15px",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "bold",
            }}
          >
            {isDarkMode ? (
              <Sun size={18} color="#eab308" />
            ) : (
              <Moon size={18} color="#475569" />
            )}{" "}
            {isDarkMode ? "Light" : "Dark"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "15px",
              borderRadius: "15px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, marginLeft: "280px", padding: "40px" }}>
        {/* Header section from your screenshot */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 900,
              color: "#2563eb",
              letterSpacing: "2px",
            }}
          >
            MANAGEMENT SUITE
          </p>
        </div>

        {/* Top Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "25px",
            marginBottom: "50px",
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
            <Link
              to="/admin/students/web_dev"
              style={{
                padding: "10px 20px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "10px",
                color: "white",
                fontSize: "10px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              VIEW ROSTER
            </Link>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "35px",
              borderRadius: "35px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ fontSize: "14px", color: "#64748b" }}>
              Grading Queue
            </h3>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: 900,
                margin: "15px 0",
                color: "#0f172a",
              }}
            >
              ---
            </h2>
            <Link
              to="/admin/grading"
              style={{
                padding: "12px 25px",
                backgroundColor: "#0f172a",
                color: "white",
                borderRadius: "12px",
                fontSize: "10px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              START GRADING
            </Link>
          </div>
        </div>

        {/* Quick Actions (Icons in your screenshot) */}
        <p
          style={{
            fontSize: "10px",
            fontWeight: 900,
            color: "#94a3b8",
            letterSpacing: "2px",
            marginBottom: "20px",
          }}
        >
          QUICK ACTIONS
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "15px",
            marginBottom: "50px",
          }}
        >
          <Link to="/admin/questions" style={quickActionStyle()}>
            <Database size={24} color="#2563eb" />
            <span style={quickLabelStyle}>QUESTIONS BANK</span>
          </Link>
          <Link to="/admin/grading" style={quickActionStyle()}>
            <GraduationCap size={24} color="#2563eb" />
            <span style={quickLabelStyle}>STUDENT GRADING</span>
          </Link>
          <Link to="/admin/students/all" style={quickActionStyle()}>
            <Users size={24} color="#2563eb" />
            <span style={quickLabelStyle}>ENROLLED STUDENTS</span>
          </Link>
          <Link to="/admin/chat/web_dev" style={quickActionStyle()}>
            <MessageSquare size={24} color="#2563eb" />
            <span style={quickLabelStyle}>COURSE CHAT</span>
          </Link>
        </div>

        {/* CONTENT MANAGER FORM */}
        <div
          style={{
            backgroundColor: "white",
            padding: "50px",
            borderRadius: "50px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{ fontSize: "32px", fontWeight: 900, marginBottom: "40px" }}
          >
            CONTENT <span style={{ color: "#2563eb" }}>MANAGER</span>
          </h2>
          <form
            onSubmit={handleCommit}
            style={{ display: "flex", flexDirection: "column", gap: "25px" }}
          >
            <input
              placeholder="Module Title"
              style={inputStyle()}
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <input
                placeholder="YouTube Video ID"
                style={inputStyle()}
                value={content.videoUrl}
                onChange={(e) =>
                  setContent({ ...content, videoUrl: e.target.value })
                }
              />
              <input
                placeholder="PDF Asset URL"
                style={inputStyle()}
                value={content.pdfUrl}
                onChange={(e) =>
                  setContent({ ...content, pdfUrl: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "20px",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "20px",
                fontWeight: 900,
                border: "none",
                cursor: "pointer",
              }}
            >
              DEPLOY MODULE
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

// Helper Styles
const navStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  borderRadius: "16px",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "12px",
  backgroundColor: active ? "#2563eb" : "transparent",
  color: active ? "white" : "#64748b",
});

const quickActionStyle = () => ({
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "25px",
  border: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  gap: "10px",
});

const quickLabelStyle = {
  fontSize: "8px",
  fontWeight: "900",
  color: "#0f172a",
  textAlign: "center",
};
const inputStyle = () => ({
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: "2px solid #f1f5f9",
  backgroundColor: "#f8fafc",
  outline: "none",
  fontWeight: "bold",
});

export default AdminContentManager;
