import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { auth } from "./firebaseConfig";
import AdminEmailPortal from "./components/AdminEmailPortal";

// --- EXISTING IMPORTS ---
import AboutUs from "./pages/AboutUs";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProjectForm from "./components/ProjectForm";
import CourseEnrollment from "./pages/CourseEnrollment";
import Login from "./pages/Login";
import AdminStudentActivity from "./components/AdminStudentActivity";
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
import AdminDashboard from "./pages/AdminDashboard"; // Kept only one AdminDashboard

// --- ADDED COURSE & PRICING COMPONENTS ---
import CourseSection from "./components/CourseSection"; // Kept only one
import PricingCard from "./components/PricingCard";

// --- SABBIN COMPONENTS DIN DA MUKA GINA ---
import IndustrySolutions from "./components/IndustrySolutions";
import MaintenancePlans from "./components/MaintenancePlans";

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
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* --- PUBLIC ACCESS PROTOCOLS --- */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/launch-project" element={<ProjectForm />} />
          <Route path="/enroll" element={<CourseEnrollment />} />
          <Route
            path="/verify/:certificateId"
            element={<VerifyCertificate />}
          />
          <Route
            path="/admin/activity"
            element={<AdminStudentActivity courseId="full-stack-web" />}
          />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/courses" element={<CourseSection />} />
          <Route path="/pricing" element={<PricingCard />} />

          {/* --- SABBIN ROUTES DIN DA AKA KARA --- */}
          <Route path="/industry-solutions" element={<IndustrySolutions />} />
          <Route path="/maintenance" element={<MaintenancePlans />} />

          {/* --- AUTHENTICATION TERMINALS --- */}
          <Route path="/portal" element={<AuthPortal />} />
          <Route path="/student-login" element={<StudentLogin />} />

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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentPortal />
              </ProtectedRoute>
            }
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

          <Route
            path="/admin/mailer"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminEmailPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/mailer"
            element={
              <ProtectedRoute requiredRole="superadmin">
                <AdminEmailPortal />
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
