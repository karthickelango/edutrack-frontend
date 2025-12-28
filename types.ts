
export enum UserRole {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR'
}

export type AppView = 'dashboard' | 'courses' | 'mentorship';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  totalLessons: number;
  completedLessons: number;
  timeSpent: number; // in minutes
  lastAccessed: string;
  studentId: string;
}

export interface ActivityEvent {
  id: string;
  date: string;
  minutes: number;
  lessonName: string;
  courseId: string;
  studentId: string;
}

// Fixed missing interface: Added MentorInsight for AI-powered student analysis.
export interface MentorInsight {
  studentName: string;
  status: 'at-risk' | 'stalled' | 'thriving';
  reason: string;
}
