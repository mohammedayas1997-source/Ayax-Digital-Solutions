import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  Users,
  BookOpen,
  Send,
  Mail,
  MessageSquare,
  PlusCircle,
  LayoutGrid,
  CheckCircle,
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("inquiries");
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // State for Course Upload
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    category: "Cyber security", // Default category set to first new course
    pdfUrl: "",
  });

  // Fetch Inquiries from Firebase
  useEffect(() => {
    const fetchInquiries = async () => {
      const q = query(
        collection(db, "inquiries"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInquiries(data);
    };
    fetchInquiries();
  }, []);

  // Handle Course Upload
  const handleCourseUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "courses"), {
        ...courseData,
        createdAt: serverTimestamp(),
      });
      alert("Course uploaded successfully!");
      setCourseData({
        title: "",
        description: "",
        videoUrl: "",
        category: "Cyber security",
        pdfUrl: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to upload course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 text-white hidden md:block">
        <h2 className="text-xl font-black mb-10 tracking-tighter text-blue-400">
          AYAX ADMIN
        </h2>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === "inquiries" ? "bg-blue-600" : "hover:bg-gray-800 text-gray-400"}`}
          >
            <Users size={20} /> Inquiries
          </button>
          <button
            onClick={() => setActiveTab("lms")}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition ${activeTab === "lms" ? "bg-blue-600" : "hover:bg-gray-800 text-gray-400"}`}
          >
            <BookOpen size={20} /> Course Manager
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-800 capitalize">
            {activeTab} Panel
          </h1>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm font-bold text-sm border border-gray-200">
            Status: <span className="text-green-500">Live</span>
          </div>
        </header>

        {activeTab === "inquiries" ? (
          /* SECTION 1: INQUIRIES LIST */
          <div className="grid grid-cols-1 gap-6">
            {inquiries.length > 0 ? (
              inquiries.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-gray-900">
                        {item.fullName}
                      </h3>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-black">
                        {item.serviceTier}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <Mail size={14} /> {item.email}
                    </p>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-2xl italic text-sm mt-4 border border-dashed border-gray-200">
                      "{item.message}"
                    </p>
                  </div>
                  <div className="flex flex-col justify-center gap-2">
                    <button className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700">
                      Reply Email
                    </button>
                    <button className="px-6 py-2 border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-500">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 font-bold">No inquiries found yet.</p>
            )}
          </div>
        ) : (
          /* SECTION 2: COURSE UPLOADER (LMS) */
          <div className="max-w-3xl bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <PlusCircle className="text-blue-600" /> Add New Global Lesson
            </h2>
            <form onSubmit={handleCourseUpload} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Lesson Title
                  </label>
                  <input
                    required
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    value={courseData.title}
                    onChange={(e) =>
                      setCourseData({ ...courseData, title: e.target.value })
                    }
                    placeholder="e.g. Intro to UI/UX"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    Category (Select Course)
                  </label>
                  <select
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
                    value={courseData.category}
                    onChange={(e) =>
                      setCourseData({ ...courseData, category: e.target.value })
                    }
                  >
                    <option value="Cyber security">Cyber security</option>
                    <option value="Data Analytics">Data Analytics</option>
                    <option value="Software Engineering">
                      Software Engineering
                    </option>
                    <option value="Artificial Intelligence">
                      Artificial Intelligence
                    </option>
                    <option value="Blockchain Technology">
                      Blockchain Technology
                    </option>
                    <option value="Web development">Web development</option>
                    <option value="advanced Digital Marketing">
                      advanced Digital Marketing
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Video Link (YouTube/Vimeo)
                </label>
                <input
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
                  value={courseData.videoUrl}
                  onChange={(e) =>
                    setCourseData({ ...courseData, videoUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  Lesson Description
                </label>
                <textarea
                  rows="4"
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none font-bold"
                  value={courseData.description}
                  onChange={(e) =>
                    setCourseData({
                      ...courseData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Explain what students will learn..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                {loading ? "Uploading to Global Server..." : "Publish Lesson"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
