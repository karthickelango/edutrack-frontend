
import React, { useState } from 'react';
import { Course, User, ActivityEvent, UserRole } from '../types';

interface CoursesViewProps {
  courses: Course[];
  currentUser: User;
  activities: ActivityEvent[];
  students: User[];
}

const CoursesView: React.FC<CoursesViewProps> = ({ courses, currentUser, activities, students }) => {
  const [filter, setFilter] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Track which students' progress are being "peeked" at
  const [peekProgress, setPeekProgress] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

  const filteredCourses = filter === 'All' 
    ? courses 
    : courses.filter(c => c.category === filter);

  const displayCourses = currentUser.role === UserRole.STUDENT 
    ? filteredCourses.filter(c => c.studentId === currentUser.id)
    : filteredCourses;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-700 relative">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-slate-200 pb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
            Academic Catalog
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight lg:text-5xl">Curriculum Explorer</h1>
          <p className="text-slate-500 font-medium max-w-2xl text-lg">Manage and explore subject-specific learning tracks across your entire cohort.</p>
        </div>
        
        <nav className="flex p-1.5 bg-slate-100 rounded-2xl shadow-inner w-full lg:w-auto overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {displayCourses.map(course => {
          const progress = Math.round((course.completedLessons / course.totalLessons) * 100);
          const student = students.find(s => s.id === course.studentId);
          const isPeeking = peekProgress === course.id;
          const isMentor = currentUser.role === UserRole.MENTOR;
          
          return (
            <div key={course.id} className="group relative bg-white rounded-[3rem] border border-slate-100 p-1 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative p-5 bg-slate-900 text-white rounded-[2rem] transform group-hover:rotate-6 transition-transform duration-500 shadow-xl">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                     <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">{course.category}</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 line-clamp-2">Deep-dive into foundational principles and advanced methodologies of {course.title.toLowerCase()}.</p>
                
                <div className="mt-auto space-y-6">
                  {/* Progress Visualization */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${(!isMentor || isPeeking) ? 'max-h-40 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</span>
                        <span className="text-3xl font-black text-indigo-600 tracking-tighter">{progress}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(79,70,229,0.3)]" 
                          style={{width: `${progress}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black text-slate-300 uppercase">Lessons</span>
                           <span className="text-xs font-bold text-slate-700">{course.completedLessons}/{course.totalLessons}</span>
                        </div>
                        <div className="flex flex-col text-right">
                           <span className="text-[9px] font-black text-slate-300 uppercase">Activity</span>
                           <span className="text-xs font-bold text-slate-700">{Math.floor(course.timeSpent/60)}h Focused</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Spotlight Card Action */}
                  {isMentor && student && (
                    <button 
                      onClick={() => setPeekProgress(isPeeking ? null : course.id)}
                      className={`w-full group/btn relative flex items-center gap-4 p-4 rounded-[2rem] border transition-all duration-300 ${
                        isPeeking 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xl -translate-y-1' 
                          : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-200 hover:shadow-lg'
                      }`}
                    >
                      <div className="relative">
                        <img src={student.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" alt={student.name} />
                        {isPeeking && <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-slate-900 animate-pulse"></span>}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className={`font-black text-sm truncate ${isPeeking ? 'text-white' : 'text-slate-900'}`}>{student.name}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-tight ${isPeeking ? 'text-indigo-300' : 'text-slate-400'}`}>
                          {isPeeking ? 'Insights Active' : 'View Performance'}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-xl transition-colors ${isPeeking ? 'bg-white/10' : 'bg-slate-50 group-hover/btn:bg-indigo-50 group-hover/btn:text-indigo-600'}`}>
                        <svg className={`w-5 h-5 transition-transform duration-500 ${isPeeking ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedCourse(course)}
                  className="w-full mt-6 py-5 bg-indigo-50 text-indigo-700 hover:bg-slate-900 hover:text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.15em] transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  View Course Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Dynamic Detail Drawer */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[100] flex justify-end" style={{margin: 0}}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setSelectedCourse(null)}></div>
          <div className="relative w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-700">
            {/* Drawer Header */}
            <div className="relative pt-16 pb-12 px-10 bg-slate-900 text-white overflow-hidden">
              <div className="absolute z-10 space-y-2">
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">Syllabus Overview</span>
                <h2 className="text-4xl font-black tracking-tight leading-none">{selectedCourse.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)} 
                className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all hover:rotate-90"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 pb-32">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center text-center">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Completion Status</span>
                 <p className="text-4xl font-black text-indigo-600 tracking-tighter">
                  {Math.round((selectedCourse.completedLessons / selectedCourse.totalLessons) * 100)}%
                 </p>
              </div>

              <section className="space-y-6">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">Academic Units</h4>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(unit => (
                    <div key={unit} className="p-6 border border-slate-100 rounded-[2rem] hover:bg-slate-50 transition flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400">{unit}</div>
                      <div>
                        <h5 className="font-black text-slate-900">Module 0{unit}</h5>
                        <p className="text-xs text-slate-400">Curriculum data pending instructor update.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="sticky bottom-0 mt-10">
                <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                   <h4 className="text-2xl font-black mb-3 relative z-10 tracking-tight">Review Coursework</h4>
                   <p className="text-slate-400 text-sm mb-10 font-medium relative z-10">Access localized materials and unit tests for this subject.</p>
                   <button className="w-full bg-indigo-600 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg relative z-10">
                     Open Study Portal
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {displayCourses.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
          <p className="text-slate-400 font-black text-xl italic">No tracks matching this criteria.</p>
          <button onClick={() => setFilter('All')} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Filters</button>
        </div>
      )}
    </div>
  );
};

export default CoursesView;
