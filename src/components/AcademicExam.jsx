import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Timer, CheckCircle2, AlertCircle, Award, Home } from 'lucide-react';

const AcademicExam = ({ questions = [] }) => {
  const { weekId: urlWeekId, courseId: urlCourseId } = useParams();
  const navigate = useNavigate();
  
  const weekId = parseInt(urlWeekId);
  const courseId = urlCourseId || "global-course";

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 Minutes
  const [generatedCertId, setGeneratedCertId] = useState(null); // Domin rike ID din certificate
  const user = auth.currentUser;

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      submitExam();
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 1);
    const next = currentQuestion + 1;
    if (next < questions.length) {
      setCurrentQuestion(next);
    } else {
      submitExam();
    }
  };

  const submitExam = async () => {
    if (!user) return;
    
    const finalPercentage = (score / questions.length) * 100;
    const examId = weekId === 12 ? 'midterm' : 'final';
    
    try {
      // 1. Ajiye sakamakon jarrabawa kamar yadda yake a code dinka
      await setDoc(doc(db, `students/${user.uid}/exams/${courseId}_${examId}`), {
        score: finalPercentage,
        status: finalPercentage >= 50 ? 'passed' : 'failed',
        completedAt: serverTimestamp(),
        courseId: courseId,
        week: weekId
      });

      // 2. SABON LOGIC: Idan Final Exam ne kuma ya samu 70%+, samar da Certificate
      if (weekId === 24 && finalPercentage >= 70) {
        const certId = `AYX-${user.uid.substring(0, 5)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        
        await setDoc(doc(db, "issuedCertificates", certId), {
          certificateId: certId,
          studentId: user.uid,
          studentName: user.displayName || "Student",
          courseId: courseId,
          courseName: courseId.replace(/-/g, ' '), // Gyara sunan kwas din
          dateCompleted: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          issuedAt: serverTimestamp(),
          isValid: true
        });
        
        setGeneratedCertId(certId); // Ajiye ID din don amfani a ƙasa
      }
    } catch (error) {
      console.error("Error saving exam or issuing certificate:", error);
    }
    
    setShowResult(true);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-bold">Loading Examination Questions...</p>
      </div>
    );
  }

  if (showResult) {
    const finalScore = (score / questions.length) * 100;
    const passed = finalScore >= 50;
    const gotCertificate = weekId === 24 && finalScore >= 70;

    return (
      <div className="max-w-2xl mx-auto mt-20 p-12 bg-white rounded-[3rem] shadow-2xl text-center border border-gray-100">
        {passed ? (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award size={40} />
            </div>
            <h2 className="text-3xl font-black text-gray-900">Examination Passed!</h2>
            <p className="text-gray-500 font-bold mt-2 text-xl">{finalScore.toFixed(0)}%</p>
            
            {gotCertificate ? (
              <div className="mt-6 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <p className="text-blue-700 font-black uppercase text-xs tracking-widest">Congratulations!</p>
                <p className="text-gray-600 font-bold mt-2">You have earned your Professional Certification.</p>
                <button 
                  onClick={() => navigate(`/certificate/${generatedCertId}`)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase transition-all hover:bg-blue-700"
                >
                  View My Certificate
                </button>
              </div>
            ) : (
              <p className="text-gray-400 mt-4">You have unlocked the next phase of your studies.</p>
            )}

            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all"
            >
              Return to Dashboard
            </button>
          </>
        ) : (
          <>
            <AlertCircle size={80} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-gray-900">Examination Failed</h2>
            <p className="text-gray-400 mt-2 text-lg">You scored below the 50% pass mark. Please review the materials and retake the exam.</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-sm tracking-widest"
            >
              Retake Exam
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-10 bg-white rounded-[3rem] shadow-sm border border-gray-50">
      <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
            {weekId === 12 ? 'Midterm Examination' : 'Final Examination'}
          </h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Question {currentQuestion + 1} of {questions.length}</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black">
          <Timer size={20} />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-black text-gray-800 leading-relaxed italic">
          "{questions[currentQuestion].text}"
        </h3>
      </div>

      <div className="grid gap-4">
        {questions[currentQuestion].options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt.isCorrect)}
            className="w-full p-6 bg-gray-50 hover:bg-blue-600 hover:text-white text-left rounded-2xl font-bold transition-all border border-gray-100 group"
          >
            <span className="inline-block w-8 h-8 rounded-lg bg-white text-blue-600 text-center leading-8 mr-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
              {String.fromCharCode(65 + idx)}
            </span>
            {opt.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AcademicExam;