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
  ShieldCheck,
  GraduationCap,
  Database,
  Clock,
} from "lucide-react";

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(true);
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
        console.error("Fetch Error:", e);
      }
      setLoading(false);
    };
    fetchCurrentContent();
  }, [courseId, weekNum]);

  const handleCommit = async (e) => {
    e.preventDefault();
    if (!content.title || !content.videoUrl) {
      alert("Please enter Title and Video ID!");
      return;
    }
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
      alert(`SUCCESS: Week ${weekNum} has been updated!`);
    } catch (error) {
      alert("Error updating database.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      navigate("/admin-gateway");
    } catch (error) {
      console.error(error);
    }
  };

  // Icon Color Helper
  const iconColor = isDarkMode ? "#ffffff" : "#0f172a";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: isDarkMode ? "#020617" : "#f8fafc",
        color: isDarkMode ? "#ffffff" : "#0f172a",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* SIDEBAR - Forced Visibility */}
      <aside
        style={{
          width: "280px",
          backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
          borderRight: `2px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
          display: "flex",
          flexDirection: "column",
          padding: "30px",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 9999, // Tilasta shi ya fito saman komai
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "50px",
          }}
        >
          <div
            style={{
              padding: "10px",
              backgroundColor: "#2563eb",
              borderRadius: "15px",
            }}
          >
            <ShieldCheck size={28} color="#ffffff" strokeWidth={3} />
          </div>
          <h1
            style={{ fontWeight: 900, fontSize: "20px", letterSpacing: "-1px" }}
          >
            AYAX ADMIN
          </h1>
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
            <LayoutDashboard size={20} color="#ffffff" /> Dashboard
          </Link>
          <Link to="/admin/grading" style={navStyle(false, isDarkMode)}>
            <GraduationCap
              size={20}
              color={isDarkMode ? "#94a3b8" : "#64748b"}
            />{" "}
            Grading
          </Link>
          <Link to="/admin/questions" style={navStyle(false, isDarkMode)}>
            <Database size={20} color={isDarkMode ? "#94a3b8" : "#64748b"} />{" "}
            Questions
          </Link>
        </nav>

        {/* BOTTOM CONTROLS - Logout & Dark Mode */}
        <div
          style={{
            paddingBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: "15px",
              borderRadius: "18px",
              border: `2px solid ${isDarkMode ? "#334155" : "#e2e8f0"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              fontWeight: "900",
              cursor: "pointer",
              backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
              color: isDarkMode ? "#eab308" : "#475569",
              transition: "0.3s",
            }}
          >
            {isDarkMode ? (
              <Sun size={22} color="#eab308" />
            ) : (
              <Moon size={22} color="#475569" />
            )}
            {isDarkMode ? "LIGHT MODE" : "DARK MODE"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: "18px",
              borderRadius: "20px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              fontWeight: "900",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
            }}
          >
            <LogOut size={22} color="#ffffff" /> LOGOUT
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: "50px", overflowY: "auto" }}>
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            backgroundColor: isDarkMode ? "rgba(15, 23, 42, 0.6)" : "#ffffff",
            padding: "50px",
            borderRadius: "50px",
            border: `1px solid ${isDarkMode ? "#1e293b" : "#f1f5f9"}`,
            boxShadow: isDarkMode
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "50px",
            }}
          >
            <h2
              style={{
                fontSize: "40px",
                fontWeight: "900",
                textTransform: "uppercase",
                fontStyle: "italic",
                letterSpacing: "-2px",
              }}
            >
              Content <span style={{ color: "#2563eb" }}>Manager</span>
            </h2>
            {loading && (
              <RefreshCcw className="animate-spin text-blue-500" size={30} />
            )}
          </div>

          <form
            onSubmit={handleCommit}
            style={{ display: "flex", flexDirection: "column", gap: "30px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
              }}
            >
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                style={inputStyle(isDarkMode)}
              >
                <option value="web_dev">Web Development</option>
                <option value="software_eng">Software Engineering</option>
                <option value="cyber_security">Cyber Security</option>
              </select>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  value={weekNum}
                  onChange={(e) => setWeekNum(e.target.value)}
                  style={inputStyle(isDarkMode)}
                  placeholder="Week Number"
                />
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Module Title</label>
              <input
                placeholder="Enter title..."
                style={inputStyle(isDarkMode)}
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
              }}
            >
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>
                  <FileVideo size={12} /> YouTube ID
                </label>
                <input
                  placeholder="e.g. dQw4w9WgXcQ"
                  style={inputStyle(isDarkMode)}
                  value={content.videoUrl}
                  onChange={(e) =>
                    setContent({ ...content, videoUrl: e.target.value })
                  }
                />
              </div>
              <div style={{ position: "relative" }}>
                <label style={labelStyle}>
                  <FileText size={12} /> Resource PDF
                </label>
                <input
                  placeholder="URL Link"
                  style={inputStyle(isDarkMode)}
                  value={content.pdfUrl}
                  onChange={(e) =>
                    setContent({ ...content, pdfUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  color: "#2563eb",
                  letterSpacing: "1px",
                }}
              >
                <Clock size={14} style={{ marginRight: "5px" }} /> Scheduled
                Auto-Release
              </label>
              <input
                type="datetime-local"
                style={inputStyle(isDarkMode)}
                value={content.startDate}
                onChange={(e) =>
                  setContent({ ...content, startDate: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "25px",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "25px",
                fontWeight: "900",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                letterSpacing: "2px",
                opacity: loading ? 0.6 : 1,
                marginTop: "20px",
                transition: "0.3s",
              }}
            >
              {loading ? "Synchronizing..." : "Deploy Content to Students"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const navStyle = (active, dark) => ({
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "20px",
  borderRadius: "20px",
  textDecoration: "none",
  fontWeight: "900",
  fontSize: "13px",
  textTransform: "uppercase",
  backgroundColor: active ? "#2563eb" : "transparent",
  color: active ? "#ffffff" : dark ? "#94a3b8" : "#64748b",
  transition: "0.2s",
});

const inputStyle = (dark) => ({
  width: "100%",
  padding: "20px",
  borderRadius: "20px",
  backgroundColor: dark ? "#0f172a" : "#f1f5f9",
  border: `2px solid ${dark ? "#1e293b" : "#e2e8f0"}`,
  color: dark ? "#ffffff" : "#0f172a",
  outline: "none",
  fontWeight: "700",
  fontSize: "15px",
});

const labelStyle = {
  fontSize: "10px",
  fontWeight: "900",
  textTransform: "uppercase",
  opacity: 0.6,
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
};

export default AdminContentManager;
