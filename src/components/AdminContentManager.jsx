import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  FileVideo,
  FileText,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Database,
  Menu,
  X,
  PlusCircle,
  Save,
  RefreshCcw,
  BookOpen,
  Calendar,
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Curriculum State
  const [courseId, setCourseId] = useState("web_dev");
  const [weekNum, setWeekNum] = useState(1);
  const [content, setContent] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    assignment: "",
    startDate: "",
  });

  const getDocRef = () => doc(db, "course_settings", `week_${weekNum}`);

  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleLogout = async (e) => {
    e.preventDefault();
    if (window.confirm("Terminate Content Manager Session?")) {
      try {
        await signOut(auth);
        navigate("/admin-gateway");
      } catch (err) {
        console.error("AUTH_ERROR:", err);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(
        getDocRef(),
        {
          ...content,
          startDate: content.startDate ? new Date(content.startDate) : null,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      alert("CURRICULUM_SYNC_SUCCESS: Node Updated.");
    } catch (err) {
      alert("SYNC_FAILURE: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
        console.error("NODE_FETCH_ERROR:", e);
      }
      setLoading(false);
    };
    fetchCurrentContent();
  }, [weekNum]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#020617" : "#f8fafc",
        color: isDarkMode ? "white" : "#0f172a",
      }}
    >
      {/* SIDEBAR - CURRICULUM OPTIMIZED */}
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
          zIndex: 9999,
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
            <h1
              style={{
                fontWeight: 900,
                fontSize: "16px",
                letterSpacing: "1px",
              }}
            >
              AYAX CONTENT
            </h1>
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
          <button style={navStyle(true, isDarkMode)}>
            <BookOpen size={18} /> Lesson Manager
          </button>
          <button style={navStyle(false, isDarkMode)}>
            <FileVideo size={18} /> Video Assets
          </button>
          <button style={navStyle(false, isDarkMode)}>
            <Calendar size={18} /> Week Scheduling
          </button>
        </nav>

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
            <LogOut size={18} /> LOGOUT TERMINAL
          </button>
        </div>
      </aside>

      {/* MAIN ENGINE AREA */}
      <main
        style={{
          flex: 1,
          marginLeft: window.innerWidth > 768 ? "280px" : "0",
          padding: "40px",
          transition: "all 0.3s",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 900, italic: "true" }}>
              CURRICULUM <span style={{ color: "#2563eb" }}>DEPLOYMENT</span>
            </h1>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 800,
                opacity: 0.5,
                letterSpacing: "2px",
              }}
            >
              ACADEMIC NODE : {courseId.toUpperCase()}
            </p>
          </div>
          <button
            onClick={() => setIsMenuOpen(true)}
            style={{
              display: window.innerWidth < 768 ? "block" : "none",
              padding: "12px",
              background: "#2563eb",
              color: "white",
              borderRadius: "12px",
              border: "none",
            }}
          >
            <Menu size={24} />
          </button>
        </header>

        <div
          style={{
            maxWidth: "800px",
            backgroundColor: isDarkMode ? "#0f172a" : "white",
            padding: "40px",
            borderRadius: "35px",
            border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "30px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: 900 }}>
              WEEK {weekNum} CONFIGURATION
            </h2>
            <select
              value={weekNum}
              onChange={(e) => setWeekNum(Number(e.target.value))}
              style={{
                padding: "10px 20px",
                borderRadius: "15px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {[...Array(24)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          </div>

          <form
            onSubmit={handleUpdate}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <label style={labelStyle}>Start Deployment Date</label>
              <input
                type="datetime-local"
                value={content.startDate}
                onChange={(e) =>
                  setContent({ ...content, startDate: e.target.value })
                }
                style={inputStyle(isDarkMode)}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Lesson Title</label>
              <input
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                placeholder="e.g. Masterclass in Redux Architecture"
                style={inputStyle(isDarkMode)}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>Video Asset (YouTube ID)</label>
                <input
                  value={content.videoUrl}
                  onChange={(e) =>
                    setContent({ ...content, videoUrl: e.target.value })
                  }
                  placeholder="ID Only"
                  style={inputStyle(isDarkMode)}
                />
              </div>
              <div>
                <label style={labelStyle}>Reading Material (PDF URL)</label>
                <input
                  value={content.pdfUrl}
                  onChange={(e) =>
                    setContent({ ...content, pdfUrl: e.target.value })
                  }
                  placeholder="Cloud URL"
                  style={inputStyle(isDarkMode)}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Assignment Specification</label>
              <textarea
                value={content.assignment}
                onChange={(e) =>
                  setContent({ ...content, assignment: e.target.value })
                }
                style={{
                  ...inputStyle(isDarkMode),
                  height: "120px",
                  resize: "none",
                }}
              />
            </div>
            <button type="submit" disabled={loading} style={submitBtnStyle}>
              {loading ? (
                <RefreshCcw className="animate-spin" />
              ) : (
                <>
                  <Save size={18} /> PUSH TO LIVE PRODUCTION
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

// PROFESSIONAL TERMINAL STYLES
const navStyle = (active, dark) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "18px",
  borderRadius: "20px",
  textDecoration: "none",
  fontWeight: 900,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  backgroundColor: active ? "#2563eb" : "transparent",
  color: active ? "white" : dark ? "#475569" : "#64748b",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
});
const inputStyle = (dark) => ({
  width: "100%",
  padding: "18px",
  borderRadius: "18px",
  border: `2px solid ${dark ? "#1e293b" : "#f1f5f9"}`,
  backgroundColor: dark ? "#020617" : "#f8fafc",
  color: "inherit",
  fontWeight: "bold",
  outline: "none",
  transition: "0.3s",
});
const labelStyle = {
  fontSize: "10px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  marginBottom: "8px",
  display: "block",
  color: "#2563eb",
};
const submitBtnStyle = {
  width: "100%",
  padding: "20px",
  borderRadius: "20px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "2px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  boxShadow: "0 10px 20px -5px rgba(37,99,235,0.4)",
};
const bottomBtnStyle = (dark) => ({
  padding: "15px",
  borderRadius: "15px",
  border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: "bold",
  fontSize: "10px",
  backgroundColor: dark ? "#1e293b" : "white",
  color: dark ? "white" : "#475569",
});

export default AdminContentManager;
