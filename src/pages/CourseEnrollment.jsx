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
      const passportRef = ref(storage, `passports/${Date.now()}_passport`);
      const pSnapshot = await uploadBytes(passportRef, passportImage);
      const passportURL = await getDownloadURL(pSnapshot.ref);

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
      <div className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 relative">
        {/* CLOSE / HOME BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 right-8 z-10 p-3 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-2xl transition-all duration-300 group"
          title="Return to Home"
        >
          <X
            size={24}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
        </button>

        <div className="bg-gray-900 p-12 text-white text-center">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            Elite Enrollment
          </h1>
          <p className="text-blue-400 font-bold mt-2">
            Complete your information to proceed.
          </p>
        </div>

        <div className="bg-blue-50 p-8 mx-8 mt-8 rounded-[2rem] border-2 border-blue-100 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg">
            <Info size={32} />
          </div>
          <div className="flex-1">
            <h4 className="text-blue-900 font-black uppercase text-xs tracking-[0.2em] mb-1">
              Step 1 of 2: Personal Details
            </h4>
            <p className="text-blue-700 text-sm font-medium">
              After submission, you will be redirected to the Secure Payment
              Gateway.
            </p>
          </div>
        </div>

        <form onSubmit={handleApply} className="p-8 lg:p-16 space-y-12">
          {/* PASSPORT SECTION */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              01. Student Passport
            </h3>
            <div className="relative w-40 h-40 bg-gray-100 rounded-3xl border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group">
              {passportPreview ? (
                <img
                  src={passportPreview}
                  className="w-full h-full object-cover"
                  alt="Preview"
                />
              ) : (
                <Camera
                  className="text-gray-300 group-hover:text-blue-400"
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

          {/* DYNAMIC EDUCATIONAL BACKGROUND */}
          <div className="space-y-6">
            <h3 className="text-sm font-black flex items-center gap-2 border-b pb-4 uppercase text-blue-600">
              <School size={18} /> Educational Background
            </h3>

            <div className="space-y-6">
              {educationList.map((edu, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative animate-in slide-in-from-top-4"
                >
                  {educationList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <div className="grid md:grid-cols-2 gap-4">
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
                      placeholder="Course of Study / Subjects"
                      value={edu.course}
                      onChange={(e) =>
                        handleEducationChange(index, "course", e.target.value)
                      }
                      required
                    />
                    <input
                      className="input-style"
                      placeholder="Year of Graduation"
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

            {/* ADD BUTTON MOVED TO THE BOTTOM */}
            <button
              type="button"
              onClick={addEducation}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-blue-200 text-blue-600 rounded-[1.5rem] font-bold uppercase text-[10px] hover:bg-blue-50 hover:border-blue-400 transition-all"
            >
              <Plus size={16} /> Add Another Qualification
            </button>
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
                <UploadCloud className="animate-spin" /> Processing...
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
          width: 100%; padding: 1.25rem; background: white; border: 1px solid #eeeeee;
          border-radius: 1.25rem; outline: none; font-weight: 700; font-size: 0.875rem;
          transition: all 0.3s ease;
        }
        .input-style:focus { border-color: #2563eb; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.1); }
      `}</style>
    </div>
  );
};

export default CourseEnrollment;
