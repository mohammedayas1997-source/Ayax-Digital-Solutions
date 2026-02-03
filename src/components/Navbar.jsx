import React, { useState, useEffect } from 'react';
import { Menu, X, Cpu, ChevronDown, ExternalLink, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import { auth } from '../firebaseConfig'; // Integrated Firebase Auth
import LogoImg from '../assets/logo.png'; 
import ChatNotificationIcon from '../pages/ChatNotificationIcon';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  
  // Wannan zai dauko currentCourseId daga storage ko state idan akwai
  const [currentCourseId, setCurrentCourseId] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    // Auth Listener don tabbatar da 'user' variable baya bamu error
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      // Misali: zaka iya dauko courseId daga localStorage idan dalibi yana kallo
      const savedCourse = localStorage.getItem('activeCourseId');
      setCurrentCourseId(savedCourse);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', isLink: true },
    { name: 'About Us', href: '/about', isLink: true },
    { name: 'Services', href: '#services', isLink: false },
    { name: 'Enrollment', href: '/enroll', isLink: true }, 
    { name: 'Terms', href: '/terms', isLink: true },
    { name: 'Privacy', href: '/privacy', isLink: true },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
      ? 'py-3 bg-blue-50/95 backdrop-blur-md shadow-md border-b border-blue-100' 
      : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO AREA */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <img 
              src={LogoImg} 
              alt="AYAX Logo" 
              className="h-25 w-auto object-contain mix-blend-multiply group-hover:scale-120 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display='none';
                if (e.target.nextSibling) e.target.nextSibling.style.opacity='1'; 
              }} 
            />
            <div className="absolute top-0 left-0 bg-blue-600/10 p-2 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none">
              <Cpu className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <span className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${scrolled ? 'text-blue-900' : 'text-white'}`}>
            AYAX <span className="text-blue-600">DIGITAL</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            link.isLink ? (
              <Link 
                key={link.name} 
                to={link.href}
                className={`text-sm font-bold transition-colors ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-200 hover:text-white'}`}
              >
                {link.name}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href}
                className={`text-sm font-bold transition-colors ${scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-gray-200 hover:text-white'}`}
              >
                {link.name}
              </a>
            )
          ))}

          
          {/* Contact Buttons Group */}
          <div className={`flex items-center gap-3 ml-4 border-l pl-6 ${scrolled ? 'border-blue-200' : 'border-white/20'}`}>
            <a 
              href="https://wa.me/2347087244444" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-bold text-xs"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            
            <a 
              href="mailto:ayaxdigitalsolutions@gmail.com" 
              className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-bold text-xs"
            >
              <Mail size={16} /> Email
            </a>

            <Link to="/admin-dashboard" className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center gap-2">
              Admin <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* USER PROFILE & NOTIFICATION AREA */}
          <div className="flex items-center gap-4 ml-4">
            {currentCourseId && <ChatNotificationIcon courseId={currentCourseId} />}
            
            {user && (
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-blue-500">
                <img src={user.photoURL || "https://via.placeholder.com/40"} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* MOBILE HAMBURGER BUTTON */}
        <div className="lg:hidden flex items-center gap-4">
          {currentCourseId && <ChatNotificationIcon courseId={currentCourseId} />}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-blue-900 hover:bg-blue-100' : 'text-white hover:bg-white/10'}`}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div className={`lg:hidden absolute w-full bg-blue-50 border-b border-blue-100 transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-[800px] opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 py-8 flex flex-col gap-5">
          {navLinks.map((link) => (
            link.isLink ? (
              <Link 
                key={link.name} 
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-blue-900 hover:text-blue-600"
              >
                {link.name}
              </Link>
            ) : (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-blue-900 hover:text-blue-600"
              >
                {link.name}
              </a>
            )
          ))}
          
          <div className="h-px bg-blue-200 my-2"></div>
          
          <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Reach Out To Us</p>
          
          <a 
            href="https://wa.me/2347087244444" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-green-100"
          >
            <MessageCircle size={20} /> Chat on WhatsApp
          </a>

          <a 
            href="mailto:ayaxdigitalsolutions@gmail.com" 
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-blue-100"
          >
            <Mail size={20} /> Send an Email
          </a>

          <Link 
            to="/admin-dashboard" 
            onClick={() => setIsOpen(false)} 
            className="w-full py-4 bg-gray-900 text-white text-center rounded-2xl font-black flex items-center justify-center gap-3"
          >
            Admin Portal <ExternalLink size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;