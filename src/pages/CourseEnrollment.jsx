import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import { db, storage } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  GraduationCap,
  MapPin,
  Globe,
  Home,
  BookOpen,
  Camera,
  UploadCloud,
  X,
  CreditCard,
  School,
  Info,
  ExternalLink, // Added for the button icon
} from "lucide-react";

const CourseEnrollment = () => {
  const location = useLocation();
  const navigate = useNavigate(); // For navigation
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  // State for Passport Image
  const [passportImage, setPassportImage] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);

  const preSelectedCourse = location.state?.selectedCourse || "";
  const [selectedCourse, setSelectedCourse] = useState("");

  useEffect(() => {
    if (preSelectedCourse) setSelectedCourse(preSelectedCourse);
  }, [preSelectedCourse]);

  // Handle Image Previews
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

      // 2. Save Everything to Firestore
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
        qualification: formData.get("qualification") || "N/A",
        institution: formData.get("institution") || "Not Provided",
        graduationYear: formData.get("graduationYear") || "N/A",
        appliedAt: serverTimestamp(),
        status: "Pending Review",
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
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
          Application Received!
        </h2>
        <p className="text-gray-500 mt-2 font-medium">
          Thank you for applying. We will contact you shortly.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-900 transition-all"
        >
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
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white">
            Elite Enrollment
          </h1>
          <p className="text-blue-400 font-bold mt-2">
            Fill the form below to secure your future.
          </p>
        </div>

        {/* UPDATED PAYMENT INFORMATION SECTION WITH BUTTON */}
        <div className="bg-blue-50 p-8 mx-8 mt-8 rounded-[2rem] border-2 border-blue-100 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg">
            <CreditCard size={32} />
          </div>
          <div className="flex-1">
            <h4 className="text-blue-900 font-black uppercase text-xs tracking-[0.2em] mb-1">
              Registration Fee: 3,000 Naira
            </h4>
            <p className="text-blue-700 text-sm font-medium leading-relaxed">
              Pay to: <span className="font-black">AYAX ACADEMY LTD</span>{" "}
              <br />
              Bank: <span className="font-black">OPAY / MONIEPOINT</span> <br />
              Account: <span className="font-black">8123456789</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <button
              type="button"
              onClick={() => window.open("/payment", "_blank")} // Or navigate("/payment")
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-gray-900 transition-all shadow-md active:scale-95"
            >
              Pay Online Now <ExternalLink size={14} />
            </button>
            <div className="bg-white/50 px-4 py-2 rounded-xl border border-blue-200 flex items-center gap-2">
              <Info size={16} className="text-blue-600" />
              <span className="text-[10px] font-bold text-blue-800 uppercase">
                Save your receipt after payment
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleApply} className="p-8 lg:p-16 space-y-12">
          {/* PASSPORT SECTION */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              01. Student Passport
            </h3>
            <div className="relative w-40 h-40 bg-gray-100 rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400 group">
              {passportPreview ? (
                <img
                  src={passportPreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <Camera
                  className="text-gray-300 group-hover:text-blue-400 transition-colors"
                  size={40}
                />
              )}
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-[10px] font-bold text-gray-400">
              Click to upload (Max 2MB)
            </p>
          </div>

          {/* PERSONAL INFO */}
          <div className="space-y-6">
            <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase text-blue-600">
              <Globe size={18} /> Student Credentials
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <input
                name="name"
                required
                className="input-style"
                placeholder="Full Name"
              />
              <input
                name="email"
                type="email"
                required
                className="input-style"
                placeholder="Email Address"
              />
              <input
                name="phone"
                type="tel"
                required
                className="input-style"
                placeholder="Phone Number"
              />
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

          {/* EDUCATIONAL BACKGROUND */}
          <div className="space-y-6">
            <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase text-blue-600">
              <School size={18} /> Educational Background (Optional)
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <select name="qualification" className="input-style">
                <option value="">Select Qualification</option>
                <option value="SSCE">SSCE</option>
                <option value="Diploma">Diploma</option>
                <option value="NCE">NCE</option>
                <option value="Degree">Degree</option>
                <option value="Other">Other</option>
              </select>
              <input
                name="institution"
                className="input-style"
                placeholder="Institution Name"
              />
              <input
                name="graduationYear"
                className="input-style"
                placeholder="Year of Graduation"
              />
            </div>
          </div>

          {/* ADDRESS & ORIGIN */}
          <div className="space-y-6">
            <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase text-blue-600">
              <Home size={18} /> Resident & Origin
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <input
                name="address"
                required
                className="input-style md:col-span-2"
                placeholder="Street Address"
              />
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
              <select name="country" className="input-style">
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
          >
            {loading ? (
              <>
                <UploadCloud className="animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </form>
      </div>

      <style>{`
        .input-style {
          width: 100%; padding: 1.25rem; background: #fcfcfc; border: 1px solid #eeeeee;
          border-radius: 1.25rem; outline: none; font-weight: 700; font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        .input-style:focus { border-color: #2563eb; background: white; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1); }
      `}</style>
    </div>
  );
};

export default CourseEnrollment;
