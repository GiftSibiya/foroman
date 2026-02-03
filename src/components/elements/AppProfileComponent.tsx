import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuUser, LuLogOut, LuMoon, LuSun } from 'react-icons/lu';
import useAuthStore from '../../stores/data/AuthStore';
import useThemeStore from '../../stores/state/ThemeStore';

export default function AppProfileComponent() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const sessionUser = useAuthStore((s) => s.sessionUser);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    setOpen(false);
    navigate('/app/settings');
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const name = sessionUser?.name ?? sessionUser?.email ?? 'User';
  const initial = (name.charAt(0) ?? 'U').toUpperCase();
  const email = sessionUser?.email ?? '';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-100 transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 min-w-[12rem] py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-[100]">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-indigo-600 text-white font-semibold text-sm">
              {initial}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {name}
              </span>
              {email && (
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{email}</span>
              )}
            </div>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
          <button
            type="button"
            onClick={handleProfile}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors"
          >
            <LuUser size={16} />
            Profile
          </button>
          <button
            type="button"
            onClick={handleThemeToggle}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors"
          >
            {theme === 'dark' ? <LuSun size={16} /> : <LuMoon size={16} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 text-left transition-colors"
          >
            <LuLogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
