import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Book, Settings, PlusCircle, LayoutDashboard, Trash2 } from 'lucide-react';

const AdminCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      // Muna dauko ID din asali daga doc.id
      setCourses(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // --- DELETE FUNCTION (BONUS) ---
  const deleteCourse = async (courseId, title) => {
    if (window.confirm(`Shin kana da tabbacin kana son goge ${title}? Wannan zai goge komai na kwas din nan.`)) {
      try {
        await deleteDoc(doc(db, "courses", courseId));
        setCourses(courses.filter(c => c.id !== courseId));
        alert("An goge kwas din nasara!");
      } catch (e) {
        alert("An samu matsala wajen gogewa.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mb-4 rotate-45"></div>
          <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]">Accessing Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter leading-none">
              University <br/> <span className="text-blue-600">Catalog</span>
            </h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-4">
              Curriculum & Academic Control Center
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/admin/dashboard')} // Ko ina kake da form din kara kwas
            className="flex items-center gap-3 bg-gray-900 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-2xl active:scale-95"
          >
            <PlusCircle size={18} /> Add New Entry
          </button>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white p-20 rounded-[4rem] text-center border-2 border-dashed border-gray-100">
            <Book size={48} className="mx-auto text-gray-200 mb-6" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No active courses found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {courses.map(course => (
              <div key={course.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all group relative">
                
                {/* Delete Icon - Hidden by default */}
                <button 
                  onClick={() => deleteCourse(course.id, course.title)}
                  className="absolute top-8 right-8 text-gray-200 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>

                <div className="w-20 h-20 bg-gray-50 text-gray-900 rounded-[2rem] flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                  <Book size={32} />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-3 leading-tight uppercase tracking-tighter">
                  {course.title || "Untitled"}
                </h3>
                <p className="text-blue-600 font-black text-[10px] mb-10 uppercase tracking-[0.3em]">
                  {course.category || "General Studies"}
                </p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate(`/admin/grading/${course.id}`)}
                    className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    Grading Center <Settings size={14} />
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/admin/questions/${course.id}`)}
                    className="w-full py-5 border-2 border-gray-50 text-gray-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:border-blue-100 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    Question Bank <LayoutDashboard size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourseList;