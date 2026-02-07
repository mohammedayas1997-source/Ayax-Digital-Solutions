import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Cpu,
  ChevronDown,
  ExternalLink,
  MessageCircle,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { auth } from "../firebaseConfig"; // Integrated Firebase Auth
import LogoImg from "../assets/logo.png";
import ChatNotificationIcon from "../pages/ChatNotificationIcon";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  const [currentCourseId, setCurrentCourseId] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      const savedCourse = localStorage.getItem("activeCourseId");
      setCurrentCourseId(savedCourse);
    });

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      unsubscribe();
    };
  }, []);

  const navLinks = [
    { name: "Home", href: "/", isLink: true },
    { name: "About Us", href: "/about", isLink: true },
    { name: "Services", href: "#services", isLink: false },
    { name: "Enrollment", href: "/enroll", isLink: true },
    { name: "Terms", href: "/terms", isLink: true },
    { name: "Privacy", href: "/privacy", isLink: true },
  ];

  return (
    <nav
      className={`fixed w-full z-[100] transition-all duration-500 ${
        scrolled
          ? "py-2 bg-blue-50/95 backdrop-blur-md shadow-md border-b border-blue-100"
          : "py-4 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* LOGO AREA - Optimized height for mobile accessibility */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <img
              src={LogoImg}
              alt="AYAX Logo"
              className="h-10 md:h-14 w-auto object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
                if (e.target.nextSibling)
                  e.target.nextSibling.style.opacity = "1";
              }}
            />
            <div className="absolute top-0 left-0 bg-blue-600/10 p-1 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <span
            className={`text-xl md:text-2xl font-black tracking-tighter transition-colors duration-300 ${scrolled ? "text-blue-900" : "text-white"}`}
          >
            AYAX <span className="text-blue-600">DIGITAL</span>
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) =>
            link.isLink ? (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm font-bold transition-colors ${scrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-200 hover:text-white"}`}
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-bold transition-colors ${scrolled ? "text-gray-700 hover:text-blue-600" : "text-gray-200 hover:text-white"}`}
              >
                {link.name}
              </a>
            ),
          )}

          <div
            className={`flex items-center gap-3 ml-4 border-l pl-6 ${scrolled ? "border-blue-200" : "border-white/20"}`}
          >
            <a
              href="https://wa.me/2347087244444"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-bold text-[10px]"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>

            <a
              href="mailto:ayaxdigitalsolutions@gmail.com"
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-bold text-[10px]"
            >
              <Mail size={14} /> Email
            </a>

            <Link
              to="/admin-dashboard"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold text-[10px] hover:bg-black transition-all flex items-center gap-2"
            >
              Admin <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-4 ml-4">
            {currentCourseId && (
              <ChatNotificationIcon courseId={currentCourseId} />
            )}

            {user && (
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden border-2 border-blue-500">
                <img
                  src={user.photoURL || "https://via.placeholder.com/40"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* MOBILE ACTIONS */}
        <div className="lg:hidden flex items-center gap-3">
          {currentCourseId && (
            <ChatNotificationIcon courseId={currentCourseId} />
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors ${scrolled ? "text-blue-900 hover:bg-blue-100" : "text-white hover:bg-white/10"}`}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`lg:hidden absolute w-full bg-blue-50 border-b border-blue-100 transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[800px] opacity-100 shadow-2xl" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) =>
            link.isLink ? (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="text-md font-bold text-blue-900 hover:text-blue-600 border-b border-blue-100 pb-2"
              >
                {link.name}
              </Link>
            ) : (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-md font-bold text-blue-900 hover:text-blue-600 border-b border-blue-100 pb-2"
              >
                {link.name}
              </a>
            ),
          )}

          <div className="flex flex-col gap-3 mt-2">
            <a
              href="https://wa.me/2347087244444"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-green-600 text-white rounded-xl font-black flex items-center justify-center gap-3 text-sm shadow-md"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>

            <a
              href="mailto:ayaxdigitalsolutions@gmail.com"
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-black flex items-center justify-center gap-3 text-sm shadow-md"
            >
              <Mail size={18} /> Email
            </a>

            <Link
              to="/admin-dashboard"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-gray-900 text-white text-center rounded-xl font-black flex items-center justify-center gap-3 text-sm"
            >
              Admin Portal <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
