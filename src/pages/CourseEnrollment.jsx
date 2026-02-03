import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { GraduationCap, MapPin, Globe, Home, Lock, BookOpen, School } from 'lucide-react';

const CourseEnrollment = () => {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);

  // --- Real-time Status Check ---
  useEffect(() => {
    // Mun saka try-catch a nan domin idan babu document din a Firebase, shafin ya ci gaba da aiki
    const unsub = onSnapshot(doc(db, "settings", "registration"), 
      (docSnap) => {
        if (docSnap.exists()) {
          setIsRegistrationOpen(docSnap.data().isOpen);
        }
      }, 
      (error) => {
        console.error("🔥 Enrollment Status Error:", error);
        // Idan aka samu error, bari mu bar registration a bude domin mutane su iya nema
        setIsRegistrationOpen(true);
      }
    );
    return () => unsub();
  }, []);

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    try {
      await addDoc(collection(db, "course_applications"), {
        studentName: formData.get('name'),
        email: formData.get('email'),
        course: formData.get('course'),
        currentAddress: formData.get('address'),
        currentState: formData.get('currentState'),
        currentLGA: formData.get('currentLGA'),
        country: formData.get('country'),
        stateOfOrigin: formData.get('stateOfOrigin'),
        lgaOfOrigin: formData.get('lgaOfOrigin'),
        qualification: formData.get('qualification'),
        institution: formData.get('institution') || "Not Provided",
        graduationYear: formData.get('graduationYear') || "N/A",
        appliedAt: serverTimestamp(),
        status: 'Pending Review'
      });
      setApplied(true);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="pt-40 pb-20 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={50} />
        </div>
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Application Successful!</h2>
        <p className="text-gray-500 mt-2 font-medium">Welcome to Ayax Academy. Check your email for next steps.</p>
        <button onClick={() => window.location.href = '/'} className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-900 transition-all">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Banner Section */}
        <div className="bg-gray-900 p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <BookOpen size={120} />
          </div>
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h1 className="text-4xl font-black tracking-tighter uppercase">Student Enrollment Form</h1>
          <p className="text-gray-400 mt-2 font-medium uppercase text-[10px] tracking-[0.3em]">Academic Year 2026/2027</p>
        </div>

        {!isRegistrationOpen ? (
          <div className="p-20 text-center">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase">Registration Closed</h2>
            <p className="text-gray-500 mt-2 font-medium">New applications are currently disabled.</p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="p-8 lg:p-16 space-y-12">
            
            {/* 1. Personal & Course Info */}
            <div className="space-y-6">
              <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase tracking-widest text-blue-600">
                <Globe size={18} /> 01. Personal & Course Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <input name="name" required className="input-style" placeholder="Full Name (Surname First)" />
                <input name="email" type="email" required className="input-style" placeholder="Active Email Address" />
                <select name="course" required className="input-style">
                  <option value="">Select Target Course</option>
                  <option value="Web Development">Full-Stack Website Development</option>
                  <option value="Digital Marketing">Advanced Digital Marketing</option>
                  <option value="Server Security">Server Security & Cyber Protection</option>
                  <option value="Data Analysis">Data Analysis & Intelligence</option>
                </select>
                <select name="country" required className="input-style text-gray-500">
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* 2. Academic Background */}
            <div className="space-y-6">
              <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase tracking-widest text-blue-600">
                <BookOpen size={18} /> 02. Academic Background
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <select name="qualification" required className="input-style">
                    <option value="">Highest Qualification</option>
                    <option value="SSCE">SSCE / High School</option>
                    <option value="Diploma">Diploma (OND/ND)</option>
                    <option value="Higher Diploma">Higher Diploma (HND)</option>
                    <option value="Bachelors">Bachelor's Degree (B.Sc/B.A)</option>
                    <option value="Masters">Master's Degree</option>
                    <option value="PHD">PHD</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <input name="institution" className="input-style border-dashed" placeholder="Institution Name (Optional)" />
                </div>
                <div className="md:col-span-1">
                  <input name="graduationYear" className="input-style border-dashed" placeholder="Graduation Year (Optional)" />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">* University and Year are optional if not applicable.</p>
            </div>

            {/* 3. Residential Address */}
            <div className="space-y-6">
              <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase tracking-widest text-blue-600">
                <Home size={18} /> 03. Residential Address
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <input name="address" required className="input-style" placeholder="Street Address / House Number" />
                </div>
                <input name="currentState" required className="input-style" placeholder="Current State" />
                <input name="currentLGA" required className="input-style" placeholder="Current LGA" />
              </div>
            </div>

            {/* 4. Origin Details */}
            <div className="space-y-6">
              <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase tracking-widest text-blue-600">
                <MapPin size={18} /> 04. Origin Details
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <input name="stateOfOrigin" required className="input-style" placeholder="State of Origin" />
                <input name="lgaOfOrigin" required className="input-style" placeholder="LGA of Origin" />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-900 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? "Processing Enrollment..." : "Submit My Application"}
            </button>
          </form>
        )}
      </div>

      {/* Styled JSX - Kar ka cire wannan domin shi ne yake bawa form din kyau */}
      <style>{`
        .input-style {
          width: 100%;
          padding: 1.25rem 1.5rem;
          background-color: #fcfcfc;
          border: 1px solid #eeeeee;
          border-radius: 1.5rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 700;
          font-size: 0.875rem;
        }
        .input-style:focus {
          border-color: #2563eb;
          background-color: #ffffff;
          box-shadow: 0 10px 30px -10px rgba(37, 99, 235, 0.2);
          transform: translateY(-2px);
        }
        .input-style::placeholder {
          color: #9ca3af;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default CourseEnrollment;