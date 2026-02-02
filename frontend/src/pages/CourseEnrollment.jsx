import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { GraduationCap, MapPin, Globe, Home, Lock } from 'lucide-react';

const CourseEnrollment = () => {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true); // Default to open

  // --- Real-time Status Check ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "registration"), (doc) => {
      if (doc.exists()) {
        setIsRegistrationOpen(doc.data().isOpen);
      }
    });
    return unsub;
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
        appliedAt: serverTimestamp(),
        status: 'Pending Review'
      });
      setApplied(true);
    } catch (err) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Success State ---
  if (applied) {
    return (
      <div className="pt-40 pb-20 text-center">
        <GraduationCap size={80} className="mx-auto text-blue-600 mb-6" />
        <h2 className="text-3xl font-black">Application Successful!</h2>
        <p className="text-gray-500 mt-2">Welcome to Ayax Academy. Check your email for next steps.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Banner Section */}
        <div className="bg-blue-600 p-10 text-white text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-black">Student Enrollment Form</h1>
          <p className="text-blue-100 mt-2">Complete the form below to register for your preferred tech course.</p>
        </div>

        {/* --- CHECK IF OPEN OR CLOSED --- */}
        {!isRegistrationOpen ? (
          <div className="p-20 text-center">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Registration is Currently Closed</h2>
            <p className="text-gray-500 mt-2">We are currently not accepting new students. Please check back later or contact support.</p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="p-8 lg:p-16 space-y-10">
            {/* 1. Basic Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><Globe className="text-blue-600" /> Personal & Course Info</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <input name="name" required className="input-style" placeholder="Full Name (e.g., John Doe)" />
                <input name="email" type="email" required className="input-style" placeholder="Email Address" />
                <select name="course" className="input-style">
                  <option value="Web Development">Full-Stack Website Development</option>
                  <option value="Digital Marketing">Advanced Digital Marketing</option>
                  <option value="Server Security">Server Security & Cyber Protection</option>
                  <option value="Data Analysis">Data Analysis & Intelligence</option>
                </select>
                <select name="country" className="input-style">
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* 2. Current Residential Address */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><Home className="text-blue-600" /> Residential Address</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <input name="address" required className="input-style" placeholder="Street Address / House Number" />
                </div>
                <input name="currentState" required className="input-style" placeholder="Current State" />
                <input name="currentLGA" required className="input-style" placeholder="Current LGA" />
              </div>
            </div>

            {/* 3. State of Origin Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2"><MapPin className="text-blue-600" /> State of Origin</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <input name="stateOfOrigin" required className="input-style" placeholder="State of Origin" />
                <input name="lgaOfOrigin" required className="input-style" placeholder="LGA of Origin" />
              </div>
            </div>

            <button disabled={loading} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl">
              {loading ? "Registering Student..." : "Submit Registration"}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 1rem 1.25rem;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          outline: none;
          transition: all 0.3s;
        }
        .input-style:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CourseEnrollment;