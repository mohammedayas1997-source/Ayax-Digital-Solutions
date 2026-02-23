import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
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
} from "lucide-react";

const AdminStudentsList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);

    // REAL-TIME LISTENER: Listen for new enrollments instantly
    const q = query(
      collection(db, "enrollments"),
      where("courseId", "==", courseId),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const studentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentList);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [courseId]);

  // ID Assignment Logic
  const handleAssignID = async (studentId) => {
    const idNo = prompt("Enter Student ID Number:");
    if (!idNo) return;
    try {
      await updateDoc(doc(db, "enrollments", studentId), {
        studentIdNo: idNo,
        status: "Admitted",
      });
      alert("ID Assigned Successfully!");
    } catch (err) {
      alert("Error updating record");
    }
  };

  // WhatsApp Notification Logic
  const sendWhatsAppNotification = (student) => {
    if (!student.studentPhone || !student.studentIdNo) {
      alert("Missing Phone Number or ID Number!");
      return;
    }
    const message = `Hello ${student.studentName}, your enrollment at AYAX Academy is confirmed. Your Student ID is: *${student.studentIdNo}*. You can now use this to access your portal.`;
    window.open(
      `https://wa.me/${student.studentPhone.replace(/\s+/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  // Delete Logic
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await deleteDoc(doc(db, "enrollments", id));
      } catch (err) {
        alert("Delete failed");
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-4 uppercase text-[10px] tracking-widest"
            >
              <ChevronLeft size={20} /> Back to Dashboard
            </button>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
              Student Registry
            </h2>
            <p className="text-gray-400 font-bold text-xs uppercase mt-2">
              Course ID: <span className="text-blue-600">{courseId}</span>
              <span className="mx-3 opacity-20">|</span>
              Total Records: {filteredStudents.length}
            </p>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search registry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl w-full md:w-80 outline-none focus:ring-2 focus:ring-blue-600 shadow-sm font-bold text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-40 uppercase font-black text-gray-300 tracking-[0.5em]">
            Synchronizing Registry...
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="p-8">Student Identity</th>
                  <th className="p-8">Assigned ID</th>
                  <th className="p-8 text-right">Registry Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-blue-50/50 transition-all"
                  >
                    <td className="p-8 font-black uppercase text-sm text-gray-800">
                      {student.studentName}
                    </td>
                    <td className="p-8 font-mono text-blue-600 font-black">
                      {student.studentIdNo || "PENDING"}
                    </td>
                    <td className="p-8 text-right flex justify-end gap-3">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="p-3 bg-gray-50 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleAssignID(student.id)}
                        className="p-3 bg-gray-50 text-emerald-500 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <Hash size={18} />
                      </button>
                      <button
                        onClick={() => sendWhatsAppNotification(student)}
                        className="p-3 bg-gray-50 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                      >
                        <MessageCircle size={18} />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(student.id, student.studentName)
                        }
                        className="p-3 bg-gray-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STUDENT DATA MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl p-12 relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-8 right-8 text-gray-300 hover:text-red-600"
            >
              <X size={32} />
            </button>
            <h3 className="text-2xl font-black uppercase mb-8 text-gray-900 border-b pb-4">
              Full Enrollment Data
            </h3>
            <div className="grid grid-cols-2 gap-8 font-bold">
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-1">
                  Legal Name
                </p>
                {selectedStudent.studentName}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-1">
                  Email Address
                </p>
                {selectedStudent.studentEmail}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-1">
                  Contact Number
                </p>
                {selectedStudent.studentPhone}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase mb-1">
                  Enrolled Course
                </p>
                {selectedStudent.courseId}
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-gray-400 uppercase mb-1">
                  Residential Address
                </p>
                {selectedStudent.address || "No address provided"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsList;
