
import React, { useState, useEffect } from 'react';
import { Course, ActivityEvent, User, MentorInsight } from '../types';
// import { getMentorCohortInsights } from '../services/geminiService';

interface MentorMentorshipViewProps {
  students: User[];
  courses: Course[];
  activities: ActivityEvent[];
}

const MentorMentorshipView: React.FC<MentorMentorshipViewProps> = ({ students, courses, activities }) => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [insights, setInsights] = useState<MentorInsight[]>([]);

  // useEffect(() => {
  //   getMentorCohortInsights(students, courses, activities).then(setInsights);
  // }, [students, courses, activities]);

  const getStudentMetrics = (studentId: string) => {
    const studentCourses = courses.filter(c => c.studentId === studentId);
    const studentActivities = activities.filter(a => a.studentId === studentId);
    const totalMins = studentActivities.reduce((sum, a) => sum + a.minutesSpent, 0);
    const completed = studentCourses.reduce((sum, c) => sum + c.completedLessons, 0);
    const avgCompletion = studentCourses.length 
      ? Math.round(studentCourses.reduce((s, c) => s + (c.completedLessons / c.totalLessons) * 100, 0) / studentCourses.length) 
      : 0;
    
    return { studentCourses, studentActivities, totalMins, completed, avgCompletion };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Mentorship</h1>
        {/* <p className="text-slate-500 font-medium">Deep dive into individual student progress and logged activity.</p> */}
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-8 py-5">Student Name</th>
              <th className="px-8 py-5">Global Mastery</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(student => {
              const { avgCompletion } = getStudentMetrics(student.id);
              const status = insights.find(i => i.studentName === student.name)?.status || 'thriving';
              return (
                <tr 
                  key={student.id} 
                  className="hover:bg-slate-50 cursor-pointer transition group"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="px-8 py-6 flex items-center gap-4">
                    <img src={student.avatar} className="w-12 h-12 rounded-2xl bg-slate-100 shadow-sm" />
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{student.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-700">{avgCompletion}%</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                      status === 'at-risk' ? 'bg-rose-50 text-rose-500' : 
                      status === 'stalled' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Analyze</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Student Details Slider - Reused from previous implementation */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex justify-end" style={{margin: 0}}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-4">
                <img src={selectedStudent.avatar} className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl" />
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h2>
                  <p className="text-slate-500 font-bold">{selectedStudent.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-3 hover:bg-slate-200 rounded-2xl transition">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-12">
               {/* Metrics */}
               <div className="grid grid-cols-3 gap-6">
                 <div className="p-6 bg-indigo-50 rounded-3xl">
                   <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Mastery</span>
                   <p className="text-3xl font-black text-indigo-600 mt-1">{getStudentMetrics(selectedStudent.id).avgCompletion}%</p>
                 </div>
                 <div className="p-6 bg-slate-900 rounded-3xl">
                   <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Lessons</span>
                   <p className="text-3xl font-black text-white mt-1">{getStudentMetrics(selectedStudent.id).completed}</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Learning Time</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{Math.floor(getStudentMetrics(selectedStudent.id).totalMins / 60)}h</p>
                 </div>
               </div>
               
               {/* Courses Section */}
               <section>
                 <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                   Active Enrolments
                 </h4>
                 <div className="space-y-4">
                   {getStudentMetrics(selectedStudent.id).studentCourses.map(c => (
                     <div key={c.id} className="p-6 border rounded-3xl hover:border-indigo-200 transition bg-white group">
                       <div className="flex justify-between items-center mb-3">
                         <span className="font-black text-slate-800 text-lg">{c.title}</span>
                         <span className="text-xs font-black text-indigo-500 uppercase">{Math.round((c.completedLessons/c.totalLessons)*100)}%</span>
                       </div>
                       <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                         <div className="h-full bg-slate-900 group-hover:bg-indigo-600 transition-all duration-1000" style={{width: `${(c.completedLessons/c.totalLessons)*100}%`}}></div>
                       </div>
                     </div>
                   ))}
                 </div>
               </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorMentorshipView;
