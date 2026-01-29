
import React, { useState, useRef, useEffect } from 'react';
import { Student, Material, Assignment, LiveSession, CalendarEvent, TimetableEvent, LiveClassSchedule, ChatMessage, UserRole } from '../types';

interface StudentDashboardProps {
  student: Student;
  materials: Material[];
  assignments: Assignment[];
  calendarEvents: CalendarEvent[];
  timetable: TimetableEvent[];
  liveSchedules: LiveClassSchedule[];
  liveSession: LiveSession;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onUpdateParticipant: (id: string, name: string, role: UserRole, hasCamera: boolean, action: 'JOIN' | 'LEAVE' | 'UPDATE') => void;
  onSubmitAssignment: (assignment: Assignment) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  student, materials, assignments, calendarEvents, timetable, liveSchedules, 
  liveSession, messages, onSendMessage, onUpdateParticipant,
  onSubmitAssignment 
}) => {
  const [activeTab, setActiveTab] = useState<'LEARNING' | 'LIBRARY' | 'SCHEDULE' | 'RESULTS'>('LEARNING');
  const [isAttendingLive, setIsAttendingLive] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [assignmentForm, setAssignmentForm] = useState({ title: '', file: '' });
  const [isUploading, setIsUploading] = useState(false);
  
  const studentStreamRef = useRef<MediaStream | null>(null);
  const studentVideoRef = useRef<HTMLVideoElement>(null);
  const assignFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAttendingLive) {
      onUpdateParticipant(student.id, student.name, UserRole.STUDENT, hasCamera, 'JOIN');
    } else {
      onUpdateParticipant(student.id, student.name, UserRole.STUDENT, false, 'LEAVE');
    }
  }, [isAttendingLive, hasCamera]);

  const toggleCamera = async () => {
    if (!hasCamera) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        studentStreamRef.current = stream;
        if (studentVideoRef.current) studentVideoRef.current.srcObject = stream;
        setHasCamera(true);
      } catch (err) { alert("کیمرہ شروع نہیں ہو سکا۔"); }
    } else {
      if (studentStreamRef.current) {
        studentStreamRef.current.getTracks().forEach(t => t.stop());
        studentStreamRef.current = null;
      }
      setHasCamera(false);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleAssignmentFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAssignmentForm(prev => ({ ...prev, file: reader.result as string }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitAssignment = () => {
    if (assignmentForm.title && assignmentForm.file) {
      onSubmitAssignment({
        id: 'ASG-'+Date.now(),
        studentId: student.id,
        studentName: student.name,
        title: assignmentForm.title,
        fileContent: assignmentForm.file,
        status: 'PENDING',
        date: new Date().toISOString()
      });
      setAssignmentForm({ title: '', file: '' });
      alert("اسائنمنٹ کامیابی سے جمع کر دی گئی ہے!");
    }
  };

  if (isAttendingLive && liveSession.isActive) {
    return (
      <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col md:flex-row text-white overflow-hidden animate-in fade-in duration-500">
        <div className="flex-grow relative flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-black">
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <button onClick={() => { setIsAttendingLive(false); setHasCamera(false); }} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-2xl font-bold transition">کلاس سے باہر جائیں</button>
            <div className="bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-right">
              <p className="text-xs text-emerald-400 font-bold uppercase animate-pulse">Connected to Live Session</p>
              <h3 className="text-lg font-bold nastaliq">استاد: جناب {liveSession.teacherName}</h3>
            </div>
          </div>

          <div className="w-full max-w-4xl aspect-video bg-slate-900 rounded-[3rem] flex items-center justify-center relative border border-white/10 shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden">
             <div className="text-8xl opacity-10 animate-pulse">📡</div>
             <p className="absolute bottom-12 text-slate-500 italic">ٹیچر کی ویڈیو یہاں نظر آئے گی...</p>
          </div>

          <div className="absolute bottom-10 right-10 w-64 aspect-video bg-black rounded-3xl border-2 border-emerald-500/50 shadow-2xl overflow-hidden group">
            <video ref={studentVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {!hasCamera && <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 bg-slate-800">میرا کیمرہ بند ہے</div>}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <button onClick={toggleCamera} className={`px-4 py-2 rounded-xl font-bold text-xs ${hasCamera ? 'bg-red-600' : 'bg-emerald-600'}`}>
                {hasCamera ? 'کیمرہ بند کریں' : 'کیمرہ کھولیں'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[400px] bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col h-full">
          <div className="p-6 border-b border-white/10 bg-black/20">
             <h3 className="text-xl font-bold nastaliq text-emerald-400">لائیو کلاس چیٹ</h3>
          </div>
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map(m => (
              <div key={m.id} className={`flex flex-col ${m.senderId === student.id ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] font-bold opacity-40 mb-1">{m.senderName}</span>
                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] ${m.senderId === student.id ? 'bg-emerald-600 text-white rounded-tr-none shadow-md' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="p-6 border-t border-white/10 bg-black/20 flex gap-2">
            <input 
              className="flex-grow bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm text-right focus:ring-2 focus:ring-emerald-500 outline-none text-white shadow-inner"
              placeholder="ٹیچر سے سوال پوچھیں..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-emerald-700 transition shadow-lg">ارسال</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {liveSession.isActive && (
        <div className="bg-red-600 text-white p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row justify-between items-center text-right animate-pulse border-4 border-red-500">
           <button onClick={() => setIsAttendingLive(true)} className="bg-white text-red-600 px-10 py-4 rounded-3xl font-bold text-xl hover:scale-105 transition active:scale-95 shadow-xl order-2 md:order-1">لائیو کلاس میں شامل ہوں</button>
           <div className="flex items-center gap-6 order-1 md:order-2">
             <div className="text-right">
               <h3 className="font-bold text-3xl nastaliq mb-2">جناب {liveSession.teacherName} کی لائیو کلاس جاری ہے!</h3>
               <p className="text-sm opacity-80">آپ کا کیمرہ اور آواز چیٹ کے لیے استعمال ہو سکتی ہے</p>
             </div>
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl shadow-inner border-2 border-white/20">🔴</div>
           </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-200 p-1">
        <div className="bg-emerald-800 h-40 rounded-[2.8rem]" />
        <div className="px-10 pb-10 flex flex-col md:flex-row gap-8 items-end -mt-20 text-right">
          <div className="flex-1">
            <h2 className="text-4xl font-bold nastaliq text-emerald-900 mb-2">{student.name}</h2>
            <p className="text-slate-500 font-bold text-lg">کلاس: {student.class} | رول نمبر: {student.rollNumber}</p>
          </div>
          <div className="w-40 h-40 bg-white rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center">
            {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : <span className="text-7xl">🎓</span>}
          </div>
        </div>
      </div>

      <div className="flex bg-white rounded-3xl shadow-sm border overflow-hidden p-1.5 gap-1.5">
        {['LEARNING', 'LIBRARY', 'SCHEDULE', 'RESULTS'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${activeTab === t ? 'bg-emerald-700 text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-50 text-slate-500'}`}>
            {t === 'LEARNING' ? 'اسائنمنٹس' : t === 'LIBRARY' ? 'لائبریری' : t === 'SCHEDULE' ? 'ٹائم ٹیبل' : 'رزلٹ کارڈ'}
          </button>
        ))}
      </div>

      {activeTab === 'LEARNING' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="bg-emerald-700 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-end text-right">
            <h3 className="text-3xl font-bold nastaliq mb-6 border-b border-white/20 pb-4 w-full">نئی اسائنمنٹ جمع کروائیں</h3>
            <div className="space-y-6 w-full">
              <div>
                <label className="block text-sm font-bold mb-2">اسائنمنٹ کا عنوان</label>
                <input required placeholder="عنوان لکھیں..." className="w-full p-4 rounded-2xl text-slate-900 text-right outline-none focus:ring-4 focus:ring-emerald-400" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} />
              </div>
              <div className="bg-white/10 border-2 border-dashed border-white/30 p-8 rounded-3xl text-center group hover:bg-white/20 transition cursor-pointer" onClick={() => assignFileInputRef.current?.click()}>
                <input type="file" ref={assignFileInputRef} className="hidden" onChange={handleAssignmentFile} />
                <div className="text-4xl mb-4 group-hover:scale-110 transition">📁</div>
                <p className="text-sm font-bold">{isUploading ? 'اپ لوڈ ہو رہا ہے...' : assignmentForm.file ? 'فائل منتخب ہے ✓' : 'گیلری سے فائل یا ڈاکومنٹ منتخب کریں'}</p>
              </div>
              <button onClick={submitAssignment} disabled={!assignmentForm.title || !assignmentForm.file} className="w-full bg-white text-emerald-800 py-5 rounded-[2rem] font-bold text-xl shadow-xl hover:bg-emerald-50 transition active:scale-95 disabled:opacity-50">ارسال کریں (SUBMIT)</button>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border shadow-sm text-right">
            <h3 className="text-2xl font-bold nastaliq mb-6 border-b pb-4 text-emerald-800">حالیہ اسائنمنٹس کا سٹیٹس</h3>
            <div className="space-y-4">
              {assignments.map(a => (
                <div key={a.id} className="p-5 border rounded-2xl flex justify-between items-center hover:bg-slate-50 transition border-slate-100">
                  <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${a.status === 'PASS' ? 'bg-emerald-100 text-emerald-600' : a.status === 'FAIL' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {a.status === 'PENDING' ? 'چیک ہو رہی ہے' : a.status}
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">{a.title}</p>
                    <p className="text-[10px] text-slate-400">جمع کرانے کی تاریخ: {new Date(a.date).toLocaleDateString('ur-PK')}</p>
                  </div>
                </div>
              ))}
              {assignments.length === 0 && <p className="text-center py-20 text-slate-400 italic">کوئی اسائنمنٹ نہیں ہے</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'LIBRARY' && (
        <div className="animate-in fade-in duration-500">
          <h3 className="text-3xl font-bold nastaliq mb-8 text-right text-emerald-900 border-r-8 border-emerald-600 pr-6">ڈیجیٹل لائبریری اور بکس</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {materials.map(m => (
              <div key={m.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-50 flex flex-col items-center text-center hover:shadow-2xl hover:-translate-y-2 transition duration-300 group">
                <div className="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-4xl mb-4 text-emerald-600 group-hover:rotate-6 transition duration-300 shadow-inner">
                  {m.type === 'BOOK' ? '📚' : m.type === 'VIDEO' ? '🎬' : m.type === 'AUDIO' ? '🎧' : '📄'}
                </div>
                <h4 className="font-bold text-slate-800 mb-1 line-clamp-2 nastaliq text-lg">{m.title}</h4>
                <p className="text-[10px] text-slate-400 mb-4 font-bold opacity-60 uppercase">{m.type}</p>
                <button className="w-full bg-emerald-600 text-white py-3 rounded-2xl text-xs font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition">کھولیں / دیکھیں</button>
              </div>
            ))}
            {materials.length === 0 && <p className="col-span-full text-center py-20 text-slate-400 italic">لائبریری میں تاحال کوئی مواد اپ لوڈ نہیں کیا گیا</p>}
          </div>
        </div>
      )}

      {activeTab === 'RESULTS' && (
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 animate-in zoom-in duration-500 text-right">
          <div className="flex justify-between items-center mb-10 border-b pb-6">
             <div className="bg-emerald-100 text-emerald-800 px-6 py-2 rounded-2xl font-bold">تعلیمی سال 2024-25</div>
             <h3 className="text-4xl font-bold nastaliq text-emerald-900">میرا رزلٹ کارڈ</h3>
          </div>
          
          <div className="space-y-6">
            {assignments.filter(a => a.status !== 'PENDING').map(a => (
              <div key={a.id} className="p-8 border-2 border-slate-50 rounded-[2.5rem] hover:border-emerald-200 transition bg-slate-50/30">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-3xl font-bold text-emerald-800">{a.marks}/100</div>
                  <h4 className="text-2xl font-bold text-slate-800">{a.title}</h4>
                </div>
                <div className="flex justify-between items-end">
                   <div className={`px-6 py-2 rounded-2xl font-bold ${a.status === 'PASS' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                     سٹیٹس: {a.status}
                   </div>
                   <div className="max-w-md text-slate-500 italic bg-white p-4 rounded-2xl border text-sm">
                      <p className="font-bold text-xs mb-1 text-slate-400">استاد کا تبصرہ:</p>
                      "{a.teacherComment || 'کوئی تبصرہ موجود نہیں'}"
                   </div>
                </div>
              </div>
            ))}
            {assignments.filter(a => a.status !== 'PENDING').length === 0 && (
              <div className="py-20 text-center text-slate-400 italic">
                <p className="text-6xl mb-4">⏳</p>
                <p className="nastaliq text-2xl">ابھی تک کوئی رزلٹ جاری نہیں ہوا...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
