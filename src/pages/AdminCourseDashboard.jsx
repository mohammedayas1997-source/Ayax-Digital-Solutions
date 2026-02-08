import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  Users,
  HelpCircle,
  FileText,
  ChevronLeft,
  Bell,
  MessageSquare,
} from "lucide-react";

const AdminCourseDashboard = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, pendingExams: 0 });
  const [loading, setLoading] = useState(true);

  // Course Reference List:
  // Cyber security, Data Analytics, Software Engineering, Artificial Intelligence,
  // Blockchain Technology, Web development, advanced Digital Marketing

  useEffect(() => {
    if (!courseId) return;

    // 1. Live Listener for Enrollments
    const enrollQuery = query(
      collection(db, "enrollments"),
      where("courseId", "==", courseId),
    );
    const unsubEnroll = onSnapshot(
      enrollQuery,
      (snap) => {
        setStats((prev) => ({ ...prev, students: snap.size }));
        setLoading(false);
      },
      (error) => console.error("Enrollment Listener Error:", error),
    );

    // 2. Live Listener for Pending Submissions
    const examQuery = query(
      collection(db, "submissions"),
      where("courseId", "==", courseId),
      where("graded", "==", false),
    );
    const unsubExams = onSnapshot(
      examQuery,
      (snap) => {
        setStats((prev) => ({ ...prev, pendingExams: snap.size }));
      },
      (error) => console.error("Exam Listener Error:", error),
    );

    // Cleanup listeners on unmount
    return () => {
      unsubEnroll();
      unsubExams();
    };
  }, [courseId]);

  const menuItems = [
    {
      name: "Questions Bank",
      icon: <HelpCircle size={20} />,
      path: `/admin/questions/${courseId}`,
    },
    {
      name: "Student Grading",
      icon: <FileText size={20} />,
      path: `/admin/grading/${courseId}`,
    },
    {
      name: "Enrolled Students",
      icon: <Users size={20} />,
      path: `/admin/students/${courseId}`,
    },
    {
      name: "Course Chat",
      icon: <MessageSquare size={20} />,
      path: `/admin/chat/${courseId}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-100 p-8 flex flex-col hidden lg:flex">
        <div
          className="flex items-center gap-2 mb-10 cursor-pointer text-gray-400 hover:text-blue-600 transition-all group"
          onClick={() => navigate("/admin/courses")}
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-black text-[10px] uppercase tracking-widest">
            Back to Courses
          </span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-10 italic tracking-tighter">
          AYAX <span className="text-blue-600">ADMIN</span>
        </h1>

        <nav className="space-y-2 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all group"
            >
              <span className="group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-6 bg-gray-50 rounded-[2rem] mt-auto border border-gray-100">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
            Active Context
          </p>
          <p className="text-sm font-black text-gray-800 truncate uppercase">
            {courseId?.replace(/-/g, " ")}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12">
        <header className="mb-12 flex justify-between items-start md:items-end">
          <div>
            <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] mb-2">
              Management Suite
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 capitalize tracking-tighter">
              {courseId?.replace(/-/g, " ")}
            </h2>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-600 cursor-pointer transition-all">
              <Bell size={20} />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stats Card 1: Students */}
          <div className="bg-blue-600 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <Users className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold opacity-80 mb-1">
              Enrolled Students
            </h3>
            <p className="text-7xl font-black tracking-tighter">
              {loading ? "---" : stats.students}
            </p>
            <button
              onClick={() => navigate(`/admin/students/${courseId}`)}
              className="mt-8 bg-white/20 hover:bg-white text-white hover:text-blue-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              View Roster
            </button>
          </div>

          {/* Stats Card 2: Exams */}
          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
            <FileText className="absolute -right-4 -bottom-4 w-40 h-40 text-gray-50 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black text-gray-900 mb-1">
              Grading Queue
            </h3>
            <p className="text-7xl font-black text-blue-600 tracking-tighter">
              {loading ? "---" : stats.pendingExams}
            </p>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">
              Unmarked Submissions
            </p>
            <button
              onClick={() => navigate(`/admin/grading/${courseId}`)}
              className="mt-8 bg-gray-900 text-white hover:bg-blue-600 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              Start Grading
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all flex flex-col items-center gap-3 text-center"
              >
                <div className="text-blue-600 bg-blue-50 p-3 rounded-xl">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black uppercase text-gray-700">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCourseDashboard;
