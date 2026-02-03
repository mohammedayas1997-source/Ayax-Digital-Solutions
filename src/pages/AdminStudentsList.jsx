import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ChevronLeft, Search, Mail, Award, UserCheck, UserMinus, ShieldCheck } from 'lucide-react';

const AdminStudentsList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        // Query don kwas din da aka zaba
        const q = query(collection(db, "enrollments"), where("courseId", "==", courseId));
        const querySnapshot = await getDocs(q);
        
        const studentList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setStudents(studentList);
      } catch (error) {
        console.error("🔥 Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId]);

  // Tace dalibai (Filter)
  const filteredStudents = students.filter(student =>
    student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-4 transition-all uppercase text-[10px] tracking-widest"
            >
              <ChevronLeft size={20} /> Back to Dashboard
            </button>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
              Enrolled Students
            </h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
              Course: <span className="text-blue-600">{courseId?.replace(/-/g, ' ')}</span>
              <span className="bg-gray-200 w-1 h-1 rounded-full"></span>
              Count: <span className="text-gray-900">{filteredStudents.length}</span>
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm font-bold text-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Database...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-100">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Student Identity</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Enrollment Date</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-inner">
                            {student.studentName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 uppercase text-sm tracking-tight">{student.studentName}</p>
                            <p className="text-[11px] text-gray-400 font-bold lowercase italic">{student.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-700 text-sm">
                                {student.enrolledAt?.toDate ? 
                                 student.enrolledAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                 : "Date Unknown"}
                            </span>
                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">Official Entry</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 inline-flex items-center gap-2">
                          <ShieldCheck size={12} /> Active Learner
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="flex gap-2 justify-end">
                          <a 
                            href={`mailto:${student.studentEmail}`}
                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Send Email"
                          >
                            <Mail size={16} />
                          </a>
                          <button 
                            onClick={() => navigate(`/admin/grading/${courseId}/${student.studentId}`)}
                            className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                            title="Grade Assignments"
                          >
                            <Award size={16} />
                          </button>
                          <button 
                             className="p-3 bg-gray-50 text-red-300 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                             title="Suspend Access"
                          >
                            <UserMinus size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-24 text-center">
                      <div className="flex flex-col items-center">
                        <UserCheck size={48} className="text-gray-100 mb-4" />
                        <p className="text-gray-400 font-black uppercase text-xs tracking-[0.3em]">
                          No records match your search.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentsList;