
import React from 'react';
import { Course, ActivityEvent, User, UserRole, AppView } from '../types';
import StudentDashboard from './StudentDashboard';
import MentorDashboard from './MentorDashboard';
import MentorMentorshipView from './MentorMentorshipView';
import CoursesView from './CoursesView';

interface DashboardProps {
  currentUser: User;
  courses: Course[];
  activities: ActivityEvent[];
  onLogActivity: (courseId: string, minutes: number, lessonName: string) => void;
  students: User[];
  currentView: AppView;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, 
  courses, 
  activities, 
  onLogActivity, 
  students,
  currentView
}) => {
  // Handle Routing logic based on Role and View
  
  if (currentView === 'courses') {
    return (
      <CoursesView 
        courses={courses} 
        currentUser={currentUser} 
        activities={activities} 
        students={students}
      />
    );
  }

  if (currentView === 'mentorship' && currentUser.role === UserRole.MENTOR) {
    return <MentorMentorshipView students={students} courses={courses} activities={activities} />;
  }

  // Default: Dashboard / Home
  if (currentUser.role === UserRole.MENTOR) {
    return (
      <MentorDashboard 
        students={students} 
        courses={courses} 
        activities={activities} 
      />
    );
  }

  // Filter only the current student's courses and activities for their dashboard
  const studentCourses = courses.filter(c => c.studentId === currentUser.id);
  const studentActivities = activities.filter(a => a.studentId === currentUser.id);

  return (
    <StudentDashboard 
      courses={studentCourses} 
      activities={studentActivities}
      onLogActivity={onLogActivity}
    />
  );
};

export default Dashboard;
