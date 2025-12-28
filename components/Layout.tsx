import React, { useState } from 'react';
import { User, UserRole, AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  user,
  onLogout,
  currentView,
  onViewChange
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as AppView,
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M3 12l2-2 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1"
          />
        </svg>
      )
    },
    {
      id: 'courses' as AppView,
      label: 'Courses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13"
          />
        </svg>
      )
    }
  ];

  if (user.role === UserRole.MENTOR) {
    navItems.push({
      id: 'mentorship' as AppView,
      label: 'Mentorship',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0"
          />
        </svg>
      )
    });
  }

  return (
    <div className="min-h-screen flex">

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-[90] bg-slate-900 text-white flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-black">
            E
          </div>
          <span className="font-black">EduTrack</span>
        </div>
        <button onClick={() => setSidebarOpen(true)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full md:h-screen
          w-72 bg-slate-900 text-white flex flex-col
          shadow-2xl z-[99]
          transform transition-transform duration-300 sidebar
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xl">
            E
          </div>
          <span className="text-xl font-black">EduTrack</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                currentView === item.id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <img src={user.avatar} className="w-10 h-10 rounded-xl" alt={user.name} />
            <div className="flex-1 overflow-hidden">
              <p className="font-bold truncate">{user.name}</p>
              <p className="text-xs text-indigo-400 uppercase font-black">{user.role}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full p-3 bg-slate-800 hover:bg-rose-900/40 rounded-xl text-xs font-black uppercase"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 overflow-y-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
