
import React, { useState, useRef, useEffect } from 'react';
import { Student, Teacher, Assignment, Material, CalendarEvent, TimetableEvent, LiveClassSchedule, LiveSession, ChatMessage, UserRole, MaterialType } from '../types';

interface AdminDashboardProps {
  students: Student[];
  teachers: Teacher[];
  assignments: Assignment[];
  materials: Material[];
  calendarEvents: CalendarEvent[];
  timetable: TimetableEvent[];
  liveSchedules: LiveClassSchedule[];
  liveSession: LiveSession;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onAddStudent: (student: Student) => void;
  onRemoveStudent: (id: string) => void;
  onAddTeacher: (teacher: Teacher) => void;
  onRemoveTeacher: (id: string) => void;
  onAddCalendarEvent: (event: CalendarEvent) => void;
  onRemoveCalendarEvent: (id: string) => void;
  onAddTimetableEvent: (event: TimetableEvent) => void;
  onRemoveTimetableEvent: (id: string) => void;
  onAddLiveSchedule: (schedule: LiveClassSchedule) => void;
  onRemoveLiveSchedule: (id: string) => void;
  onAddMaterial: (material: Material) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  students, teachers, assignments, materials, calendarEvents, timetable, liveSchedules,
  liveSession, messages, onSendMessage,
  onAddStudent, onRemoveStudent, onAddTeacher, onRemoveTeacher,
  onAddCalendarEvent, onRemoveCalendarEvent, onAddTimetableEvent, onRemoveTimetableEvent,
  onAddLiveSchedule, onRemoveLiveSchedule, onAddMaterial
}) => {
  const [activeView, setActiveView] = useState<'TEACHERS' | 'STUDENTS' | 'CALENDAR' | 'TIMETABLE' | 'LIVE_MONITOR' | 'LIBRARY' | 'STATS'>('STATS');
  const [showForm, setShowForm] = useState<null | 'TEACHER' | 'STUDENT' | 'CALENDAR' | 'TIMETABLE' | 'LIBRARY'>(null);
  const [chatInput, setChatInput] = useState('');
  
  const [studentData, setStudentData] = useState({ name: '', fatherName: '', class: '', rollNumber: '', password: '' });
  const [teacherData, setTeacherData] = useState({ name: '', teacherId: '', subject: '', password: '' });
  const [libData, setLibData] = useState<{title: string, type: MaterialType, content: string}>({ title: '', type: 'BOOK', content: '' });
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate a professional Teacher ID automatically when the form opens
  useEffect(() => {
    if (showForm === 'TEACHER') {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const year = new Date().getFullYear();
      setTeacherData(prev => ({ 
        ...prev, 
        teacherId: `GHS-T-${year}-${randomNum}`,
        password: Math.random().toString(36).slice(-6) // Generate a random initial password
      }));
    }
  }, [showForm]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLibData(prev => ({ ...prev, content: reader.result as string }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitForm = (type: string, e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'STUDENT') {
      onAddStudent({ ...studentData, id: 'ST-'+Date.now(), createdAt: new Date().toISOString() });
      setStudentData({ name: '', fatherName: '', class: '', rollNumber: '', password: '' });
    } else if (type === 'TEACHER') {
      onAddTeacher({ ...teacherData, id: 'TC-'+Date.now(), createdAt: new Date().toISOString() });
      setTeacherData({ name: '', teacherId: '', subject: '', password: '' });
    } else if (type === 'LIBRARY') {
      onAddMaterial({ ...libData, id: 'MAT-'+Date.now(), date: new Date().toISOString(), uploaderName: 'ایڈمن' });
      setLibData({ title: '', type: 'BOOK', content: '' });
    }
    setShowForm(null);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-emerald-900 text-white p-8 rounded-[3rem] shadow-2xl border-b-8 border-emerald-950 flex flex-col md:flex-row justify-between items-center gap-6 text-right relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="z-10">
          <h2 className="text-4xl font-bold nastaliq mb-2">ایڈمنسٹریٹر پورٹل</h2>
          <p className="opacity-80 font-bold">گورنمنٹ ہائی سکول چراغ دین والا - مین برانچ قصور</p>
        </div>
        <div className="flex flex-wrap gap-3 z-10 justify-center">
          <button onClick={() => setShowForm('TEACHER')} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition transform active:scale-95">نیا استاد شامل کریں +</button>
          <button onClick={() => setShowForm('STUDENT')} className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition transform active:scale-95">نیا طالب علم +</button>
          <button onClick={() => setShowForm('LIBRARY')} className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition transform active:scale-95">لائبریری اپ لوڈ +</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { id: 'STATS', label: 'رپورٹ', icon: '📊' },
          { id: 'TEACHERS', label: 'اساتذہ', icon: '👨‍🏫' },
          { id: 'STUDENTS', label: 'طلباء', icon: '🎓' },
          { id: 'TIMETABLE', label: 'ٹائم ٹیبل', icon: '📅' },
          { id: 'CALENDAR', label: 'کیلنڈر', icon: '📆' },
          { id: 'LIBRARY', label: 'لائبریری', icon: '📚' },
          { id: 'LIVE_MONITOR', label: 'لائیو کلاس', icon: '🔴' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id as any)} className={`p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2 ${activeView === tab.id ? 'bg-emerald-800 text-white border-emerald-900 shadow-xl scale-105' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 shadow-sm'}`}>
            <span className="text-3xl">{tab.icon}</span>
            <h4 className="font-bold text-sm nastaliq">{tab.label}</h4>
          </button>
        ))}
      </div>

      {/* Teachers View */}
      {activeView === 'TEACHERS' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border overflow-hidden animate-in fade-in duration-300">
          <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
            <h3 className="text-xl font-bold nastaliq">اساتذہ کی فہرست ({teachers.length})</h3>
            <button onClick={() => setShowForm('TEACHER')} className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold">نیا ٹیچر شامل کریں</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-5 text-sm">نام</th>
                  <th className="p-5 text-sm">آئی ڈی (ID)</th>
                  <th className="p-5 text-sm">مضمون</th>
                  <th className="p-5 text-sm">پاس ورڈ</th>
                  <th className="p-5 text-sm">ایکشن</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id} className="border-t hover:bg-slate-50 transition">
                    <td className="p-5 font-bold text-slate-800">{t.name}</td>
                    <td className="p-5 text-sm font-mono text-blue-600">{t.teacherId}</td>
                    <td className="p-5 text-sm">{t.subject}</td>
                    <td className="p-5 text-sm opacity-50">{t.password}</td>
                    <td className="p-5">
                      <button onClick={() => onRemoveTeacher(t.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Students View */}
      {activeView === 'STUDENTS' && (
        <div className="bg-white rounded-[2.5rem] shadow-xl border overflow-hidden animate-in fade-in duration-300">
          <div className="bg-emerald-600 p-6 flex justify-between items-center text-white">
            <h3 className="text-xl font-bold nastaliq">طلباء کی فہرست ({students.length})</h3>
            <button onClick={() => setShowForm('STUDENT')} className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold">نیا طالب علم شامل کریں</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-5 text-sm">نام</th>
                  <th className="p-5 text-sm">رول نمبر</th>
                  <th className="p-5 text-sm">کلاس</th>
                  <th className="p-5 text-sm">پاس ورڈ</th>
                  <th className="p-5 text-sm">ایکشن</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id} className="border-t hover:bg-slate-50 transition">
                    <td className="p-5 font-bold text-slate-800">{s.name}</td>
                    <td className="p-5 text-sm font-mono text-emerald-600">{s.rollNumber}</td>
                    <td className="p-5 text-sm">{s.class}</td>
                    <td className="p-5 text-sm opacity-50">{s.password}</td>
                    <td className="p-5">
                      <button onClick={() => onRemoveStudent(s.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-600 hover:text-white transition">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Library Management */}
      {activeView === 'LIBRARY' && (
        <div className="bg-white rounded-[2.5rem] p-8 border shadow-xl animate-in zoom-in duration-300 text-right">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
             <button onClick={() => setShowForm('LIBRARY')} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold">مواد اپ لوڈ کریں +</button>
             <h3 className="text-2xl font-bold nastaliq text-emerald-900">ڈیجیٹل لائبریری کنٹرول</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {materials.map(m => (
              <div key={m.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center group relative overflow-hidden">
                <div className="text-5xl mb-4 transition group-hover:scale-110">
                   {m.type === 'BOOK' ? '📚' : m.type === 'VIDEO' ? '🎬' : m.type === 'AUDIO' ? '🎧' : '📄'}
                </div>
                <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{m.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">{m.type}</p>
                <div className="mt-4 flex gap-2 w-full">
                  <button onClick={() => window.open(m.content)} className="flex-1 bg-white border border-emerald-200 text-emerald-700 py-2 rounded-xl text-[10px] font-bold">دیکھیں</button>
                  <button className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[10px] font-bold">حذف</button>
                </div>
              </div>
            ))}
            {materials.length === 0 && <p className="col-span-full py-20 text-center text-slate-400">لائبریری میں ابھی کچھ نہیں ہے...</p>}
          </div>
        </div>
      )}

      {/* Forms Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl text-right animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-8 nastaliq border-b pb-4">
              {showForm === 'TEACHER' ? 'نیا استاد اکاؤنٹ' : showForm === 'STUDENT' ? 'نیا طالب علم اکاؤنٹ' : 'لائبریری مواد اپ لوڈ'}
            </h3>
            
            <form onSubmit={(e) => submitForm(showForm, e)} className="space-y-5">
              {showForm === 'TEACHER' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4 text-center">
                    <p className="text-xs font-bold text-blue-500 uppercase mb-1">Generated ID</p>
                    <p className="text-2xl font-mono font-bold text-blue-900 tracking-wider">{teacherData.teacherId}</p>
                  </div>
                  <input required placeholder="استاد کا پورا نام" className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-blue-500" value={teacherData.name} onChange={e => setTeacherData({...teacherData, name: e.target.value})} />
                  <input required placeholder="مضمون (Subject)" className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-blue-500" value={teacherData.subject} onChange={e => setTeacherData({...teacherData, subject: e.target.value})} />
                  <div className="relative">
                    <input required placeholder="پاس ورڈ" className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-blue-500" type="text" value={teacherData.password} onChange={e => setTeacherData({...teacherData, password: e.target.value})} />
                    <p className="text-[10px] text-slate-400 mt-1">خودکار پاس ورڈ تیار کیا گیا ہے، آپ اسے تبدیل کر سکتے ہیں۔</p>
                  </div>
                </>
              )}

              {showForm === 'STUDENT' && (
                <>
                  <input required placeholder="طالب علم کا نام" className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-emerald-500" value={studentData.name} onChange={e => setStudentData({...studentData, name: e.target.value})} />
                  <input required placeholder="رول نمبر" className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-emerald-500" value={studentData.rollNumber} onChange={e => setStudentData({...studentData, rollNumber: e.target.value})} />
                  <input required placeholder="کلاس" className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-emerald-500" value={studentData.class} onChange={e => setStudentData({...studentData, class: e.target.value})} />
                  <input required placeholder="پاس ورڈ" className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-emerald-500" type="text" value={studentData.password} onChange={e => setStudentData({...studentData, password: e.target.value})} />
                </>
              )}

              {showForm === 'LIBRARY' && (
                <>
                  <input required placeholder="مواد کا عنوان" className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-orange-500" value={libData.title} onChange={e => setLibData({...libData, title: e.target.value})} />
                  <select className="w-full border p-4 rounded-2xl text-right outline-none focus:ring-2 focus:ring-orange-500" value={libData.type} onChange={e => setLibData({...libData, type: e.target.value as any})}>
                    <option value="BOOK">کتاب (PDF)</option>
                    <option value="VIDEO">ویڈیو (Video)</option>
                    <option value="AUDIO">آڈیو (Audio)</option>
                    <option value="SLIDE">سلائیڈز (Slides)</option>
                  </select>
                  <div className="border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center bg-slate-50 group hover:border-emerald-400 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-slate-400 font-bold">{isUploading ? 'اپ لوڈ ہو رہا ہے...' : libData.content ? 'فائل منتخب ہے ✓' : 'گیلری سے فائل منتخب کریں'}</p>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-6">
                <button type="submit" className="flex-1 bg-emerald-700 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-800 transition transform active:scale-95">محفوظ کریں</button>
                <button type="button" onClick={() => setShowForm(null)} className="bg-slate-100 px-8 py-4 rounded-2xl font-bold hover:bg-slate-200 transition">کینسل</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Monitor View */}
      {activeView === 'LIVE_MONITOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-950 rounded-[3rem] p-8 min-h-[600px] border-8 border-slate-900 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 text-white z-10">
                <span className="bg-red-600 px-4 py-1.5 rounded-full text-xs font-bold animate-pulse tracking-widest">LIVE BROADCAST</span>
                <h3 className="text-2xl font-bold nastaliq">مانیٹرنگ: {liveSession.isActive ? liveSession.teacherName : 'کلاس آف لائن ہے'}</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-grow content-start z-10">
                {liveSession.isActive && (
                  <div className="col-span-2 row-span-2 bg-slate-900 rounded-[2rem] overflow-hidden relative border-4 border-emerald-500 shadow-2xl group ring-4 ring-emerald-500/20">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 text-9xl">👨‍🏫</div>
                    <div className="absolute inset-0 flex items-center justify-center text-white/40 italic">ٹیچر کیمرہ فیڈ</div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 p-4 text-center font-bold text-white nastaliq">{liveSession.teacherName}</div>
                  </div>
                )}

                {liveSession.participants.map(p => (
                  <div key={p.id} className="bg-slate-800 rounded-3xl aspect-video overflow-hidden relative border-2 border-white/5 hover:border-emerald-400 transition group shadow-lg">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 text-5xl">{p.role === UserRole.STUDENT ? '🎓' : '👤'}</div>
                    {p.hasCamera ? (
                      <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center italic text-white/30 text-[8px]">کیمرہ آن ہے</div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/20 italic">کیمرہ بند</div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-[10px] text-white text-center font-bold">{p.name}</div>
                  </div>
                ))}

                {!liveSession.isActive && (
                  <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-500 gap-4">
                    <span className="text-7xl opacity-20">📡</span>
                    <p className="nastaliq text-2xl">فی الحال کوئی لائیو کلاس جاری نہیں ہے</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border shadow-xl flex flex-col h-[650px] overflow-hidden">
            <div className="p-6 border-b bg-slate-50">
              <h4 className="font-bold text-right nastaliq text-emerald-800">کلاس روم چیٹ مانیٹر</h4>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.senderRole === UserRole.ADMIN ? 'items-start' : 'items-end'}`}>
                  <span className="text-[10px] font-bold opacity-40 mb-1">{m.senderName} ({m.senderRole})</span>
                  <div className={`px-4 py-2 rounded-2xl text-xs shadow-sm ${m.senderRole === UserRole.ADMIN ? 'bg-emerald-100 text-emerald-900 rounded-tl-none' : 'bg-slate-100 rounded-tr-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="p-6 border-t flex gap-2 bg-slate-50">
              <input className="flex-grow border rounded-2xl px-4 py-3 text-sm text-right outline-none focus:ring-2 focus:ring-emerald-500" placeholder="پیغام لکھیں..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
              <button type="submit" className="bg-emerald-600 text-white px-5 py-3 rounded-2xl text-xs font-bold hover:bg-emerald-700 transition">ارسال</button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {activeView === 'STATS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
           <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-emerald-600 text-center hover:shadow-2xl transition">
              <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs">کل طلباء</h4>
              <div className="text-5xl font-bold text-emerald-900">{students.length}</div>
           </div>
           <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-blue-600 text-center hover:shadow-2xl transition">
              <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs">کل اساتذہ</h4>
              <div className="text-5xl font-bold text-blue-900">{teachers.length}</div>
           </div>
           <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-orange-600 text-center hover:shadow-2xl transition">
              <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs">لائبریری کتب</h4>
              <div className="text-5xl font-bold text-orange-900">{materials.length}</div>
           </div>
           <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-red-600 text-center hover:shadow-2xl transition">
              <h4 className="text-slate-400 font-bold mb-2 uppercase text-xs">لائیو سٹیٹس</h4>
              <div className="text-2xl font-bold text-red-600 nastaliq">{liveSession.isActive ? 'جاری ہے' : 'آف لائن'}</div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
