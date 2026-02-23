import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  ChevronLeft,
  Search,
  Mail,
  Award,
  UserCheck,
  UserMinus,
  ShieldCheck,
  Eye,
  Trash2,
  Hash,
  X,
  MessageCircle,
  Send,
} from "lucide-react";

const AdminStudentsList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "enrollments"),
        where("courseId", "==", courseId),
      );
      const querySnapshot = await getDocs(q);
      const studentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentList);
    } catch (error) {
      console.error("🔥 Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  // 1. Bayar da ID Number
  const handleAssignID = async (studentId) => {
    const idNo = prompt("Enter Student ID Number:");
    if (!idNo) return;
    try {
      await updateDoc(doc(db, "enrollments", studentId), { studentIdNo: idNo });
      alert("ID Assigned Successfully!");
      fetchStudents();
    } catch (err) {
      alert("Error assigning ID");
    }
  };

  // 2. Tura Sakon WhatsApp (Automation)
  const sendWhatsAppNotification = (student) => {
    if (!student.studentPhone || !student.studentIdNo) {
      alert("Error: Student phone or ID Number is missing!");
      return;
    }
    const phoneNumber = student.studentPhone.replace(/\s+/g, ""); // Cire sarari
    const message = `Sannu ${student.studentName}, daga AYAX Academy. An kammala tantance ka. Sabon ID Number dinka shine: *${student.studentIdNo}*. Zaka iya amfani dashi wajen shiga portal dinka. Barka da karatu!`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // 3. Goge Dalibi
  const handleDeleteStudent = async (studentId, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDoc(doc(db, "enrollments", studentId));
        alert("Student Deleted!");
        fetchStudents();
      } catch (err) {
        alert("Error deleting student");
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
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
              Course:{" "}
              <span className="text-blue-600">
                {courseId?.replace(/-/g, " ")}
              </span>
              <span className="bg-gray-200 w-1 h-1 rounded-full"></span>
              Count:{" "}
              <span className="text-gray-900">{filteredStudents.length}</span>
            </p>
          </div>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm font-bold text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              Syncing Records...
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-100">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Student Identity
                  </th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    ID Number
                  </th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">
                    Action Panel
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-blue-50/30 transition-all group"
                  >
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black">
                          {student.studentName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase text-sm">
                            {student.studentName}
                          </p>
                          <p className="text-[11px] text-gray-400 font-bold lowercase">
                            {student.studentEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="font-mono font-black text-blue-600 text-sm">
                        {student.studentIdNo || "NOT ASSIGNED"}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="p-3 bg-gray-50 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAssignID(student.id)}
                          className="p-3 bg-gray-50 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Assign ID"
                        >
                          <Hash size={16} />
                        </button>
                        <button
                          onClick={() => sendWhatsAppNotification(student)}
                          className="p-3 bg-gray-50 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Send WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteStudent(student.id, student.studentName)
                          }
                          className="p-3 bg-gray-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 relative">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-6 right-6 text-gray-400 hover:text-red-600"
              >
                <X size={32} />
              </button>
              <h3 className="text-2xl font-black uppercase mb-6">
                Enrollment Form Data
              </h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Student Name
                  </p>
                  <p className="font-bold text-gray-800">
                    {selectedStudent.studentName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Email
                  </p>
                  <p className="font-bold text-gray-800">
                    {selectedStudent.studentEmail}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Phone
                  </p>
                  <p className="font-bold text-gray-800">
                    {selectedStudent.studentPhone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Course
                  </p>
                  <p className="font-bold text-blue-600 uppercase">
                    {selectedStudent.courseId}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    Address
                  </p>
                  <p className="font-bold text-gray-800">
                    {selectedStudent.address || "No Address Provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudentsList;
