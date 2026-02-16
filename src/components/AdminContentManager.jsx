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

  // 1. WANNAN SHINE ZAI DUBI ABINDA KE CIKI (FETCH LOGIC)
  useEffect(() => {
    const fetchCurrentContent = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(getDocRef());
        if (snap.exists()) {
          const data = snap.data();
          // Muna maida Firebase Timestamp zuwa format din da input zai gane
          setContent({
            ...data,
            startDate: data.startDate?.toDate
              ? data.startDate.toDate().toISOString().slice(0, 16)
              : data.startDate || "",
          });
        } else {
          // Idan babu komai, mu share input din
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
  }, [courseId, weekNum]); // Zai sake tashi duk sanda aka canza Course ko Week

  // 2. GYARAN DEPLOY (SAVE) LOGIC
  const handleCommit = async (e) => {
    e.preventDefault(); // MUHIMMI: Wannan ne zai hana shi mayar da kai Home!

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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#020617" : "#f8fafc",
        color: isDarkMode ? "white" : "#0f172a",
      }}
    >
      {/* SIDEBAR */}
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
          <Link to="/admin-dashboard" style={navStyle(true)}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/grading" style={navStyle(false, isDarkMode)}>
            <GraduationCap size={18} /> Grading
          </Link>
          <Link to="/admin/questions" style={navStyle(false, isDarkMode)}>
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

      {/* MAIN AREA */}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <h2
              style={{
                fontSize: "36px",
                fontWeight: 900,
                textTransform: "uppercase",
                fontStyle: "italic",
              }}
            >
              Content <span style={{ color: "#2563eb" }}>Manager</span>
            </h2>
            {loading && <RefreshCcw className="animate-spin text-blue-500" />}
          </div>

          <form
            onSubmit={handleCommit}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
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
              <input
                type="number"
                value={weekNum}
                onChange={(e) => setWeekNum(e.target.value)}
                style={inputStyle(isDarkMode)}
                placeholder="Week Number"
              />
            </div>

            <input
              placeholder="Lesson Title"
              style={inputStyle(isDarkMode)}
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
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  color: "#3b82f6",
                }}
              >
                Scheduled Release Date
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
                padding: "20px",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "20px",
                fontWeight: 900,
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                opacity: loading ? 0.5 : 1,
                marginTop: "20px",
              }}
            >
              {loading ? "Syncing..." : "Deploy Module"}
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
