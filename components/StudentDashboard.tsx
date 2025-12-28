
import React, { useState } from 'react';
import {
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Course, ActivityEvent, User } from '../types';

interface StudentDashboardProps {
  courses: Course[];
  activities: ActivityEvent[];
  onLogActivity: (courseId: string, minutes: number, lessonName: string) => void;
  loggedUser: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ courses, activities, onLogActivity, loggedUser }) => {
  const [showLog, setShowLog] = useState(false);

  // Determine the current "Focus" course based on recent access, with a safety check for empty lists
  const activeCourse = courses.length > 0
    ? courses.reduce((prev, current) =>
      (new Date(prev.lastAccessed) > new Date(current.lastAccessed)) ? prev : current
    )
    : null;

  // Data for the Donut Chart (Completion Status)
  const donutData = activeCourse ? [
    { name: 'Completed', value: activeCourse.completedLessons },
    { name: 'Remaining', value: Math.max(0, activeCourse.totalLessons - activeCourse.completedLessons) }
  ] : [{ name: 'N/A', value: 1 }];

  const COLORS = activeCourse ? ['#6366f1', '#e2e8f0'] : ['#f1f5f9', '#f1f5f9'];

  // Prepare trend data (Daily Focus)
  const trendData = activities
    .slice(-7)
    .map(a => ({
      date: new Date(a.date).toLocaleDateString(undefined, { weekday: 'short' }),
      minutes: a.minutesSpent ?? a.minutesSpent, // 👈 fallback
      label: a.lessonName
    }))
    .filter(d => d.minutes > 0);

  const exportActivityCSV = () => {
    const headers = ['Date', 'Lesson', 'Minutes Spent', 'Course ID'];
    const rows = activities.map(a => [a.date, a.lessonName, a.minutesSpent, a.courseId]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `activity_log_${loggedUser.name.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Workspace</h1>
          <p className="text-slate-500 font-medium">
            {courses.length > 0
              ? `You are enrolled in ${courses.length} learning ${courses.length === 1 ? 'track' : 'tracks'}.`
              : "Welcome! You haven't started any courses yet."}
          </p>
        </div>
        <button
          onClick={exportActivityCSV}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl
               text-xs font-black uppercase tracking-widest
               hover:bg-indigo-600 transition flex"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Export Logs
        </button>
      </header>

      {activeCourse ? (
        <section className="relative bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-indigo-600">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" /></svg>
          </div>

          <div className="p-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="relative w-64 h-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">
                  {Math.round((activeCourse.completedLessons / activeCourse.totalLessons) * 100)}%
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery</span>
              </div>
            </div>

            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
                  Active Focus
                </span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{activeCourse.title}</h2>
                <p className="text-slate-400 font-medium text-lg mt-2">Currently on module {activeCourse.completedLessons + 1} of {activeCourse.totalLessons}.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Logged</p>
                  <p className="text-xl font-black text-slate-900">{Math.floor(activeCourse.timeSpent / 60)}h {activeCourse.timeSpent % 60}m</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Units</p>
                  <p className="text-xl font-black text-slate-900">{activeCourse.totalLessons}</p>
                </div>
                <div className="hidden md:block bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-xl font-black text-indigo-600">{activeCourse.category}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.246 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900">Start Your Journey</h3>
          <p className="text-slate-400 mt-2">Explore the course catalog to enroll in your first track.</p>
        </div>
      )}

      {courses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Learning Momentum</h3>
                <p className="text-xs text-slate-400 font-medium">Focus trend over your last sessions.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
            </div>

            <div className="h-72 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '16px',
                        border: 'none',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="minutes"
                      stroke="#6366f1"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorMins)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-300 font-bold italic">
                  Log your first session to see trends
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 flex flex-col">
            <h3 className="text-xl font-black text-slate-900">My Enrollment</h3>
            <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pr-1">
              {courses.map(course => (
                <div key={course.id} className={`p-5 rounded-2xl border transition-all group ${course.id === activeCourse?.id ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-md'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl text-xs font-black uppercase tracking-tighter ${course.id === activeCourse?.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {course.category}
                    </div>
                    {course.id === activeCourse?.id && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <h4 className={`font-black text-sm mb-4 truncate ${course.id === activeCourse?.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>{course.title}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(course.completedLessons / course.totalLessons) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-900">{Math.round((course.completedLessons / course.totalLessons) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300 border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Activity Tracking</p>
                <h3 className="font-black text-2xl text-slate-900">Log Session</h3>
              </div>
              <button onClick={() => setShowLog(false)} className="p-2 hover:bg-slate-50 rounded-xl transition text-slate-300 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const courseId = (form.elements.namedItem('courseId') as HTMLSelectElement).value;
              const mins = Number((form.elements.namedItem('mins') as HTMLInputElement).value);
              const lesson = (form.elements.namedItem('lesson') as HTMLInputElement).value;
              onLogActivity(courseId, mins, lesson);
              setShowLog(false);
            }}>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Target Course</label>
                <select name="courseId" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" required defaultValue={activeCourse?.id}>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Duration (min)</label>
                  <input name="mins" type="number" defaultValue={30} className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Lesson Title</label>
                  <input name="lesson" placeholder="e.g. Unit 4.1" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" required />
                </div>
              </div>
              <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95">Save Activity</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
