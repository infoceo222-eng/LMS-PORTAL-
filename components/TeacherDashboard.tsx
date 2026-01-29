
import React, { useState, useRef, useEffect } from 'react';
import { Student, Material, Assignment, LiveSession, MaterialType, CalendarEvent, TimetableEvent, LiveClassSchedule, ChatMessage, UserRole } from '../types';

interface TeacherDashboardProps {
  students: Student[];
  materials: Material[];
  assignments: Assignment[];
  calendarEvents: CalendarEvent[];
  timetable: TimetableEvent[];
  liveSchedules: LiveClassSchedule[];
  liveSession: LiveSession;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onUpdateParticipant: (id: string, name: string, role: UserRole, hasCamera: boolean, action: 'JOIN' | 'LEAVE' | 'UPDATE') => void;
  onAddMaterial: (material: Material) => void;
  onGradeAssignment: (id: string, status: 'PASS' | 'FAIL', marks: number, comment: string) => void;
  onToggleLive: (active: boolean, name: string) => void;
  userName: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  students, materials, assignments, calendarEvents, timetable, liveSchedules,
  liveSession, messages, onSendMessage, onUpdateParticipant,
  onAddMaterial, onGradeAssignment, onToggleLive, userName 
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MATERIALS' | 'GRADING' | 'LIVE'>('OVERVIEW');
  const [chatInput, setChatInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState<{title: string, type: MaterialType, content: string}>({
    title: '', type: 'BOOK', content: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartLive = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = media;
      onToggleLive(true, userName);
    } catch (err) { alert("کیمرہ نہیں مل سکا۔"); }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMaterial(prev => ({ ...prev, content: reader.result as string }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitMaterial = () => {
    if (newMaterial.title && newMaterial.content) {
      onAddMaterial({
        ...newMaterial,
        id: 'MAT-'+Date.now(),
        date: new Date().toISOString(),
        uploaderName: userName
      });
      setShowUploadModal(false);
      setNewMaterial({ title: '', type: 'BOOK', content: '' });
    }
  };

  const [gradingState, setGradingState] = useState<{id: string, marks: number, comment: string} | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center text-right">
        <div>
          <h2 className="text-2xl font-bold nastaliq text-blue-900">ٹیچر پورٹل</h2>
          <p className="text-slate-500 font-bold">خوش آمدید، {userName}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUploadModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">نیا مواد اپ لوڈ+</button>
          <button onClick={() => setActiveTab('LIVE')} className={`px-6 py-2 rounded-xl font-bold shadow-lg transition ${liveSession.isActive ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
            {liveSession.isActive ? 'کلاس جاری ہے' : 'لائیو کلاس'}
          </button>
        </div>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border overflow-hidden p-1 gap-1">
        {['OVERVIEW', 'MATERIALS', 'GRADING', 'LIVE'].map(t => (
          <button key={t} onClick={() => setActiveTab(t as any)} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${activeTab === t ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-500'}`}>
            {t === 'OVERVIEW' ? 'جائزہ' : t === 'MATERIALS' ? 'لائبریری' : t === 'GRADING' ? 'گریڈنگ' : 'لائیو کلاس'}
          </button>
        ))}
      </div>

      {activeTab === 'LIVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in zoom-in duration-300">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-950 rounded-3xl overflow-hidden min-h-[500px] flex items-center justify-center relative border-8 border-slate-900 shadow-2xl">
              <video ref={videoRef} autoPlay className="w-full h-full absolute object-cover opacity-60" />
              {!liveSession.isActive && (
                <div className="z-10 text-center text-white px-8">
                  <h3 className="text-4xl font-bold nastaliq mb-8 drop-shadow-lg text-emerald-400">لائیو کلاس شروع کریں</h3>
                  <button onClick={handleStartLive} className="px-12 py-5 rounded-3xl font-bold text-2xl bg-emerald-500 shadow-2xl hover:bg-emerald-600 transition transform hover:scale-105">کیمرہ آن کریں</button>
                </div>
              )}
              {liveSession.isActive && (
                <button onClick={() => onToggleLive(false, '')} className="absolute bottom-6 left-6 z-20 bg-red-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl">کلاس ختم کریں</button>
              )}
            </div>

            {/* Students Gallery for Teacher */}
            <div className="bg-white p-6 rounded-3xl border shadow-sm">
              <h3 className="text-xl font-bold nastaliq mb-6 text-right border-b pb-2">طلباء کی مانیٹرنگ ({liveSession.participants.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {liveSession.participants.map(p => (
                  <div key={p.id} className="flex flex-col items-center group">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl border-4 transition-all duration-300 ${p.hasCamera ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-lg' : 'border-slate-100 bg-slate-50 grayscale'}`}>
                      {p.role === UserRole.STUDENT ? '🎓' : '👤'}
                    </div>
                    <span className="text-xs mt-3 font-bold text-slate-700">{p.name}</span>
                    <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${p.hasCamera ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {p.hasCamera ? 'آن لائن' : 'آف لائن'}
                    </span>
                  </div>
                ))}
                {liveSession.participants.length === 0 && <p className="col-span-full text-center py-10 text-slate-400 italic">کلاس میں ابھی کوئی طالب علم نہیں ہے</p>}
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="bg-white rounded-3xl border shadow-sm flex flex-col h-[700px]">
            <div className="p-4 border-b bg-blue-50 rounded-t-3xl">
              <h4 className="font-bold text-right nastaliq">لائیو کلاس چیٹ</h4>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.senderRole === UserRole.TEACHER ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-bold opacity-50 mb-1">{m.senderName}</span>
                  <div className={`px-4 py-2 rounded-2xl text-xs max-w-[85%] ${m.senderRole === UserRole.TEACHER ? 'bg-blue-600 text-white rounded-tr-none shadow-md' : 'bg-slate-100 rounded-tl-none border'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="p-4 border-t flex gap-2">
              <input 
                className="flex-grow border rounded-xl px-4 py-3 text-sm text-right outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="پیغام لکھیں..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-bold">بھیجیں</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'GRADING' && (
        <div className="bg-white p-8 rounded-3xl border shadow-sm animate-in slide-in-from-right-4 duration-300">
          <h3 className="text-2xl font-bold nastaliq mb-8 text-right border-b pb-4 text-blue-900">اسائنمنٹس گریڈنگ سنٹر</h3>
          <div className="space-y-4">
            {assignments.filter(a => a.status === 'PENDING').map(a => (
              <div key={a.id} className="p-6 border rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-50 transition border-blue-100">
                <div className="text-right flex-grow">
                  <h4 className="font-bold text-lg">{a.studentName}</h4>
                  <p className="text-sm text-slate-500">عنوان: {a.title} | تاریخ: {new Date(a.date).toLocaleDateString('ur-PK')}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => window.open(a.fileContent)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold">فائل دیکھیں</button>
                  <button onClick={() => setGradingState({ id: a.id, marks: 0, comment: '' })} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md">گریڈنگ کریں</button>
                </div>
              </div>
            ))}
            {assignments.filter(a => a.status === 'PENDING').length === 0 && <p className="text-center py-20 text-slate-400 italic">کوئی نئی اسائنمنٹ نہیں ہے</p>}
          </div>
        </div>
      )}

      {gradingState && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl text-right">
            <h3 className="text-2xl font-bold mb-6 nastaliq border-b pb-4">نمبر اور سٹیٹس دیں</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">حاصل کردہ نمبر (0-100)</label>
                <input type="number" className="w-full border p-3 rounded-xl text-center font-bold text-xl" value={gradingState.marks} onChange={e => setGradingState({...gradingState, marks: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">استاد کا تبصرہ</label>
                <textarea className="w-full border p-3 rounded-xl text-right" rows={3} value={gradingState.comment} onChange={e => setGradingState({...gradingState, comment: e.target.value})} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { onGradeAssignment(gradingState.id, 'PASS', gradingState.marks, gradingState.comment); setGradingState(null); }} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg">پاس (PASS)</button>
                <button onClick={() => { onGradeAssignment(gradingState.id, 'FAIL', gradingState.marks, gradingState.comment); setGradingState(null); }} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold text-lg">فیل (FAIL)</button>
              </div>
              <button onClick={() => setGradingState(null)} className="w-full py-3 text-slate-400 font-bold">کینسل</button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl text-right animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold mb-6 nastaliq border-b pb-4">نیا تعلیمی مواد اپ لوڈ کریں</h3>
            <div className="space-y-4">
              <input required placeholder="مواد کا عنوان (مثال: ریاضی کتاب 9)" className="w-full border p-3 rounded-xl" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} />
              <select className="w-full border p-3 rounded-xl" value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value as any})}>
                <option value="BOOK">کتاب (PDF / BOOK)</option>
                <option value="VIDEO">ویڈیو (VIDEO)</option>
                <option value="AUDIO">آڈیو (AUDIO)</option>
                <option value="SLIDE">سلائیڈز / پریزنٹیشن</option>
                <option value="GALLERY">گیلری (IMAGE)</option>
              </select>
              <div className="border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} className={`w-full py-4 rounded-xl font-bold transition ${newMaterial.content ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                  {isUploading ? 'اپ لوڈ ہو رہا ہے...' : newMaterial.content ? 'فائل منتخب ہے ✓' : 'فائل منتخب کریں (Gallery/Files)'}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={submitMaterial} disabled={!newMaterial.title || !newMaterial.content} className="flex-1 bg-emerald-700 text-white py-4 rounded-2xl font-bold disabled:opacity-50">اپ لوڈ کریں</button>
                <button onClick={() => setShowUploadModal(false)} className="bg-slate-100 px-6 py-4 rounded-2xl font-bold">کینسل</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MATERIALS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {materials.filter(m => m.uploaderName === userName).map(m => (
            <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-4 text-blue-600">
                {m.type === 'BOOK' ? '📚' : m.type === 'VIDEO' ? '🎬' : '📄'}
              </div>
              <h4 className="font-bold text-slate-800 line-clamp-1">{m.title}</h4>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{m.type}</p>
              <button className="w-full mt-4 bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition">مواد دیکھیں</button>
            </div>
          ))}
          {materials.filter(m => m.uploaderName === userName).length === 0 && <p className="col-span-full text-center py-20 text-slate-400 italic">آپ نے ابھی تک کوئی مواد اپ لوڈ نہیں کیا</p>}
        </div>
      )}

      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm text-center border-b-4 border-b-blue-600">
            <h4 className="text-slate-400 text-xs font-bold mb-2">نئی اسائنمنٹس</h4>
            <div className="text-4xl font-bold text-blue-900">{assignments.filter(a => a.status === 'PENDING').length}</div>
          </div>
          <div className="bg-white p-8 rounded-3xl border shadow-sm text-center border-b-4 border-b-emerald-600">
            <h4 className="text-slate-400 text-xs font-bold mb-2">لائبریری مواد</h4>
            <div className="text-4xl font-bold text-emerald-900">{materials.filter(m => m.uploaderName === userName).length}</div>
          </div>
          <div className="bg-white p-8 rounded-3xl border shadow-sm text-center border-b-4 border-b-red-600">
            <h4 className="text-slate-400 text-xs font-bold mb-2">لائیو کلاس ٹائم</h4>
            <div className="text-2xl font-bold text-red-900 nastaliq">{liveSession.isActive ? 'جاری ہے' : 'آف لائن'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
