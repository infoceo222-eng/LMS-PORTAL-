
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, Student, Teacher, AuthState, Material, Assignment, LiveSession, CalendarEvent, TimetableEvent, LiveClassSchedule, ChatMessage } from './types';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null });
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [timetable, setTimetable] = useState<TimetableEvent[]>([]);
  const [liveSchedules, setLiveSchedules] = useState<LiveClassSchedule[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [liveSession, setLiveSession] = useState<LiveSession>({ 
    isActive: false, 
    teacherName: '', 
    participants: [] 
  });

  useEffect(() => {
    const saved = (key: string) => localStorage.getItem(key);
    if (saved('ghs_students')) setStudents(JSON.parse(saved('ghs_students')!));
    if (saved('ghs_teachers')) setTeachers(JSON.parse(saved('ghs_teachers')!));
    if (saved('ghs_materials')) setMaterials(JSON.parse(saved('ghs_materials')!));
    if (saved('ghs_assignments')) setAssignments(JSON.parse(saved('ghs_assignments')!));
    if (saved('ghs_calendar')) setCalendarEvents(JSON.parse(saved('ghs_calendar')!));
    if (saved('ghs_timetable')) setTimetable(JSON.parse(saved('ghs_timetable')!));
    if (saved('ghs_live_schedules')) setLiveSchedules(JSON.parse(saved('ghs_live_schedules')!));
    if (saved('ghs_auth')) setAuth(JSON.parse(saved('ghs_auth')!));
  }, []);

  useEffect(() => { localStorage.setItem('ghs_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('ghs_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('ghs_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('ghs_assignments', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('ghs_calendar', JSON.stringify(calendarEvents)); }, [calendarEvents]);
  useEffect(() => { localStorage.setItem('ghs_timetable', JSON.stringify(timetable)); }, [timetable]);
  useEffect(() => { localStorage.setItem('ghs_live_schedules', JSON.stringify(liveSchedules)); }, [liveSchedules]);
  useEffect(() => { localStorage.setItem('ghs_auth', JSON.stringify(auth)); }, [auth]);

  const handleLogin = (role: UserRole, id: string, name: string) => setAuth({ user: { role, id, name } });
  const handleLogout = () => setAuth({ user: null });

  const addStudent = (student: Student) => setStudents(prev => [...prev, student]);
  const removeStudent = (id: string) => setStudents(prev => prev.filter(s => s.id !== id));
  const addTeacher = (teacher: Teacher) => setTeachers(prev => [...prev, teacher]);
  const removeTeacher = (id: string) => setTeachers(prev => prev.filter(t => t.id !== id));
  
  const addMaterial = (material: Material) => setMaterials(prev => [material, ...prev]);
  const addCalendarEvent = (event: CalendarEvent) => setCalendarEvents(prev => [...prev, event]);
  const removeCalendarEvent = (id: string) => setCalendarEvents(prev => prev.filter(e => e.id !== id));

  const addTimetableEvent = (event: TimetableEvent) => setTimetable(prev => [...prev, event]);
  const removeTimetableEvent = (id: string) => setTimetable(prev => prev.filter(e => e.id !== id));

  const addLiveSchedule = (schedule: LiveClassSchedule) => setLiveSchedules(prev => [...prev, schedule]);
  const removeLiveSchedule = (id: string) => setLiveSchedules(prev => prev.filter(s => s.id !== id));

  const submitAssignment = (assignment: Assignment) => setAssignments(prev => [assignment, ...prev]);
  const gradeAssignment = (id: string, status: 'PASS' | 'FAIL', marks: number, comment: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status, marks, teacherComment: comment } : a));
  };

  const sendMessage = (text: string) => {
    if (!auth.user) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: auth.user.id,
      senderName: auth.user.name,
      senderRole: auth.user.role,
      text,
      timestamp: new Date().toLocaleTimeString('ur-PK')
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleLive = (active: boolean, name: string) => {
    setLiveSession(prev => ({ 
      ...prev, 
      isActive: active, 
      teacherName: active ? name : '', 
      startTime: active ? new Date().toISOString() : undefined,
      participants: active ? prev.participants : [] 
    }));
    if (!active) setMessages([]); // Clear chat when session ends
  };

  const updateParticipant = (id: string, name: string, role: UserRole, hasCamera: boolean, action: 'JOIN' | 'LEAVE' | 'UPDATE') => {
    setLiveSession(prev => {
      let newParticipants = [...prev.participants];
      if (action === 'JOIN' || action === 'UPDATE') {
        const index = newParticipants.findIndex(p => p.id === id);
        if (index > -1) {
          newParticipants[index] = { id, name, role, hasCamera };
        } else {
          newParticipants.push({ id, name, role, hasCamera });
        }
      } else if (action === 'LEAVE') {
        newParticipants = newParticipants.filter(p => p.id !== id);
      }
      return { ...prev, participants: newParticipants };
    });
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar auth={auth} onLogout={handleLogout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={auth.user ? <Navigate to={`/${auth.user.role.toLowerCase()}`} /> : <Login onLogin={handleLogin} students={students} teachers={teachers} />} />
            <Route path="/admin" element={auth.user?.role === UserRole.ADMIN ? (
              <AdminDashboard 
                students={students} teachers={teachers} 
                onAddStudent={addStudent} onRemoveStudent={removeStudent}
                onAddTeacher={addTeacher} onRemoveTeacher={removeTeacher}
                onAddCalendarEvent={addCalendarEvent} onRemoveCalendarEvent={removeCalendarEvent}
                calendarEvents={calendarEvents} assignments={assignments} materials={materials}
                timetable={timetable} liveSchedules={liveSchedules}
                onAddTimetableEvent={addTimetableEvent} onRemoveTimetableEvent={removeTimetableEvent}
                onAddLiveSchedule={addLiveSchedule} onRemoveLiveSchedule={removeLiveSchedule}
                liveSession={liveSession} messages={messages} onSendMessage={sendMessage}
              />
            ) : <Navigate to="/" />} />
            <Route path="/teacher" element={auth.user?.role === UserRole.TEACHER ? (
              <TeacherDashboard 
                students={students} materials={materials} assignments={assignments} calendarEvents={calendarEvents}
                timetable={timetable} liveSchedules={liveSchedules}
                onAddMaterial={addMaterial} onGradeAssignment={gradeAssignment}
                liveSession={liveSession} onToggleLive={toggleLive} userName={auth.user.name}
                messages={messages} onSendMessage={sendMessage} onUpdateParticipant={updateParticipant}
              />
            ) : <Navigate to="/" />} />
            <Route path="/student" element={auth.user?.role === UserRole.STUDENT ? (
              <StudentDashboard 
                student={students.find(s => s.id === auth.user?.id)!} 
                materials={materials} assignments={assignments.filter(a => a.studentId === auth.user?.id)}
                calendarEvents={calendarEvents} timetable={timetable} liveSchedules={liveSchedules}
                onSubmitAssignment={submitAssignment} liveSession={liveSession}
                messages={messages} onSendMessage={sendMessage} onUpdateParticipant={updateParticipant}
              />
            ) : <Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
