
import { User, Course, ActivityEvent, UserRole } from './types';

export const SEEDED_USERS: User[] = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex@student.edu', role: UserRole.STUDENT, avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: 'u2', name: 'Dr. Sarah Smith', email: 'sarah@mentor.edu', role: UserRole.MENTOR, avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: 'u3', name: 'Jordan Lee', email: 'jordan@student.edu', role: UserRole.STUDENT, avatar: 'https://i.pravatar.cc/150?u=jordan' },
  { id: 'u4', name: 'Casey Chen', email: 'casey@student.edu', role: UserRole.STUDENT, avatar: 'https://i.pravatar.cc/150?u=casey' }
];

export const SEEDED_COURSES: Course[] = [
  { id: 'c1', studentId: 'u1', title: 'Advanced React Patterns', category: 'Engineering', totalLessons: 24, completedLessons: 18, timeSpent: 1240, lastAccessed: '2024-05-20' },
  { id: 'c2', studentId: 'u1', title: 'UI/UX Design', category: 'Design', totalLessons: 15, completedLessons: 5, timeSpent: 450, lastAccessed: '2024-05-18' },
  { id: 'c3', studentId: 'u3', title: 'Data Structures', category: 'CS', totalLessons: 40, completedLessons: 12, timeSpent: 2100, lastAccessed: '2024-05-21' },
  { id: 'c4', studentId: 'u4', title: 'Machine Learning', category: 'Data', totalLessons: 30, completedLessons: 30, timeSpent: 3200, lastAccessed: '2024-05-10' }
];

export const SEEDED_ACTIVITIES: ActivityEvent[] = [
  { id: 'a1', studentId: 'u1', date: '2024-05-21', minutesSpent: 45, lessonName: 'HOCs', courseId: 'c1' },
  { id: 'a2', studentId: 'u3', date: '2024-05-21', minutesSpent: 120, lessonName: 'Trees', courseId: 'c3' },
  { id: 'a3', studentId: 'u1', date: '2024-05-20', minutesSpent: 30, lessonName: 'Colors', courseId: 'c2' }
];
