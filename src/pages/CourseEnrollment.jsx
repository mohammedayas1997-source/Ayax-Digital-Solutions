import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db, storage } from '../firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { GraduationCap, MapPin, Globe, Home, BookOpen, Camera, UploadCloud, X, CreditCard } from 'lucide-react';

const CourseEnrollment = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  
  // State na hotunan Passport
  const [passportImage, setPassportImage] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);

  // State na hotunan Receipt
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const preSelectedCourse = location.state?.selectedCourse || "";
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    if (preSelectedCourse) setSelectedCourse(preSelectedCourse);
  }, [preSelectedCourse]);

  // Handle Image Previews
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large! Max 2MB allowed.");
        return;
      }
      if (type === 'passport') {
        setPassportImage(file);
        setPassportPreview(URL.createObjectURL(file));
      } else {
        setReceiptImage(file);
        setReceiptPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    // Tabbatar an saka hotuna kafin a tafi
    if (!passportImage || !receiptImage) {
      alert("Please upload both Passport and Payment Receipt!");
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.target);
    
    try {
      // 1. Upload Passport to Storage
      const passportRef = ref(storage, `passports/${Date.now()}_passport`);
      const pSnapshot = await uploadBytes(passportRef, passportImage);
      const passportURL = await getDownloadURL(pSnapshot.ref);

      // 2. Upload Receipt to Storage
      const receiptRef = ref(storage, `receipts/${Date.now()}_receipt`);
      const rSnapshot = await uploadBytes(receiptRef, receiptImage);
      const receiptURL = await getDownloadURL(rSnapshot.ref);

      // 3. Save Everything to Firestore
      await addDoc(collection(db, "course_applications"), {
        studentName: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        course: formData.get('course'),
        passportUrl: passportURL,
        receiptUrl: receiptURL,
        address: formData.get('address'),
        currentState: formData.get('currentState'),
        currentLGA: formData.get('currentLGA'),
        country: formData.get('country'),
        stateOfOrigin: formData.get('stateOfOrigin'),
        lgaOfOrigin: formData.get('lgaOfOrigin'),
        qualification: formData.get('qualification'),
        institution: formData.get('institution') || "Not Provided",
        graduationYear: formData.get('graduationYear') || "N/A",
        appliedAt: serverTimestamp(),
        paymentStatus: 'Pending Verification',
        status: 'Pending Review'
      });

      setApplied(true);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Submission failed. Check your internet or Firebase config.");
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
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Application Received!</h2>
        <p className="text-gray-500 mt-2 font-medium">We are verifying your payment. Check back soon.</p>
        <button onClick={() => window.location.href = '/'} className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-900 transition-all">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        
        <div className="bg-gray-900 p-12 text-white text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Elite Enrollment</h1>
        </div>

        <form onSubmit={handleApply} className="p-8 lg:p-16 space-y-12">
          
          {/* UPLOAD SECTION (Passport & Receipt) */}
          <div className="grid md:grid-cols-2 gap-10">
            {/* Passport */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">01. Student Passport</h3>
              <div className="relative w-40 h-40 bg-gray-100 rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {passportPreview ? (
                  <img src={passportPreview} className="w-full h-full object-cover" />
                ) : <Camera className="text-gray-300" size={40} />}
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'passport')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* Receipt */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">02. Bank Receipt</h3>
              <div className="relative w-40 h-40 bg-gray-100 rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                {receiptPreview ? (
                  <img src={receiptPreview} className="w-full h-full object-cover" />
                ) : <CreditCard className="text-gray-300" size={40} />}
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'receipt')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div className="space-y-6">
            <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase text-blue-600"><Globe size={18} /> Student Credentials</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <input name="name" required className="input-style" placeholder="Full Name" />
              <input name="email" type="email" required className="input-style" placeholder="Email Address" />
              <input name="phone" type="tel" required className="input-style" placeholder="Phone Number" />
              <select name="course" required className="input-style" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="">Select Course</option>
                <option value="Full-Stack Website Development">Full-Stack Website Development</option>
                <option value="Advanced Digital Marketing">Advanced Digital Marketing</option>
              </select>
            </div>
          </div>

          {/* ADDRESS & ORIGIN */}
          <div className="space-y-6">
            <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase text-blue-600"><Home size={18} /> Resident & Origin</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <input name="address" required className="input-style md:col-span-2" placeholder="Street Address" />
              <input name="currentState" required className="input-style" placeholder="Current State" />
              <input name="currentLGA" required className="input-style" placeholder="Current LGA" />
              <input name="stateOfOrigin" required className="input-style" placeholder="State of Origin" />
              <input name="lgaOfOrigin" required className="input-style" placeholder="LGA of Origin" />
              <select name="country" className="input-style"><option value="Nigeria">Nigeria</option></select>
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <><UploadCloud className="animate-spin" /> Uploading...</> : "Submit Application"}
          </button>
        </form>
      </div>

      <style>{`
        .input-style {
          width: 100%; padding: 1.25rem; background: #fcfcfc; border: 1px solid #eeeeee;
          border-radius: 1.25rem; outline: none; font-weight: 700; font-size: 0.875rem;
        }
        .input-style:focus { border-color: #2563eb; background: white; }
      `}</style>
    </div>
  );
};

export default CourseEnrollment;