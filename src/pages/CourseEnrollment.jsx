import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  ExternalLink,
  ArrowRight,
  Award,
  Building2,
  CalendarDays,
} from "lucide-react";

const CourseEnrollment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

      // 3. Redirect to Payment Page immediately after successful Firestore save
      navigate("/payment");
    } catch (err) {
      console.error("Submission Error:", err);
      alert("Submission failed. Check your internet or Firebase config.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gray-900 p-12 text-white text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white">
            Elite Enrollment
          </h1>
          <p className="text-blue-400 font-bold mt-2">
            Complete your information to proceed to payment.
          </p>
        </div>

        {/* PAYMENT NOTICE BAR */}
        <div className="bg-blue-50 p-8 mx-8 mt-8 rounded-[2rem] border-2 border-blue-100 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg">
            <Info size={32} />
          </div>
          <div className="flex-1">
            <h4 className="text-blue-900 font-black uppercase text-xs tracking-[0.2em] mb-1">
              Step 1 of 2: Personal Details
            </h4>
            <p className="text-blue-700 text-sm font-medium leading-relaxed">
              Fill the form below accurately. After submission, you will be
              automatically redirected to the{" "}
              <span className="font-black underline">
                Secure Payment Gateway
              </span>
              .
            </p>
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

          {/* EDUCATIONAL BACKGROUND - NOW EXPANDED AND SEPARATED */}
          <div className="space-y-8">
            <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase text-blue-600">
              <School size={18} /> Educational Background (Optional)
            </h3>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2">
                  <Award size={12} /> Highest Qualification
                </label>
                <select name="qualification" className="input-style">
                  <option value="">Select Qualification</option>
                  <option value="SSCE">SSCE</option>
                  <option value="Diploma">Diploma</option>
                  <option value="NCE">NCE</option>
                  <option value="Degree">Degree</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2">
                  <Building2 size={12} /> Institution Name
                </label>
                <input
                  name="institution"
                  className="input-style"
                  placeholder="e.g. Ahmadu Bello University"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-4 flex items-center gap-2">
                  <CalendarDays size={12} /> Year of Graduation
                </label>
                <input
                  name="graduationYear"
                  className="input-style"
                  placeholder="e.g. 2022"
                />
              </div>
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
                <UploadCloud className="animate-spin" /> Finalizing
                Application...
              </>
            ) : (
              <>
                Save & Proceed to Payment <ArrowRight size={20} />
              </>
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
