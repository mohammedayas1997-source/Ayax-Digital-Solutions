import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
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
  Link as LinkIcon,
  AlertOctagon,
} from "lucide-react";

// 1. STYLING COMPONENTS (HOISTED)
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

  const [deploymentMode, setDeploymentMode] = useState("scheduled");

  const [selectedCourse, setSelectedCourse] = useState("web_dev");
  const [weekNum, setWeekNum] = useState(1);
  const [activeTab, setActiveTab] = useState("curriculum");
  const [updateHistory, setUpdateHistory] = useState([]);

  const [content, setContent] = useState({
    title: "",
    videoUrl: "",
    pdfNode: "",
    assignment: "",
    startDate: "",
    examRules:
      "1. No external resources.\n2. 60 Minutes duration.\n3. One attempt only.",
  });

  const [examData, setExamData] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      correctAnswer: "A",
    })),
  );

  const availableCourses = [
    { id: "cyber_security", name: "Cyber Security" },
    { id: "data_analytics", name: "Data Analytics" },
    { id: "software_eng", name: "Software Engineering" },
    { id: "ai_tech", name: "Artificial Intelligence" },
    { id: "blockchain", name: "Blockchain Technology" },
    { id: "web_dev", name: "Web Development" },
    { id: "digital_marketing", name: "Digital Marketing" },
  ];

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

  const extractVideoID = (url) => {
    if (!url) return "";
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[7].length === 11) return match[7];
    const shortsMatch = url.match(/shorts\/([a-zA-Z0-9_-]{11})/);
    return shortsMatch ? shortsMatch[1] : url;
  };

  const getDocRef = () =>
    doc(db, "course_settings", `${selectedCourse}_week_${weekNum}`);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

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

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const isExamWeek = weekNum === 12 || weekNum === 24;

      const payload = {
        title: content.title || (isExamWeek ? "Official Examination" : ""),
        startDate: new Date(content.startDate), // Scheduled Unlock Time
        updatedAt: serverTimestamp(),
        videoId: isExamWeek ? null : extractVideoID(content.videoUrl),
        pdfNode: isExamWeek ? null : content.pdfNode,
        assignment: isExamWeek ? null : content.assignment,
        exams: isExamWeek ? examData : null,
        examRules: isExamWeek ? content.examRules : null,
        durationMinutes: isExamWeek ? 60 : null,
      };

      await setDoc(getDocRef(), payload, { merge: true });
      await addDoc(collection(db, "deployment_logs"), {
        week: weekNum,
        course: selectedCourse,
        title: content.title || (isExamWeek ? "EXAM" : "SYNC"),
        mode: "scheduled",
        timestamp: serverTimestamp(),
        action: isExamWeek ? "EXAM_DEPLOY" : "SYNC_COMPLETE",
      });

      setLoading(false);
      alert(
        isExamWeek
          ? "EXAM SCHEDULED: Access will open at set time."
          : "CONTENT SCHEDULED: Success.",
      );
      navigate("/student-portal");
    } catch (err) {
      setLoading(false);
      alert("SYNC_FAILURE: " + err.message);
    }
  };

  const updateExamQuestion = (index, field, value) => {
    const newData = [...examData];
    newData[index][field] = value;
    setExamData(newData);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentContent = async () => {
      try {
        const snap = await getDoc(getDocRef());
        if (isMounted && snap.exists()) {
          const data = snap.data();
          setContent({
            ...data,
            startDate: data.startDate?.toDate
              ? data.startDate.toDate().toISOString().slice(0, 16)
              : data.startDate || "",
            examRules:
              data.examRules ||
              "1. No external resources.\n2. 60 Minutes duration.\n3. One attempt only.",
          });
          if (data.exams) {
            const loadedExams = [...data.exams];
            while (loadedExams.length < 50) {
              loadedExams.push({
                id: loadedExams.length + 1,
                question: "",
                optionA: "",
                optionB: "",
                optionC: "",
                correctAnswer: "A",
              });
            }
            setExamData(loadedExams);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCurrentContent();
    return () => {
      isMounted = false;
    };
  }, [weekNum, selectedCourse]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#020617" : "#f8fafc",
        color: isDarkMode ? "white" : "#0f172a",
        transition: "0.3s",
      }}
    >
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
                SYSTEM CLOCK
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
            style={bottomBtnStyle(isDarkMode)}
          >
            {isDarkMode ? (
              <Sun size={18} color="#eab308" />
            ) : (
              <Moon size={18} color="#2563eb" />
            )}{" "}
            {isDarkMode ? "SPECTRUM: LIGHT" : "SPECTRUM: DARK"}
          </button>
          <button
            onClick={() => signOut(auth).then(() => navigate("/admin-gateway"))}
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
              <h1
                style={{
                  fontSize: "42px",
                  fontWeight: 900,
                  fontStyle: "italic",
                }}
              >
                {weekNum === 12 || weekNum === 24 ? "EXAM" : "CURRICULUM"}{" "}
                <span style={{ color: "#2563eb" }}>NODE</span>
              </h1>
            </header>

            <div
              style={{
                maxWidth: "900px",
                backgroundColor: isDarkMode ? "#0f172a" : "white",
                padding: "50px",
                borderRadius: "40px",
                border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
                boxShadow: "0 40px 80px -20px rgba(0,0,0,0.2)",
              }}
            >
              {/* UMURNI: Set time for EVERY week including 12 and 24 */}
              <div
                style={{
                  marginBottom: "40px",
                  padding: "25px",
                  borderRadius: "25px",
                  backgroundColor: "#2563eb10",
                  border: "2px solid #2563eb20",
                }}
              >
                <label style={labelStyle}>
                  <Calendar
                    size={14}
                    style={{ display: "inline", marginRight: "8px" }}
                  />{" "}
                  Set Global Unlock Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={content.startDate}
                  onChange={(e) =>
                    setContent({ ...content, startDate: e.target.value })
                  }
                  style={inputStyle(isDarkMode)}
                  required
                />
                <p
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    marginTop: "10px",
                    opacity: 0.6,
                  }}
                >
                  Warning: Week {weekNum} will remain locked until this precise
                  time.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "25px",
                  marginBottom: "40px",
                }}
              >
                <div>
                  <label style={labelStyle}>Target Specialization</label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    style={inputStyle(isDarkMode)}
                  >
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Target Week</label>
                  <select
                    value={weekNum}
                    onChange={(e) => setWeekNum(Number(e.target.value))}
                    style={inputStyle(isDarkMode)}
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        WEEK {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <form
                onSubmit={handleUpdate}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "25px",
                }}
              >
                {weekNum === 12 || weekNum === 24 ? (
                  <div
                    style={{
                      padding: "30px",
                      borderRadius: "25px",
                      backgroundColor: "#dc262605",
                      border: "2px solid #dc262620",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "20px",
                      }}
                    >
                      <AlertOctagon color="#dc2626" />
                      <h3
                        style={{
                          ...labelStyle,
                          color: "#dc2626",
                          marginBottom: 0,
                        }}
                      >
                        SECURE EXAM PROTOCOL (50 QUESTIONS / 1 HOUR)
                      </h3>
                    </div>
                    <label style={labelStyle}>Exam Instructions (Rules)</label>
                    <textarea
                      value={content.examRules}
                      onChange={(e) =>
                        setContent({ ...content, examRules: e.target.value })
                      }
                      style={{
                        ...inputStyle(isDarkMode),
                        height: "100px",
                        marginBottom: "20px",
                        border: "1px dashed #dc262640",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "30px",
                        maxHeight: "600px",
                        overflowY: "auto",
                        paddingRight: "10px",
                      }}
                    >
                      {examData.map((ex, index) => (
                        <div
                          key={ex.id}
                          style={{
                            borderBottom: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
                            paddingBottom: "20px",
                          }}
                        >
                          <label style={labelStyle}>Question {ex.id}</label>
                          <input
                            value={ex.question}
                            onChange={(e) =>
                              updateExamQuestion(
                                index,
                                "question",
                                e.target.value,
                              )
                            }
                            placeholder="Type question..."
                            style={{
                              ...inputStyle(isDarkMode),
                              marginBottom: "10px",
                            }}
                          />
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr 1fr",
                              gap: "10px",
                            }}
                          >
                            <input
                              value={ex.optionA}
                              onChange={(e) =>
                                updateExamQuestion(
                                  index,
                                  "optionA",
                                  e.target.value,
                                )
                              }
                              placeholder="A"
                              style={inputStyle(isDarkMode)}
                            />
                            <input
                              value={ex.optionB}
                              onChange={(e) =>
                                updateExamQuestion(
                                  index,
                                  "optionB",
                                  e.target.value,
                                )
                              }
                              placeholder="B"
                              style={inputStyle(isDarkMode)}
                            />
                            <input
                              value={ex.optionC}
                              onChange={(e) =>
                                updateExamQuestion(
                                  index,
                                  "optionC",
                                  e.target.value,
                                )
                              }
                              placeholder="C"
                              style={inputStyle(isDarkMode)}
                            />
                          </div>
                          <select
                            value={ex.correctAnswer}
                            onChange={(e) =>
                              updateExamQuestion(
                                index,
                                "correctAnswer",
                                e.target.value,
                              )
                            }
                            style={{
                              ...inputStyle(isDarkMode),
                              marginTop: "10px",
                              color: "#2563eb",
                            }}
                          >
                            <option value="A">Correct: Option A</option>
                            <option value="B">Correct: Option B</option>
                            <option value="C">Correct: Option C</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "25px",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>Module Title</label>
                        <input
                          value={content.title}
                          onChange={(e) =>
                            setContent({ ...content, title: e.target.value })
                          }
                          style={inputStyle(isDarkMode)}
                          required
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>YouTube Link/ID</label>
                        <input
                          value={content.videoUrl}
                          onChange={(e) =>
                            setContent({ ...content, videoUrl: e.target.value })
                          }
                          style={inputStyle(isDarkMode)}
                        />
                      </div>
                    </div>
                    <div>
                      {/* UMURNI: PDF Secure link entry */}
                      <label style={labelStyle}>
                        <FileText
                          size={14}
                          style={{ display: "inline", marginRight: "8px" }}
                        />{" "}
                        Secure PDF Resource Node (URL)
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          value={content.pdfNode}
                          onChange={(e) =>
                            setContent({ ...content, pdfNode: e.target.value })
                          }
                          placeholder="Paste Secure PDF Storage Link"
                          style={{
                            ...inputStyle(isDarkMode),
                            paddingLeft: "50px",
                          }}
                        />
                        <LinkIcon
                          size={18}
                          style={{
                            position: "absolute",
                            left: "20px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            opacity: 0.5,
                          }}
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
                        style={{ ...inputStyle(isDarkMode), height: "120px" }}
                      />
                    </div>
                  </>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...submitBtnStyle,
                    backgroundColor:
                      weekNum === 12 || weekNum === 24 ? "#dc2626" : "#2563eb",
                  }}
                >
                  {loading ? (
                    <RefreshCcw className="animate-spin" />
                  ) : (
                    "SYNC TO PRODUCTION"
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
              SYSTEM <span style={{ color: "#2563eb" }}>LOGS</span>
            </h2>
            {updateHistory.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: "25px",
                  borderRadius: "25px",
                  backgroundColor: isDarkMode ? "#0f172a" : "white",
                  border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
                  marginBottom: "15px",
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
                      color: "#2563eb",
                    }}
                  >
                    {log.action}
                  </h4>
                  <p style={{ fontSize: "12px", fontWeight: 700 }}>
                    {log.course?.toUpperCase()} | Week {log.week} - {log.title}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{ fontSize: "10px", fontWeight: 900, opacity: 0.5 }}
                  >
                    {log.timestamp?.toDate().toLocaleString() || "..."}
                  </p>
                </div>
              </div>
            ))}
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
                    VISIT REPOSITORY <ExternalLink size={12} />
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

// PRESERVED STYLES
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
  color: "white",
  backgroundColor: "#2563eb",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "2px",
  cursor: "pointer",
  boxShadow: "0 15px 30px -10px rgba(0,0,0,0.4)",
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
