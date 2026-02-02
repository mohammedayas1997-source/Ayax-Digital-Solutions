import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components & Pages
import Navbar from '../../src/components/Navbar';
import Home from './pages/Home'; // Shafin farko
import ProjectForm from './components/ProjectForm';
import CourseEnrollment from './pages/CourseEnrollment';
import AdminDashboard from '../../src/pages/AdminDashboard';
import Login from '../../src/pages/Login';

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