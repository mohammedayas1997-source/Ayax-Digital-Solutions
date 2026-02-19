import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, storage } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  GraduationCap,
  Globe,
  Home,
  Camera,
  UploadCloud,
  School,
  Info,
  ArrowRight,
  Plus,
  Trash2,
  X,
  CreditCard,
  User,
  MapPin,
} from "lucide-react";

const CourseEnrollment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Passport State
  const [passportImage, setPassportImage] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);

  // Dynamic Education State
  const [educationList, setEducationList] = useState([
    { qualification: "", institution: "", course: "", year: "" },
  ]);

  const preSelectedCourse = location.state?.selectedCourse || "";
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    if (preSelectedCourse) setSelectedCourse(preSelectedCourse);
  }, [preSelectedCourse]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large! Max 2MB allowed.");
        return;
      }
      setPassportImage(file);
      setPassportPreview(URL.createObjectURL(file));
    }
  };

  const addEducation = () => {
    setEducationList([
      ...educationList,
      { qualification: "", institution: "", course: "", year: "" },
    ]);
  };

  const removeEducation = (index) => {
    const list = [...educationList];
    list.splice(index, 1);
    setEducationList(list);
  };

  const handleEducationChange = (index, field, value) => {
    const list = [...educationList];
    list[index][field] = value;
    setEducationList(list);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!passportImage) {
      alert("Please upload your Passport photograph!");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.target);

    try {
      // 1. Upload Passport to Storage
      const passportRef = ref(storage, `passports/${Date.now()}_passport`);
      const pSnapshot = await uploadBytes(passportRef, passportImage);
      const passportURL = await getDownloadURL(pSnapshot.ref);

      // 2. Add Doc to Firestore
      await addDoc(collection(db, "course_applications"), {
        studentName: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        course: formData.get("course"),
        passportUrl: passportURL,
        address: formData.get("address"),
        currentState: formData.get("currentState"),
        currentLGA: formData.get("currentLGA"),
        country: formData.get("country"),
        stateOfOrigin: formData.get("stateOfOrigin"),
        lgaOfOrigin: formData.get("lgaOfOrigin"),
        educationBackground: educationList,
        appliedAt: serverTimestamp(),
        status: "Pending Review",
      });

      // 3. UMURNI: Real-life redirect to payment nan take
      navigate("/payment", {
        state: {
          studentName: formData.get("name"),
          course: formData.get("course"),
        },
      });
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Submission failed. Check your internet or Firebase config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100 relative">
        {/* CLOSE BUTTON (Madaidaicin matsayi) */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 right-8 z-10 p-3 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 rounded-2xl transition-all duration-300 group shadow-sm"
        >
          <X
            size={24}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>

        {/* HEADER SECTION */}
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-500 rounded-full -translate-x-12 -translate-y-12"></div>
          </div>
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-pulse" />
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white">
            Elite <span className="text-blue-500">Enrollment</span>
          </h1>
          <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">
            Official Admissions Portal 2026
          </p>
        </div>

        {/* STEP INDICATOR */}
        <div className="bg-blue-600 p-8 mx-8 -mt-8 rounded-[2rem] text-white flex items-center gap-6 shadow-xl relative z-20">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <Info size={32} />
          </div>
          <div>
            <h4 className="font-black uppercase text-xs tracking-widest opacity-80 mb-1">
              Gateway Phase 1 of 2
            </h4>
            <p className="text-sm font-bold">
              Secure Submission: Provide accurate data to initiate payment
              protocols.
            </p>
          </div>
        </div>

        <form onSubmit={handleApply} className="p-8 lg:p-16 space-y-16">
          {/* 01. PASSPORT UPLOAD */}
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Student Passport
              </h3>
            </div>
            <div className="relative w-48 h-48 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group transition-all hover:border-blue-400">
              {passportPreview ? (
                <img
                  src={passportPreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <div className="text-center">
                  <Camera
                    className="text-slate-300 group-hover:text-blue-500 transition-colors mx-auto"
                    size={48}
                  />
                  <p className="text-[9px] font-black text-slate-400 mt-2 uppercase">
                    Max 2MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* 02. PERSONAL INFO */}
          <div className="space-y-8">
            <h3 className="text-sm font-black flex items-center gap-3 border-l-4 border-blue-600 pl-4 uppercase text-slate-900">
              <User size={18} className="text-blue-600" /> Identity & Course
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Full Name
                </label>
                <input
                  name="name"
                  required
                  className="input-style"
                  placeholder="Abubakar Ayax"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="input-style"
                  placeholder="ayax@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Contact Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="input-style"
                  placeholder="+234 000 000 0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Selected Specialization
                </label>
                <select
                  name="course"
                  required
                  className="input-style"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Select Course</option>
                  <option value="Cyber security">Cyber security</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Software Engineering">
                    Software Engineering
                  </option>
                  <option value="Artificial Intelligence">
                    Artificial Intelligence
                  </option>
                  <option value="Blockchain Technology">
                    Blockchain Technology
                  </option>
                  <option value="Web development">Web development</option>
                  <option value="advanced Digital Marketing">
                    Advanced Digital Marketing
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* 03. EDUCATION SECTION */}
          <div className="space-y-8">
            <div className="flex justify-between items-center border-l-4 border-blue-600 pl-4">
              <h3 className="text-sm font-black flex items-center gap-3 uppercase text-slate-900">
                <School size={18} className="text-blue-600" /> Academic History
              </h3>
            </div>

            <div className="space-y-6">
              {educationList.map((edu, index) => (
                <div
                  key={index}
                  className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 relative animate-in fade-in zoom-in duration-300"
                >
                  {educationList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="absolute top-6 right-6 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <select
                      className="input-style"
                      value={edu.qualification}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "qualification",
                          e.target.value,
                        )
                      }
                      required
                    >
                      <option value="">Select Qualification</option>
                      <option value="SSCE">SSCE</option>
                      <option value="ND/Diploma">ND / Diploma</option>
                      <option value="NCE">NCE</option>
                      <option value="HND/Degree">HND / Degree</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                    <input
                      className="input-style"
                      placeholder="Institution Name"
                      value={edu.institution}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "institution",
                          e.target.value,
                        )
                      }
                      required
                    />
                    <input
                      className="input-style"
                      placeholder="Course of Study"
                      value={edu.course}
                      onChange={(e) =>
                        handleEducationChange(index, "course", e.target.value)
                      }
                      required
                    />
                    <input
                      className="input-style"
                      placeholder="Graduation Year"
                      value={edu.year}
                      onChange={(e) =>
                        handleEducationChange(index, "year", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addEducation}
              className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add More Credentials
            </button>
          </div>

          {/* 04. RESIDENCE INFO */}
          <div className="space-y-8">
            <h3 className="text-sm font-black flex items-center gap-3 border-l-4 border-blue-600 pl-4 uppercase text-slate-900">
              <MapPin size={18} className="text-blue-600" /> Geography & Origin
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">
                  Full Residential Address
                </label>
                <input
                  name="address"
                  required
                  className="input-style"
                  placeholder="Street, Building No, Area"
                />
              </div>
              <input
                name="currentState"
                required
                className="input-style"
                placeholder="Current State"
              />
              <input
                name="currentLGA"
                required
                className="input-style"
                placeholder="Current LGA"
              />
              <input
                name="stateOfOrigin"
                required
                className="input-style"
                placeholder="State of Origin"
              />
              <input
                name="lgaOfOrigin"
                required
                className="input-style"
                placeholder="LGA of Origin"
              />
              <select name="country" className="input-style font-black">
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>
          </div>

          {/* FINAL SUBMIT BUTTON */}
          <button
            disabled={loading}
            className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <UploadCloud className="animate-spin" /> Verifying Records...
              </>
            ) : (
              <>
                Confirm & Start Payment <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .input-style {
          width: 100%; 
          padding: 1.25rem 1.5rem; 
          background: #f8fafc; 
          border: 2px solid transparent;
          border-radius: 1.5rem; 
          outline: none; 
          font-weight: 800; 
          font-size: 0.85rem;
          color: #0f172a;
          transition: all 0.3s ease;
        }
        .input-style:focus { 
          border-color: #2563eb; 
          background: white;
          box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.1); 
        }
        .input-style::placeholder { color: #cbd5e1; font-weight: 700; }
      `}</style>
    </div>
  );
};

export default CourseEnrollment;
