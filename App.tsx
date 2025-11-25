import React, { useState, useEffect } from 'react';
import { ChatView } from './components/ChatView';
import { AnalyzeView } from './components/AnalyzeView';
import { GardenView } from './components/GardenView';
import { AppMode } from './types';
import { checkReminders } from './services/garden';

function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.GARDEN);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Check reminders periodically
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (notificationPermission === 'granted') {
        const duePlants = checkReminders();
        
        // Filter out plants that we already notified about today (simple logic: check localStorage)
        const lastNotified = localStorage.getItem('last-notification-date');
        const today = new Date().toDateString();

        if (duePlants.length > 0 && lastNotified !== today) {
          const names = duePlants.map(p => p.name).join(', ');
          new Notification('Watering Reminder', {
            body: `Time to water: ${names}`,
            icon: '/icon.png' // Fallback icon
          });
          localStorage.setItem('last-notification-date', today);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [notificationPermission]);

  return (
    <div className="min-h-screen bg-emerald-50/60 flex flex-col font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white shadow-emerald-200 shadow-md">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M12.75 3.037a.75.75 0 01-.75.75 2.25 2.25 0 00-2.25 2.25v9.75a1.5 1.5 0 01-1.5 1.5H5.25a.75.75 0 010-1.5h3a.75.75 0 01.75-.75V5.287c0-2.35 1.76-4.295 4.085-4.505A.75.75 0 0112.75 3.037zM8.085 14.505a4.506 4.506 0 00-.015.006A20.485 20.485 0 0112 15.75c3.275 0 6.307-.79 8.986-2.193a.75.75 0 11.666 1.353A21.983 21.983 0 0012 17.25c-3.149 0-6.108.718-8.799 2.012a.75.75 0 11-.645-1.365A20.495 20.495 0 018.085 14.505z" clipRule="evenodd" />
               </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 to-green-700">
              Botanical Buddy
            </h1>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-6 pb-2">
        <div className="flex p-1 bg-slate-200/50 rounded-xl w-full max-w-lg mx-auto backdrop-blur-sm">
          <button
            onClick={() => setMode(AppMode.GARDEN)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === AppMode.GARDEN
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
               <path fillRule="evenodd" d="M12.75 3.037a.75.75 0 01-.75.75 2.25 2.25 0 00-2.25 2.25v9.75a1.5 1.5 0 01-1.5 1.5H5.25a.75.75 0 010-1.5h3a.75.75 0 01.75-.75V5.287c0-2.35 1.76-4.295 4.085-4.505A.75.75 0 0112.75 3.037zM8.085 14.505a4.506 4.506 0 00-.015.006A20.485 20.485 0 0112 15.75c3.275 0 6.307-.79 8.986-2.193a.75.75 0 11.666 1.353A21.983 21.983 0 0012 17.25c-3.149 0-6.108.718-8.799 2.012a.75.75 0 11-.645-1.365A20.495 20.495 0 018.085 14.505z" clipRule="evenodd" />
             </svg>
             My Garden
          </button>
          <button
            onClick={() => setMode(AppMode.ANALYZE)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === AppMode.ANALYZE
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
               <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
            </svg>
            Identify
          </button>
          <button
            onClick={() => setMode(AppMode.CHAT)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
              mode === AppMode.CHAT
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
            </svg>
            Chat
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-hidden h-[calc(100vh-140px)]">
        {mode === AppMode.GARDEN && <GardenView />}
        {mode === AppMode.ANALYZE && <AnalyzeView />}
        {mode === AppMode.CHAT && <ChatView />}
      </main>

    </div>
  );
}

export default App;
