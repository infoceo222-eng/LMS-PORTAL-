
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  class: string;
  password: string;
  createdAt: string;
  photo?: string;
}

export interface Teacher {
  id: string;
  teacherId: string; // Login ID
  name: string;
  subject: string;
  password: string;
  createdAt: string;
  photo?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export type MaterialType = 'SLIDE' | 'LECTURE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'CODE' | 'BOOK' | 'GALLERY';

export interface Material {
  id: string;
  title: string;
  type: MaterialType;
  content: string; // Base64 data or URL
  fileName?: string;
  date: string;
  uploaderName: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  subject: string;
  type: 'EXAM' | 'HOLIDAY' | 'ACTIVITY' | 'MEETING';
}

export interface TimetableEvent {
  id: string;
  day: string;
  time: string;
  subject: string;
  class: string;
  teacherName: string;
}

export interface LiveClassSchedule {
  id: string;
  title: string;
  date: string;
  time: string;
  subject: string;
  teacherName: string;
}

export interface Assignment {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  fileContent: string; // Base64 for gallery/document upload
  fileName?: string;
  status: 'PENDING' | 'PASS' | 'FAIL';
  marks?: number;
  teacherComment?: string;
  date: string;
}

export interface LiveSession {
  isActive: boolean;
  teacherName: string;
  teacherId?: string;
  startTime?: string;
  participants: Array<{
    id: string;
    name: string;
    role: UserRole;
    hasCamera: boolean;
    cameraStream?: string; // Simulated or actual base64 frame for multi-view
  }>;
}

export interface AuthState {
  user: {
    role: UserRole;
    id: string;
    name: string;
  } | null;
}
