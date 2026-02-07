import React, { useState, useEffect } from "react"; // Na kara useState a nan
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "./firebaseConfig";

// --- EXISTING IMPORTS ---
import AboutUs from "./pages/AboutUs";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProjectForm from "./components/ProjectForm";
import CourseEnrollment from "./pages/CourseEnrollment";
import AdminDashboard from "./pages/AdminDashboard2";
import Login from "./pages/Login";
import AuthPortal from "./components/AuthPortal";
import StudentPortal from "./components/StudentPortal";
import ProtectedRoute from "./components/ProtectedRoute";
import LessonPlayer from "./components/LessonPlayer";
import WeeklyForum from "./components/WeeklyForum";
import VerifyCertificate from "./pages/VerifyCertificate";
import Certificate from "./components/Certificate";
import AdminGrading from "./pages/AdminGrading";
import AcademicExam from "./components/AcademicExam";
import AdminQuestionBank from "./pages/AdminQuestionBank";
import SuperAdmin from "./pages/SuperAdmin";

// --- NEW TERMINALS & PAGES ---
import StudentLogin from "./pages/StudentLogin";
import AdminLogin from "./pages/AdminLogin";
import StudentGrades from "./pages/StudentGrades";
import AdminChatManager from "./pages/AdminChatManager";
import AdminCourseList from "./pages/AdminCourseList";
import AdminCourseDashboard from "./pages/AdminCourseDashboard";
import AdminStudentsList from "./pages/AdminStudentsList";
import ForumDetails from "./components/ForumDetails"; // <--- NA KARA WANNAN

// --- ADDED COURSE & PRICING COMPONENTS ---
import CourseSection from "./components/CourseSection";
import PricingCard from "./components/PricingCard";
const midtermQuestions = [
  {
    text: "What is React?",
    options: [
      { text: "Library", isCorrect: true },
      { text: "Language", isCorrect: false },
    ],
  },
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          {/* --- PUBLIC ACCESS PROTOCOLS --- */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/launch-project" element={<ProjectForm />} />
          <Route path="/enroll" element={<CourseEnrollment />} />
          <Route
            path="/portal"
            element={
              <StudentPortal darkMode={darkMode} setDarkMode={setDarkMode} />
            }
          />
          <Route path="/portal" element={<AuthPortal />} />
          <Route
            path="/verify/:certificateId"
            element={<VerifyCertificate />}
          />
          <Route
            path="/portal"
            element={
              <StudentPortal darkMode={darkMode} setDarkMode={setDarkMode} />
            }
          />
          <Route
            path="/forum/thread/:threadId"
            element={<ForumDetails darkMode={darkMode} />}
          />
          <Route path="/courses" element={<CourseSection />} />
          <Route path="/pricing" element={<PricingCard />} />

          {/* --- AUTHENTICATION TERMINALS --- */}
          <Route path="/portal" element={<AuthPortal />} />
          <Route path="/login" element={<StudentLogin />} />

          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-gateway" element={<AdminLogin />} />

          {/* Super Admin Route */}
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <SuperAdmin />
              </ProtectedRoute>
            }
          />

          {/* --- STUDENT SECURE INFRASTRUCTURE --- */}

          {/* FIXED: Muna amfani da /student-portal a matsayin main dashboard din dalibi */}
          <Route
            path="/student-portal"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentPortal />
              </ProtectedRoute>
            }
          />

          {/* ADDED: Wannan redirect ne idan wani ya tafi /dashboard direct */}
          <Route
            path="/dashboard"
            element={<Navigate to="/student-portal" replace />}
          />

          <Route
            path="/course/:courseId/grades"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentGrades />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lesson/:lessonId"
            element={
              <ProtectedRoute requiredRole="student">
                <LessonPlayer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:courseId/forum/week/:weekId"
            element={
              <ProtectedRoute requiredRole="student">
                <WeeklyForum />
              </ProtectedRoute>
            }
          />

          <Route
            path="/course/:courseId/exam/week/:weekId"
            element={
              <ProtectedRoute requiredRole="student">
                <AcademicExam questions={midtermQuestions} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificate/:courseId"
            element={
              <ProtectedRoute requiredRole="student">
                <Certificate
                  studentName={auth.currentUser?.displayName || "Student"}
                  courseName="Full Stack Web Development"
                  dateCompleted={new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  certificateId={`AYX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`}
                />
              </ProtectedRoute>
            }
          />

          {/* --- ADMIN SECURE INFRASTRUCTURE --- */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <SuperAdmin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminCourseList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard/:courseId"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminCourseDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/students/:courseId"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminStudentsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/grading"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminGrading />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/grading/:courseId"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminGrading />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminQuestionBank />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/questions/:courseId"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminQuestionBank />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/chat/:courseId"
            element={
              <ProtectedRoute requiredRole="super-admin">
                <AdminChatManager />
              </ProtectedRoute>
            }
          />

          {/* --- SYSTEM CATCH-ALL --- */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
