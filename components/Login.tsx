
import React, { useState } from 'react';
import { UserRole, Student, Teacher } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, id: string, name: string) => void;
  students: Student[];
  teachers: Teacher[];
}

const Login: React.FC<LoginProps> = ({ onLogin, students, teachers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Login
    if (username.toLowerCase() === 'admin' && password === '12345') {
      onLogin(UserRole.ADMIN, 'admin-id', 'ہیڈ ماسٹر / ایڈمن');
      return;
    }

    // Teacher Login
    const teacher = teachers.find(t => t.teacherId === username && t.password === password);
    if (teacher) {
      onLogin(UserRole.TEACHER, teacher.id, teacher.name);
      return;
    }

    // Student Login
    const student = students.find(s => s.rollNumber === username && s.password === password);
    if (student) {
      onLogin(UserRole.STUDENT, student.id, student.name);
      return;
    }

    setError('غلط صارف نام یا پاس ورڈ۔ اگر آپ کا اکاؤنٹ نہیں کھل رہا تو ہیڈ ماسٹر آفس سے رجوع کریں۔');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 mt-10 relative overflow-hidden transition-all duration-500">
      {/* Decorative background element */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full opacity-50 blur-2xl"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full opacity-30 blur-2xl"></div>
      
      <div className="text-center mb-10 relative z-10">
        <div className="w-24 h-24 bg-emerald-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-5xl shadow-xl transform hover:rotate-6 transition-transform cursor-pointer">
           <span className="text-white drop-shadow-md">🏫</span>
        </div>
        <h2 className="text-3xl font-bold nastaliq text-emerald-900 drop-shadow-sm">ایل ایم ایس پورٹل</h2>
        <p className="text-slate-400 mt-2 font-bold text-[10px] uppercase tracking-[0.2em]">Govt High School Chiragh Din Wala</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide text-right">آئی ڈی / رول نمبر (ID/Roll No)</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-right font-medium placeholder-slate-300"
            placeholder="Username / ID"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide text-right">پاس ورڈ (Password)</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-right font-medium placeholder-slate-300"
            placeholder="Password"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-[11px] font-bold text-center border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        <button 
          type="submit"
          className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-5 rounded-2xl shadow-xl transition transform active:scale-95 text-lg hover:shadow-emerald-200"
        >
          لاگ ان کریں
        </button>

        <div className="flex flex-col gap-2 mt-4">
          <button 
            type="button"
            onClick={() => setShowContactModal(true)}
            className="w-full py-4 bg-slate-50 rounded-2xl text-emerald-700 text-xs font-bold hover:bg-emerald-50 transition-all nastaliq border border-emerald-100 flex items-center justify-center gap-2"
          >
            <span>📞</span>
            اکاؤنٹ نہیں کھل رہا؟ ہیڈ ماسٹر آفس سے رابطہ کریں
          </button>
        </div>
      </form>

      {/* Headmaster Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-right animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 text-4xl mx-auto shadow-inner">☎️</div>
            <h3 className="text-2xl font-bold nastaliq mb-4 text-slate-800 border-b-2 border-emerald-500 pb-2 inline-block">رابطہ کی معلومات</h3>
            <div className="space-y-4 mb-10 mt-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="font-mono font-bold text-emerald-700 tracking-wider">049-1234567</span>
                <span className="text-sm font-bold nastaliq">آفس نمبر:</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-800">08:00 AM - 02:00 PM</span>
                <span className="text-sm font-bold nastaliq">اوقات:</span>
              </div>
              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                  اگر آپ اپنا پاس ورڈ یا آئی ڈی بھول گئے ہیں تو برائے کرم اپنے رول نمبر اور شناختی کارڈ کے ساتھ اسکول آفس تشریف لائیں۔
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowContactModal(false)}
              className="w-full bg-emerald-800 text-white py-5 rounded-[2rem] font-bold text-sm shadow-xl hover:bg-emerald-900 transition transform active:scale-95"
            >
              شکریہ، سمجھ گیا
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-slate-50 text-[10px] text-center text-slate-400 font-bold leading-relaxed relative z-10">
        گورنمنٹ ہائی سکول چراغ دین والا قصور <br/>
        آئی ٹی ڈیپارٹمنٹ - تمام حقوق محفوظ ہیں۔
      </div>
    </div>
  );
};

export default Login;
