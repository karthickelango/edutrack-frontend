
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { Course, ActivityEvent, User } from '../types';

interface MentorDashboardProps {
  students: User[];
  courses: Course[];
  activities: ActivityEvent[];
}

const MentorDashboard: React.FC<MentorDashboardProps> = ({ students, courses, activities }) => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  // Accurate aggregation of data by category based on real classroom activity
  const courseData = Array.from(new Set(courses.map(c => c.category))).map(cat => {
    const categoryCourses = courses.filter(c => c.category === cat);
    const totalProgress = categoryCourses.reduce((sum, c) => sum + (c.completedLessons / c.totalLessons) * 100, 0);
    const avg = Math.round(totalProgress / (categoryCourses.length || 1));

    // Map individual student details for this specific category
    const enrolledStudents = categoryCourses.map(cc => {
      const student = students.find(s => s.id === cc.studentId);
      return {
        id: cc.studentId,
        name: student?.name || 'Unknown',
        mastery: Math.round((cc.completedLessons / cc.totalLessons) * 100)
      };
    });

    return {
      name: cat,
      avg: avg,
      studentCount: categoryCourses.length,
      studentList: enrolledStudents
    };
  });

  // Helper to calculate student-specific metrics for the deep-dive drawer
  const getStudentDetails = (studentId: string) => {
    const studentCourses = courses.filter(c => c.studentId === studentId);
    const studentActivities = activities.filter(a => a.studentId === studentId);
    const totalMins = studentActivities.reduce((sum, a) => sum + a.minutesSpent, 0);
    const completed = studentCourses.reduce((sum, c) => sum + c.completedLessons, 0);
    const avgCompletion = studentCourses.length
      ? Math.round(studentCourses.reduce((s, c) => s + (c.completedLessons / c.totalLessons) * 100, 0) / studentCourses.length)
      : 0;

    return { studentCourses, studentActivities, totalMins, completed, avgCompletion };
  };

  const openStudentByName = (name: string) => {
    const student = students.find(s => s.name === name);
    if (student) setSelectedStudent(student);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 min-w-[240px] animate-in zoom-in duration-200">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{data.name}</p>
          <p className="text-lg font-black text-slate-900 mb-4">{data.avg}% Class Average</p>

          <div className="space-y-3 border-t border-slate-50 pt-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-2">Student Performance:</p>
            {data.studentList.map((s: any, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center gap-4"
              >
                <span className="text-xs font-bold text-slate-700">{s.name}</span>
                <span className="text-xs font-black text-indigo-600">{s.mastery}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);

    const rows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => `"${row[h] ?? ''}"`).join(',')
      )
    ];

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Classroom Overview</h1>
          <p className="text-slate-500 font-medium italic">Performance insights for all {students.length} students in your batch.</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Sync</span>
          <p className="text-xs font-bold text-slate-900">Just Now</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition hover:shadow-md">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Mastery</span>
              <p className="text-4xl font-black text-indigo-600 mt-2">68%</p>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Class Average</p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition hover:shadow-md">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Learners</span>
              <p className="text-4xl font-black text-slate-900 mt-2">85%</p>
              <p className="text-[10px] text-emerald-500 mt-2 font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Healthy Growth
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition hover:shadow-md">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Subjects</span>
              <p className="text-4xl font-black text-slate-900 mt-2">{courseData.length}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Active Curriculum</p>
            </div>
          </div>

          {/* Progress by Discipline Chart */}
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-800">Progress by Course</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Class-wide performance aggregated by subject category.</p>
              </div>
              <button
                onClick={() => exportToCSV(courses, 'class-progress.csv')}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl
               text-xs font-black uppercase tracking-widest
               hover:bg-indigo-600 transition flex"

              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>

                Export Class Data
              </button>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                  >
                    <Label value="Subject" offset={-10} position="insideBottom" fill="#cbd5e1" fontSize={9} fontWeight={800} />
                  </XAxis>
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar
                    dataKey="avg"
                    fill="#4f46e5"
                    radius={[12, 12, 0, 0]}
                    barSize={48}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* In-View Breakdown */}
            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Detailed Student Roster</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {courseData.map(d => (
                  <div key={d.name} className="flex flex-col bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 transition shadow-sm group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{d.name}</span>
                      <span className="text-xs font-black text-indigo-600">{d.avg}%</span>
                    </div>
                    <div className="space-y-2.5">
                      {d.studentList.map((s: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => openStudentByName(s.name)}
                          className="w-full flex items-center justify-between hover:bg-white p-1 rounded transition group/item"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-indigo-500"></div>
                            <span className="text-[10px] font-bold text-slate-500 group-hover/item:text-indigo-600 truncate max-w-[80px] text-left">{s.name}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 group-hover/item:text-indigo-600">{s.mastery}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Details Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] flex justify-end" style={{ margin: 0 }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setSelectedStudent(null)}
          ></div>

          <div className="relative w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="pt-10 pb-8 px-8 border-b flex justify-between items-center bg-slate-50 sticky top-0 z-20">
              <div className="flex items-center gap-5">
                <img
                  src={selectedStudent.avatar}
                  className="w-20 h-20 rounded-3xl border-4 border-white shadow-xl object-cover"
                  alt={selectedStudent.name}
                />
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h2>
                  <p className="text-slate-500 font-bold">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-3 bg-white hover:bg-slate-200 rounded-2xl transition shadow-sm border border-slate-100"
                aria-label="Close drawer"
              >
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-24">
              {/* Metrics Snapshot */}
              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100/50">
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Mastery</span>
                  <p className="text-3xl font-black text-indigo-600 mt-1">{getStudentDetails(selectedStudent.id).avgCompletion}%</p>
                </div>
                <div className="p-6 bg-slate-900 rounded-3xl">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Lessons</span>
                  <p className="text-3xl font-black text-white mt-1">{getStudentDetails(selectedStudent.id).completed}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Study</span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{Math.floor(getStudentDetails(selectedStudent.id).totalMins / 60)}h</p>
                </div>
              </div>

              {/* Enrolled Courses */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                    Active Courses
                  </h4>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Enrollment Status</span>
                </div>
                <div className="space-y-4">
                  {getStudentDetails(selectedStudent.id).studentCourses.map(c => {
                    const progress = Math.round((c.completedLessons / c.totalLessons) * 100);
                    return (
                      <div key={c.id} className="p-8 border border-slate-100 rounded-[2rem] hover:border-indigo-100 transition-all bg-white group shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{c.title}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{c.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-indigo-500">{progress}%</span>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-slate-900 group-hover:bg-indigo-600 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>{c.completedLessons} / {c.totalLessons} Lessons Completed</span>
                          <span>Accessed: {new Date(c.lastAccessed).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
