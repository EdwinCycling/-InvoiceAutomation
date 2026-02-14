import React, { useState, useEffect, createContext, useContext } from 'react';
import { Screen, Document } from './types';
import { IngestScreen } from './components/IngestScreen';
import { DetailCockpit } from './components/DetailCockpit';
import { HistoryScreen } from './components/HistoryScreen';
import { Layout, History, Settings, Sun, Moon, Lock, AlertCircle } from 'lucide-react';

// --- Theme Context ---
type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({ theme: 'light', toggleTheme: () => {} });

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check system preference or default
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Updated access code check
    if (accessCode.toLowerCase() === 'exact2025') {
      onLogin();
    } else {
      setError(true);
      setAccessCode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-slate-100 dark:border-slate-700 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-exact-blue rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
           <span className="text-white font-bold text-2xl">Ex</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI First Invoice automation</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Prototype Access</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
              type="password"
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value); setError(false); }}
              placeholder="Enter Access Code"
              className={`w-full pl-10 pr-4 py-3 rounded-lg border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-exact-blue outline-none transition-all`}
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm justify-center animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>Invalid Access Code</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-exact-blue hover:bg-exact-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
          >
            Sign In
          </button>
        </form>
        
        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          Restricted Access • Professional Use Only
        </p>
      </div>
    </div>
  );
};

const Sidebar = ({ activeScreen, onNavigate }: { activeScreen: Screen; onNavigate: (s: Screen) => void }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <aside className="w-64 bg-slate-850 dark:bg-slate-950 text-white flex flex-col shrink-0 transition-all duration-300 border-r border-slate-700 dark:border-slate-800">
      <div className="h-16 flex items-center px-6 border-b border-slate-700 dark:border-slate-800">
        <span className="font-bold text-lg tracking-tight">Exact<span className="text-blue-400 font-light">AI</span></span>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        <div 
          onClick={() => onNavigate('INGEST')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          activeScreen === 'INGEST' || activeScreen === 'DETAIL' ? 'bg-exact-blue text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}>
          <Layout className="w-5 h-5" />
          Dashboard & Ingest
        </div>
        <div 
          onClick={() => onNavigate('HISTORY')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          activeScreen === 'HISTORY' ? 'bg-exact-blue text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}>
          <History className="w-5 h-5" />
          History
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
          <Settings className="w-5 h-5" />
          Configuration
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-700 dark:border-slate-800 space-y-4">
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-800 dark:bg-slate-900 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">JD</div>
          <div className="flex flex-col">
             <span className="text-sm font-medium">John Doe</span>
             <span className="text-xs text-slate-400">Accountant Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const AppContent = () => {
  const [screen, setScreen] = useState<Screen>('LOGIN');
  const [selectedDocs, setSelectedDocs] = useState<Document[]>([]);

  const handleLogin = () => setScreen('INGEST');

  const handleProcessComplete = (docs: Document[]) => {
    if (docs.length > 0) {
       setSelectedDocs(docs);
       setScreen('DETAIL');
    }
  };

  const handleBack = () => {
    setScreen('INGEST');
    setSelectedDocs([]);
  };

  const handleSave = () => {
    // Simulate save
    alert("Invoice Posted Successfully to Exact Online!");
    setScreen('INGEST');
    setSelectedDocs([]);
  };

  if (screen === 'LOGIN') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar activeScreen={screen} onNavigate={setScreen} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {screen === 'INGEST' && (
          <IngestScreen onProcessComplete={handleProcessComplete} />
        )}
        
        {screen === 'DETAIL' && selectedDocs.length > 0 && (
          <DetailCockpit 
            document={selectedDocs[0]} 
            onBack={handleBack} 
            onSave={handleSave} 
          />
        )}

        {screen === 'HISTORY' && (
          <HistoryScreen />
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}