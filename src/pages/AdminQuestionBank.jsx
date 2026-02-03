import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PlusCircle, Save, ArrowLeft, HelpCircle, CheckCircle2, Circle } from 'lucide-react';

const AdminQuestionBank = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [weekId, setWeekId] = useState(12);
  const [options, setOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  // --- SABON LOGIC: Domin canza wacce ce amsar da take daidai ---
  const toggleCorrect = (index) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index // Zai maida wanda aka taba true, sauran duka false
    }));
    setOptions(newOptions);
  };

  const saveQuestion = async () => {
    if (!questionText || options.some(opt => opt.text === "")) {
      return alert("Please fill in the question and all 4 options.");
    }
    
    try {
      await addDoc(collection(db, "examQuestions"), {
        courseId: courseId,
        weekId: parseInt(weekId),
        text: questionText,
        options: options,
        createdAt: serverTimestamp()
      });
      
      setQuestionText("");
      setOptions([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      alert(`Question successfully added to ${courseId.toUpperCase()} Bank!`);
    } catch (e) {
      console.error("Error adding question: ", e);
      alert("Error saving question.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold mb-8 transition-all"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-gray-100">
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-600 text-white rounded-2xl">
                <HelpCircle size={24} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                Question Bank
              </h2>
            </div>
            <p className="text-gray-400 font-bold italic">
              Managing Examination Content for: <span className="text-blue-600 underline">{courseId}</span>
            </p>
          </header>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Select Milestone</label>
                <select 
                  value={weekId} 
                  onChange={(e) => setWeekId(e.target.value)}
                  className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-gray-700 outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none"
                >
                  <option value={12}>Week 12 Midterm</option>
                  <option value={24}>Week 24 Final Exam</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">The Question</label>
              <textarea 
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter the examination question here..."
                className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-gray-700 outline-none focus:border-blue-600 focus:bg-white transition-all h-32 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {options.map((opt, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative ${
                    opt.isCorrect ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => toggleCorrect(idx)} // Zaka iya taba duka box din don canza amsar
                >
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black uppercase text-gray-400">Choice {String.fromCharCode(65 + idx)}</label>
                    {opt.isCorrect ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase">
                        <CheckCircle2 size={12} /> Correct
                      </span>
                    ) : (
                      <Circle size={12} className="text-gray-300" />
                    )}
                  </div>
                  <input 
                    type="text"
                    value={opt.text}
                    onClick={(e) => e.stopPropagation()} // Don gudun rikitarwa idan kana rubutu
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    className="w-full bg-transparent border-none font-bold text-gray-800 outline-none placeholder:text-gray-300"
                    placeholder="Enter answer option..."
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={saveQuestion}
              className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all transform active:scale-95"
            >
              <Save size={22} /> Add Question to Bank
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionBank;