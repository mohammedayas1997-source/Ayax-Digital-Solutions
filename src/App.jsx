import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AboutUs from './pages/AboutUs';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
// Import Components & Pages
import Navbar from './components/Navbar';
import Home from './pages/Home'; // Shafin farko
import ProjectForm from './components/ProjectForm';
import CourseEnrollment from './pages/CourseEnrollment';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar zai dinga fitowa a kowane shafi */}
        <Navbar /> 
        
        <Routes>
          {/* Shafin Gida */}
          <Route path="/" element={<Home />} />
          
          {/* Shafin Neman Aiki (Projects) */}
          <Route path="/inquiry" element={<ProjectForm />} />
          
          {/* Shafin Karatu (Courses) */}
          <Route path="/enroll" element={<CourseEnrollment />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* Bangaren Admin */}
          <Route path="/admin-login" element={<Login />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
        
        {/* Zaka iya saka Footer anan idan kana da shi */}
      </div>
    </Router>
  );
}

export default App;