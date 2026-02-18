import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  FileVideo,
  FileText,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Menu,
  X,
  Save,
  RefreshCcw,
  BookOpen,
  Calendar,
  Globe,
  Clock,
  ExternalLink,
  Zap,
  Timer,
} from "lucide-react";

// 1. MATSAR DA WANNAN SAMAN COMPONENT DIN
const modeBtnStyle = (active, color) => ({
  padding: "12px 24px",
  borderRadius: "15px",
  border: active ? `2px solid ${color}` : "2px solid transparent",
  backgroundColor: active ? `${color}10` : "#f1f5f9",
  color: active ? color : "#64748b",
  fontWeight: 900,
  fontSize: "10px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  transition: "0.3s",
});

const AdminContentManager = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem("admin-theme") === "dark",
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deploymentMode, setDeploymentMode] = useState("manual");

  // Curriculum State
  const [courseId, setCourseId] = useState("web_dev");
  const [weekNum, setWeekNum] = useState(1);
  const [activeTab, setActiveTab] = useState("curriculum");
  const [content, setContent] = useState({
    title: "",
    videoUrl: "",
    pdfUrl: "",
    assignment: "",
    startDate: "",
  });

  const libraryLinks = [
    {
      name: "O'Reilly Open Books",
      url: "https://www.oreilly.com/library/view/open-books/",
      cat: "Engineering",
    },
    { name: "MIT OpenCourseWare", url: "https://ocw.mit.edu/", cat: "CS" },
    {
      name: "Google Scholar Central",
      url: "https://scholar.google.com/",
      cat: "Research",
    },
    {
      name: "GitHub Archive",
      url: "https://archive.org/details/github",
      cat: "Code",
    },
    {
      name: "ArXiv.org AI Research",
      url: "https://arxiv.org/list/cs.AI/recent",
      cat: "AI/ML",
    },
    {
      name: "Microsoft Academic Search",
      url: "https://academic.microsoft.com/",
      cat: "Multi",
    },
    {
      name: "Project Gutenberg",
      url: "https://www.gutenberg.org/",
      cat: "Literature",
    },
    {
      name: "Leanpub Free Shelf",
      url: "https://leanpub.com/bookstore/type/book/sort/top_free",
      cat: "Tech",
    },
    {
      name: "Springboard Data Resources",
      url: "https://www.springboard.com/blog/data-science/data-science-books/",
      cat: "Data",
    },
    {
      name: "Coursera Resource Hub",
      url: "https://www.coursera.org/browse",
      cat: "Courses",
    },
  ];

  const getDocRef = () => doc(db, "course_settings", `week_${weekNum}`);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleLogout = async () => {
    if (window.confirm("CRITICAL: Terminate Content Manager Session?")) {
      await signOut(auth);
      navigate("/admin-gateway");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Gyara: Tabbatar akwai startDate idan mode din Auto ne
      let finalStartDate;
      if (deploymentMode === "manual") {
        finalStartDate = new Date();
      } else {
        finalStartDate = content.startDate
          ? new Date(content.startDate)
          : new Date();
      }

      await setDoc(
        getDocRef(),
        {
          ...content,
          videoId: content.videoUrl,
          startDate: finalStartDate,
          deploymentMode: deploymentMode,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      alert(
        `SUCCESS: Week ${weekNum} deployed via ${deploymentMode.toUpperCase()} mode.`,
      );
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
        transition: "background 0.3s ease",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "300px",
          backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
          borderRight: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
          display: "flex",
          flexDirection: "column",
          padding: "40px 30px",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
        }}
      >
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                padding: "10px",
                backgroundColor: "#2563eb",
                borderRadius: "15px",
                color: "white",
              }}
            >
              <ShieldCheck size={28} />
            </div>
            <h1
              style={{
                fontWeight: 900,
                fontSize: "18px",
                letterSpacing: "-0.5px",
              }}
            >
              AYAX <span style={{ color: "#2563eb" }}>CONTENT</span>
            </h1>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#2563eb",
                marginBottom: "5px",
              }}
            >
              <Clock size={14} />
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "1px",
                }}
              >
                MASTER TIME
              </span>
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 900,
                fontFamily: "monospace",
              }}
            >
              {currentTime.toLocaleTimeString("en-GB", { hour12: false })}
            </div>
          </div>
        </div>

        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={() => setActiveTab("curriculum")}
            style={navStyle(activeTab === "curriculum", isDarkMode)}
          >
            <BookOpen size={18} /> Lesson Manager
          </button>
          <button
            onClick={() => setActiveTab("library")}
            style={navStyle(activeTab === "library", isDarkMode)}
          >
            <Globe size={18} /> Research Repo
          </button>
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={bottomBtnStyle(isDarkMode)}
          >
            {isDarkMode ? (
              <Sun size={18} color="#eab308" />
            ) : (
              <Moon size={18} color="#2563eb" />
            )}
            {isDarkMode ? "SPECTRUM: LIGHT" : "SPECTRUM: DARK"}
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
            <LogOut size={18} /> TERMINATE SESSION
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, marginLeft: "300px", padding: "60px" }}>
        {activeTab === "curriculum" && (
          <div>
            <header style={{ marginBottom: "50px" }}>
              <h1
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  fontStyle: "italic",
                }}
              >
                CURRICULUM <span style={{ color: "#2563eb" }}>NODE</span>
              </h1>
              <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                <button
                  onClick={() => setDeploymentMode("manual")}
                  style={modeBtnStyle(deploymentMode === "manual", "#2563eb")}
                >
                  <Zap size={16} /> MANUAL PUSH (INSTANT)
                </button>
                <button
                  onClick={() => setDeploymentMode("auto")}
                  style={modeBtnStyle(deploymentMode === "auto", "#8b5cf6")}
                >
                  <Timer size={16} /> AUTO SCHEDULE
                </button>
              </div>
            </header>

            <div
              style={{
                maxWidth: "900px",
                backgroundColor: isDarkMode ? "#0f172a" : "white",
                padding: "50px",
                borderRadius: "40px",
                border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
                boxShadow: "0 40px 80px -20px rgba(0,0,0,0.15)",
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
                <h2 style={{ fontSize: "20px", fontWeight: 900 }}>
                  CONFIGURATION TERMINAL
                </h2>
                <select
                  value={weekNum}
                  onChange={(e) => setWeekNum(Number(e.target.value))}
                  style={{
                    padding: "12px 25px",
                    borderRadius: "15px",
                    border: "none",
                    backgroundColor: "#2563eb",
                    color: "white",
                    fontWeight: 900,
                  }}
                >
                  {[...Array(24)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      SELECT WEEK {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <form
                onSubmit={handleUpdate}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "25px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "25px",
                  }}
                >
                  {/* WANNAN ZAI BAYYANA NE KAWAI IDAN AUTO NE */}
                  {deploymentMode === "auto" ? (
                    <div>
                      <label style={labelStyle}>Scheduled Release Time</label>
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
                  ) : (
                    <div>
                      <label style={labelStyle}>Module Title</label>
                      <input
                        value={content.title}
                        onChange={(e) =>
                          setContent({ ...content, title: e.target.value })
                        }
                        placeholder="Enter Lesson Name"
                        style={inputStyle(isDarkMode)}
                      />
                    </div>
                  )}
                  {deploymentMode === "auto" && (
                    <div>
                      <label style={labelStyle}>Module Title</label>
                      <input
                        value={content.title}
                        onChange={(e) =>
                          setContent({ ...content, title: e.target.value })
                        }
                        placeholder="Enter Lesson Name"
                        style={inputStyle(isDarkMode)}
                      />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "25px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>YouTube Video ID</label>
                    <input
                      value={content.videoUrl}
                      onChange={(e) =>
                        setContent({ ...content, videoUrl: e.target.value })
                      }
                      placeholder="dQw4w9WgXcQ"
                      style={inputStyle(isDarkMode)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Lecture PDF Link</label>
                    <input
                      value={content.pdfUrl}
                      onChange={(e) =>
                        setContent({ ...content, pdfUrl: e.target.value })
                      }
                      placeholder="https://cloud.storage/notes.pdf"
                      style={inputStyle(isDarkMode)}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Assignment Briefing</label>
                  <textarea
                    value={content.assignment}
                    onChange={(e) =>
                      setContent({ ...content, assignment: e.target.value })
                    }
                    style={{
                      ...inputStyle(isDarkMode),
                      height: "150px",
                      resize: "none",
                    }}
                    placeholder="Describe the project requirements..."
                  />
                </div>

                <button type="submit" disabled={loading} style={submitBtnStyle}>
                  {loading ? (
                    <RefreshCcw className="animate-spin" />
                  ) : (
                    <>
                      <Save size={20} /> SYNC TO LIVE STUDENT NODES
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraryLinks.map((lib, i) => (
              <a
                key={i}
                href={lib.url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "35px",
                    borderRadius: "35px",
                    backgroundColor: isDarkMode ? "#0f172a" : "white",
                    border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
                    height: "100%",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 900,
                      color: "#2563eb",
                      letterSpacing: "2px",
                    }}
                  >
                    {lib.cat}
                  </span>
                  <h3
                    style={{
                      margin: "15px 0",
                      fontSize: "20px",
                      fontWeight: 900,
                      color: isDarkMode ? "white" : "#0f172a",
                    }}
                  >
                    {lib.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "10px",
                      fontWeight: 900,
                      opacity: 0.5,
                      color: isDarkMode ? "white" : "black",
                    }}
                  >
                    VISIT REPO <ExternalLink size={12} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// TERMINAL STYLES (KEEP THESE AT THE BOTTOM)
const navStyle = (active, dark) => ({
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "20px",
  borderRadius: "22px",
  fontWeight: 900,
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  backgroundColor: active ? "#2563eb" : "transparent",
  color: active ? "white" : dark ? "#64748b" : "#94a3b8",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
  transition: "0.3s",
});
const inputStyle = (dark) => ({
  width: "100%",
  padding: "20px",
  borderRadius: "20px",
  border: `2px solid ${dark ? "#1e293b" : "#f1f5f9"}`,
  backgroundColor: dark ? "#020617" : "#f8fafc",
  color: "inherit",
  fontWeight: "bold",
  outline: "none",
  transition: "0.3s",
});
const labelStyle = {
  fontSize: "11px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  marginBottom: "10px",
  display: "block",
  color: "#2563eb",
};
const submitBtnStyle = {
  width: "100%",
  padding: "25px",
  borderRadius: "25px",
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
  gap: "15px",
  boxShadow: "0 15px 30px -10px rgba(37,99,235,0.6)",
};
const bottomBtnStyle = (dark) => ({
  padding: "18px",
  borderRadius: "18px",
  border: `1px solid ${dark ? "#1e293b" : "#e2e8f0"}`,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  fontWeight: 900,
  fontSize: "11px",
  backgroundColor: dark ? "#0f172a" : "white",
  color: dark ? "white" : "#475569",
});

export default AdminContentManager;
