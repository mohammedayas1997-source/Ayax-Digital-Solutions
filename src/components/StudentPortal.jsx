import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig'; 
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  GraduationCap, 
  LayoutDashboard, 
  MessageSquare, 
  Bell, 
  UserCircle, 
  PlayCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  Lock,
  Award
} from 'lucide-react';

const StudentPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbCourses, setDbCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [hasPassedMidterm, setHasPassedMidterm] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);

  const totalWeeks = 24; 
  const courseStartDate = "2026-01-01"; 

  useEffect(() => {
    const calculateProgress = () => {
      const start = new Date(courseStartDate);
      const now = new Date();
      const diffTime = now - start;
      const weekCount = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
      setCurrentWeek(weekCount > totalWeeks ? totalWeeks : (weekCount < 1 ? 1 : weekCount));
    };

    const checkExamStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        // Dubawa idan dalibin ya ci jarabawar Midterm ta Week 12
        const examRef = doc(db, `students/${user.uid}/exams/global-course_midterm`);
        const examSnap = await getDoc(examRef);
        if (examSnap.exists() && examSnap.data().status === 'passed') {
          setHasPassedMidterm(true);
        }
      }
    };

    calculateProgress();
    checkExamStatus();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbCourses(data);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Misalan darussan da aka riga aka yi (Static)
  const myCourses = [
    { id: 's1', title: "Introduction to Computer Science", instructor: "Dr. Ayax", progress: 65, category: "Tech" },
    { id: 's2', title: "Digital Marketing Masterclass", instructor: "Prof. Sarah", progress: 20, category: "Business" },
  ];

  const allCourses = [...dbCourses, ...myCourses];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-85 bg-white border-r border-gray-100 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">AYAX <span className="text-gray-900 not-italic">UNI</span></h1>
        </div>
        
        <nav className="px-4 space-y-1">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20}/> },
            { id: 'courses', name: 'My Courses', icon: <BookOpen size={20}/> },
            { id: 'discussions', name: 'Forums', icon: <MessageSquare size={20}/> },
            { id: 'grades', name: 'Grades', icon: <GraduationCap size={20}/> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        {/* 24-WEEK TIMELINE */}
        <div className="mt-8 px-4 flex-grow overflow-y-auto custom-scrollbar">
           <h3 className="px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Academic Roadmap</h3>
           <div className="space-y-1 pb-10">
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
                let isLocked = week > currentWeek;
                if (week > 12 && !hasPassedMidterm) isLocked = true;
                const isExamWeek = week === 12 || week === 24;

                return (
                  <div 
                    key={week}
                    onClick={() => {
                      if (!isLocked) {
                        if (week === 12) navigate(`/course/global-course/exam/week/12`);
                        else if (week === 24) navigate(`/course/global-course/exam/week/24`);
                        else navigate(`/course/global-course/forum/week/${week}`);
                      }
                    }}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${
                      isLocked ? 'opacity-30 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer group'
                    } ${week === 12 && !hasPassedMidterm ? 'bg-orange-50 border border-orange-100' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors ${
                        isLocked ? 'bg-gray-100 text-gray-400' : isExamWeek ? 'bg-orange-500 text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                      }`}>
                        {week}
                      </div>
                      <span className={`text-xs font-black uppercase tracking-tight ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                        Week {week} {isExamWeek && <span className="ml-1 text-orange-600 underline">Exam</span>}
                      </span>
                    </div>
                    {isLocked ? <Lock size={12} className="text-gray-300" /> : <ChevronRight size={12} className="text-blue-200" />}
                  </div>
                );
              })}
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Welcome back! 👋</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              Current Session: Week {currentWeek} <span className="mx-2 text-gray-200">|</span> Semester Progress: {Math.round((currentWeek/totalWeeks)*100)}%
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">A</div>
              <span className="font-black text-[10px] uppercase tracking-widest text-gray-800">Mohammed Ayax</span>
            </div>
          </div>
        </header>

        {/* MIDTERM ALERT BLOCK */}
        {currentWeek >= 12 && !hasPassedMidterm && (
          <div className="mb-12 p-10 bg-orange-600 rounded-[3.5rem] text-white flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-orange-100 relative overflow-hidden">
            <Award className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 rotate-12" />
            <div className="relative z-10 space-y-2">
               <h3 className="text-3xl font-black italic tracking-tighter uppercase">Midterm Barrier</h3>
               <p className="font-bold text-orange-100 max-w-md text-sm leading-relaxed">
                 You've reached Week 12. Weeks 13-24 are strictly locked until you pass the Midterm Assessment.
               </p>
            </div>
            <button 
              onClick={() => navigate('/course/global-course/exam/week/12')} 
              className="relative z-10 mt-6 md:mt-0 px-12 py-5 bg-white text-orange-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-2xl transition-all active:scale-95"
            >
              Take Exam Now
            </button>
          </div>
        )}

        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8">Academic Enrollment</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {loading ? (
            <div className="col-span-full h-64 flex items-center justify-center bg-white rounded-[3rem] border border-gray-100 border-dashed">
               <p className="text-blue-600 font-black animate-pulse uppercase text-xs tracking-widest">Accessing University Databases...</p>
            </div>
          ) : (
            allCourses.map((course) => (
              <div key={course.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 group hover:shadow-2xl hover:shadow-blue-50 transition-all duration-500">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-gray-900 text-white rounded-2xl group-hover:bg-blue-600 transition-colors shadow-lg shadow-gray-100">
                    <PlayCircle size={24} />
                  </div>
                  <span className="text-[9px] font-black px-4 py-2 bg-blue-50 text-blue-600 rounded-full uppercase tracking-[0.1em]">
                    {course.category || "Active"}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight h-14">{course.title || course.name}</h3>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-8 italic">Mentor: {course.instructor || "Ayax Admin"}</p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-gray-300">Retention</span>
                    <span className="text-blue-600">{course.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                      style={{ width: `${course.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/lesson/${course.id}`)}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group-hover:bg-blue-600 transition-all shadow-xl shadow-gray-100 group-hover:shadow-blue-100"
                >
                  Enter Classroom <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 flex flex-col justify-between items-start">
              <div>
                <h4 className="text-2xl font-black text-gray-900 mb-2 tracking-tighter">Academic Verification</h4>
                <p className="text-gray-400 font-bold text-sm mb-8 leading-relaxed">View your official grades and downloaded graded assignments from instructors.</p>
              </div>
              <button 
                onClick={() => navigate(`/grades`)}
                className="px-8 py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                Open Gradebook
              </button>
           </div>

           <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white relative overflow-hidden group">
              <MessageSquare className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <h4 className="text-2xl font-black mb-2 tracking-tighter italic">Global Research Forum</h4>
                <p className="text-gray-500 font-bold text-sm mb-8 leading-relaxed">Collaborate with over 5,000 students on the latest AI & Ethics discussion.</p>
                <button className="px-10 py-4 bg-white text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-400 transition-all shadow-xl">
                  Join Discussion
                </button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default StudentPortal;