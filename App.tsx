
import React, { useState, useEffect } from 'react';
import { User, Course, ActivityEvent, AppView } from './types';
import { Api } from './services/api';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Auto-login on mount if session exists
  useEffect(() => {
    const saved = localStorage.getItem('et_user');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        setCurrentUser(user);
        loadData(user);
      } catch (e) {
        localStorage.removeItem('et_user');
      }
    }
  }, []);

  const loadData = async (user: User) => {
    setIsLoading(true);
    try {
      const data = await Api.getDashboardData(user.id);
      setCourses(data.courses);
      setActivities(data.activities);
      setAllStudents(data.allStudents);
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Initialization Error:", err);
      setLoginError("Failed to sync with backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      const user = await Api.login(email);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('et_user', JSON.stringify(user));
        await loadData(user);
      } else {
        setLoginError('Invalid credentials or student record not found.');
      }
    } catch (err) {
      setLoginError('Could not connect to the EduTrack server.');
    } finally {
      setIsLoading(false);
    }
  };

  const logActivity = async (courseId: string, minutes: number, lessonName: string) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      await Api.logActivity({
        studentId: currentUser.id,
        courseId,
        minutesSpent: minutes,
        lessonName,
        date: new Date().toISOString().split('T')[0]
      });
      // Refresh state to reflect updated progress
      await loadData(currentUser);
    } catch (err) {
      console.error("Activity Log Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('et_user');
    setCurrentUser(null);
    setCourses([]);
    setActivities([]);
    setIsDataLoaded(false);
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="text-center relative z-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl font-black text-white mx-auto rotate-3 shadow-xl shadow-indigo-600/20">E</div>
            <h1 className="text-3xl font-black text-slate-900 mt-6 tracking-tight">EduTrack</h1>
            <p className="text-slate-400 font-medium mt-2">Connecting students to progress.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="e.g. alex@student.edu" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700" 
              />
            </div>
            
            <button 
              disabled={isLoading} 
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : 'Sign In'}
            </button>
            
            {loginError && (
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 animate-in fade-in duration-300">
                <p className="text-rose-500 text-xs text-center font-bold tracking-tight">{loginError}</p>
              </div>
            )}
          </form>

          <div className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest pt-4">
            Supabase Auth & Gemini Powered
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Layout
  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout}
      currentView={currentView}
      onViewChange={setCurrentView}
    >
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-40 cursor-wait' : 'opacity-100'}`}>
        <Dashboard 
          currentUser={currentUser}
          courses={courses} 
          activities={activities} 
          onLogActivity={logActivity}
          students={allStudents}
          currentView={currentView}
        />
      </div>
      
      {/* Global Sync Indicator */}
      {isLoading && (
        <div className="fixed bottom-8 right-8 bg-white px-4 py-2 rounded-full shadow-2xl border border-slate-100 flex items-center gap-3 animate-in slide-in-from-bottom-10 z-[100]">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syncing with Cloud...</span>
        </div>
      )}
    </Layout>
  );
};

export default App;
