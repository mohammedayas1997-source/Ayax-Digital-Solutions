import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
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
  Trash2,
  History,
} from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deploymentMode, setDeploymentMode] = useState("manual");

  // Curriculum State
  const [weekNum, setWeekNum] = useState(1);
  const [activeTab, setActiveTab] = useState("curriculum");
  const [updateHistory, setUpdateHistory] = useState([]);
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

  // FETCH HISTORY LOGS
  useEffect(() => {
    const q = query(
      collection(db, "deployment_logs"),
      orderBy("timestamp", "desc"),
      limit(10),
    );
    const unsub = onSnapshot(q, (snap) => {
      setUpdateHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("CRITICAL: Terminate Session?")) {
      await signOut(auth);
      navigate("/admin-gateway");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalStartDate =
        deploymentMode === "manual" ? new Date() : new Date(content.startDate);

      const payload = {
        ...content,
        videoId: content.videoUrl,
        startDate: finalStartDate,
        deploymentMode: deploymentMode,
        updatedAt: serverTimestamp(),
      };

      await setDoc(getDocRef(), payload, { merge: true });

      // LOG TO HISTORY
      await addDoc(collection(db, "deployment_logs"), {
        week: weekNum,
        title: content.title,
        mode: deploymentMode,
        timestamp: serverTimestamp(),
        action: "UPDATE/DEPLOY",
      });

      alert(`SUCCESS: Week ${weekNum} is now synced.`);
    } catch (err) {
      alert("SYNC_FAILURE: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeek = async () => {
    if (
      window.confirm(`PERMANENT ACTION: Wipe all data for Week ${weekNum}?`)
    ) {
      setLoading(true);
      try {
        await deleteDoc(getDocRef());
        setContent({
          title: "",
          videoUrl: "",
          pdfUrl: "",
          assignment: "",
          startDate: "",
        });

        await addDoc(collection(db, "deployment_logs"), {
          week: weekNum,
          timestamp: serverTimestamp(),
          action: "DELETE_NODE",
        });

        alert("DELETION_COMPLETE: Week data purged.");
      } catch (err) {
        alert("DELETE_ERROR: " + err.message);
      } finally {
        setLoading(false);
      }
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
        console.error(e);
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
              <span style={{ fontSize: "10px", fontWeight: 900 }}>
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
            onClick={() => setActiveTab("history")}
            style={navStyle(activeTab === "history", isDarkMode)}
          >
            <History size={18} /> Deploy History
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
            <LogOut size={18} /> TERMINATE
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, marginLeft: "300px", padding: "60px" }}>
        {activeTab === "curriculum" && (
          <div className="animate-in fade-in duration-700">
            <header
              style={{
                marginBottom: "50px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: "42px",
                    fontWeight: 900,
                    fontStyle: "italic",
                  }}
                >
                  CURRICULUM <span style={{ color: "#2563eb" }}>NODE</span>
                </h1>
                <div
                  style={{ display: "flex", gap: "15px", marginTop: "20px" }}
                >
                  <button
                    onClick={() => setDeploymentMode("manual")}
                    style={modeBtnStyle(deploymentMode === "manual", "#2563eb")}
                  >
                    <Zap size={16} /> MANUAL PUSH
                  </button>
                  <button
                    onClick={() => setDeploymentMode("auto")}
                    style={modeBtnStyle(deploymentMode === "auto", "#8b5cf6")}
                  >
                    <Timer size={16} /> AUTO SCHEDULE
                  </button>
                </div>
              </div>
              <button
                onClick={handleDeleteWeek}
                style={{
                  ...bottomBtnStyle(false),
                  color: "#dc2626",
                  borderColor: "#dc262610",
                  backgroundColor: "#dc262605",
                }}
              >
                <Trash2 size={18} /> PURGE WEEK {weekNum}
              </button>
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
                  WEEK {weekNum} TERMINAL
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
                  {deploymentMode === "auto" ? (
                    <div>
                      <label style={labelStyle}>Scheduled Release</label>
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
                    <div
                      style={{
                        padding: "20px",
                        backgroundColor: "#2563eb10",
                        borderRadius: "20px",
                        border: "1px dashed #2563eb40",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 900,
                          color: "#2563eb",
                        }}
                      >
                        MANUAL STATUS: LIVE UPON SAVE
                      </p>
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>Module Title</label>
                    <input
                      value={content.title}
                      onChange={(e) =>
                        setContent({ ...content, title: e.target.value })
                      }
                      placeholder="Lesson Name"
                      style={inputStyle(isDarkMode)}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "25px",
                  }}
                >
                  <div>
                    <label style={labelStyle}>YouTube ID</label>
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
                    <label style={labelStyle}>PDF Link</label>
                    <input
                      value={content.pdfUrl}
                      onChange={(e) =>
                        setContent({ ...content, pdfUrl: e.target.value })
                      }
                      placeholder="https://..."
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
                      height: "150px",
                      resize: "none",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...submitBtnStyle,
                    backgroundColor:
                      deploymentMode === "manual" ? "#2563eb" : "#8b5cf6",
                  }}
                >
                  {loading ? (
                    <RefreshCcw className="animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />{" "}
                      {deploymentMode === "manual"
                        ? "DEPLOY INSTANTLY"
                        : "SAVE TO CLOUD SCHEDULE"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="animate-in slide-in-from-right duration-500">
            <h2
              style={{
                fontSize: "32px",
                fontWeight: 900,
                marginBottom: "40px",
              }}
            >
              DEPLOYMENT <span style={{ color: "#2563eb" }}>LOGS</span>
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {updateHistory.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: "25px",
                    borderRadius: "25px",
                    backgroundColor: isDarkMode ? "#0f172a" : "white",
                    border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h4
                      style={{
                        fontWeight: 900,
                        fontSize: "14px",
                        color:
                          log.action === "DELETE_NODE" ? "#dc2626" : "#2563eb",
                      }}
                    >
                      {log.action}
                    </h4>
                    <p style={{ fontSize: "12px", fontWeight: 700 }}>
                      Week {log.week} - {log.title || "No Title"}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: 900,
                        opacity: 0.5,
                      }}
                    >
                      {log.timestamp?.toDate().toLocaleString() || "Syncing..."}
                    </p>
                    <span
                      style={{
                        fontSize: "8px",
                        padding: "4px 8px",
                        backgroundColor: "#2563eb10",
                        borderRadius: "5px",
                        color: "#2563eb",
                        fontWeight: 900,
                      }}
                    >
                      {log.mode?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-6">
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

// TERMINAL STYLES
const navStyle = (active, dark) => ({
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "20px",
  borderRadius: "22px",
  fontWeight: 900,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  backgroundColor: active ? "#2563eb" : "transparent",
  color: active ? "white" : dark ? "#475569" : "#94a3b8",
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
  color: "white",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "2px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "15px",
  boxShadow: "0 15px 30px -10px rgba(0,0,0,0.3)",
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
