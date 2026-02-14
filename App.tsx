import React, { useState, useEffect, createContext, useContext } from 'react';
import { Screen, Document } from './types';
import { IngestScreen } from './components/IngestScreen';
import { DetailCockpit } from './components/DetailCockpit';
import { HistoryScreen } from './components/HistoryScreen';
import { 
  Search, HelpCircle, Plus, LayoutGrid, FileText, Bell, User, 
  Menu, Building2, ChevronDown, Lock, AlertCircle, X
} from 'lucide-react';

// --- Theme Context ---
type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({ theme: 'light', toggleTheme: () => {} });

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Default to light to match screenshot, respect system if needed
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

// --- Login Screen ---
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.toLowerCase() === 'exact2025') {
      onLogin();
    } else {
      setError(true);
      setAccessCode('');
    }
  };

  return (
    <div className="min-h-screen bg-exact-bg dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
             <span className="font-bold text-3xl tracking-tighter text-slate-800 dark:text-white">
               <span className="text-exact-red text-4xl mr-0.5">=</span>exact
             </span>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded shadow-exact border border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Inloggen</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gebruikersnaam</label>
              <input 
                type="text"
                disabled
                value="John Doe"
                className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Toegangscode</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  value={accessCode}
                  onChange={(e) => { setAccessCode(e.target.value); setError(false); }}
                  placeholder="exact2025"
                  className={`w-full pl-9 pr-3 py-2 rounded border ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-exact-blue focus:border-exact-blue outline-none transition-all`}
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-exact-red text-xs animate-pulse">
                <AlertCircle className="w-3 h-3" />
                <span>Onjuiste code</span>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-exact-blue hover:bg-exact-dark text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center"
            >
              Inloggen
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">© 2025 Exact Group B.V.</p>
      </div>
    </div>
  );
};

// --- Top Navigation (Matches Screenshot) ---
const TopNavigation = ({ onNavigate, activeScreen }: { onNavigate: (s: Screen) => void, activeScreen: Screen }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col bg-white dark:bg-slate-800 shadow-sm z-50 relative">
      {/* Red Top Border */}
      <div className="h-1 bg-exact-red w-full" />
      
      {/* Navbar Content */}
      <div className="h-14 md:h-12 flex items-center justify-between px-3 md:px-4 border-b border-slate-200 dark:border-slate-700">
        
        {/* Left Side: Logo & Menu */}
        <div className="flex items-center gap-2 md:gap-6">
          
          {/* Mobile Hamburger */}
          <button 
            className="md:hidden text-slate-500 p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('INGEST')}>
             <span className="font-bold text-xl tracking-tighter text-slate-800 dark:text-white flex items-center">
               <span className="text-exact-red text-2xl mr-0.5 mt-[-2px]">=</span>exact
             </span>
          </div>

          {/* Company Context Dropdown - Hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
            <span className="text-xs font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-500 text-slate-600 dark:text-slate-300">9666</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-white truncate max-w-[100px] md:max-w-none">Cycling World</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>

          {/* Menu Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <button 
              onClick={() => onNavigate('INGEST')}
              className={`font-medium transition-colors ${activeScreen === 'INGEST' || activeScreen === 'DETAIL' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              Cockpits
            </button>
            <button 
              onClick={() => onNavigate('HISTORY')}
              className={`font-medium transition-colors ${activeScreen === 'HISTORY' ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              Accountancy
            </button>
            <button className="text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium dark:hover:text-slate-200">
              Medewerkers
            </button>
          </nav>
        </div>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-2 md:gap-4 text-slate-500 dark:text-slate-400">
          <Search className="w-5 h-5 cursor-pointer hover:text-exact-blue hidden sm:block" />
          <Plus className="w-5 h-5 cursor-pointer hover:text-exact-blue border border-slate-300 dark:border-slate-600 rounded p-0.5 hidden sm:block" />
          <div className="relative">
            <Bell className="w-5 h-5 cursor-pointer hover:text-exact-blue" />
            <span className="absolute -top-1.5 -right-1.5 bg-exact-blue text-white text-[10px] font-bold px-1 rounded-full">1</span>
          </div>
          <div className="w-7 h-7 bg-exact-blue text-white rounded-full flex items-center justify-center text-xs font-bold cursor-pointer ml-1">
            EA
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
              <span className="text-xs font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-500 text-slate-600 dark:text-slate-300">9666</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-white">Cycling World</span>
            </div>
            <nav className="flex flex-col gap-3">
              <button 
                onClick={() => { onNavigate('INGEST'); setMobileMenuOpen(false); }}
                className={`text-left font-medium p-2 rounded ${activeScreen === 'INGEST' || activeScreen === 'DETAIL' ? 'bg-exact-light text-exact-blue dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Cockpits
              </button>
              <button 
                onClick={() => { onNavigate('HISTORY'); setMobileMenuOpen(false); }}
                className={`text-left font-medium p-2 rounded ${activeScreen === 'HISTORY' ? 'bg-exact-light text-exact-blue dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Accountancy
              </button>
              <button className="text-left font-medium p-2 text-slate-600 dark:text-slate-300">
                Medewerkers
              </button>
            </nav>
        </div>
      )}
    </div>
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
    <div className="flex flex-col h-screen w-screen bg-exact-bg dark:bg-slate-900 overflow-hidden">
      <TopNavigation activeScreen={screen} onNavigate={setScreen} />
      
      <main className="flex-1 overflow-hidden relative">
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