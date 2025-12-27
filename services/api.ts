
import { User, Course, ActivityEvent, MentorInsight } from '../types';

const BASE_URL = 'http://localhost:3000/api';

/**
 * EduTrack API Connector
 * This service is the exclusive bridge between React and the Backend.
 */
export const Api = {
  async login(email: string, password: string = 'password123'): Promise<User | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Authentication failed');
      }
      return await res.json();
    } catch (e) {
      console.error("Login Error:", e);
      return null;
    }
  },

  async getDashboardData(userId: string) {
    const res = await fetch(`${BASE_URL}/dashboard/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return await res.json();
  },

  async logActivity(event: Omit<ActivityEvent, 'id'>) {
    const res = await fetch(`${BASE_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    if (!res.ok) throw new Error('Failed to log activity');
    return await res.json();
  },

  async fetchMentorInsights(students: User[], courses: Course[], activities: ActivityEvent[]): Promise<MentorInsight[]> {
    const res = await fetch(`${BASE_URL}/mentor/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students, courses, activities })
    });
    if (!res.ok) throw new Error('Failed to fetch insights');
    return await res.json();
  },

  async getLessonDetails(courseId: string) {
    const res = await fetch(`${BASE_URL}/courses/${courseId}/lessons`);
    if (!res.ok) throw new Error('Failed to fetch lessons');
    return await res.json();
  }
};
