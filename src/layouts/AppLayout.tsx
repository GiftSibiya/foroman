import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar, AppNavbar } from '../components/ComponentsIndex';
import useAuthStore from '../stores/data/AuthStore';
import { useCompanyStore } from '../stores/data/CompanyStore';
import useThemeStore from '../stores/state/ThemeStore';

export function AppLayout() {
  const sessionUser = useAuthStore((s) => s.sessionUser);
  const fetchUserCompanies = useCompanyStore((s) => s.fetchUserCompanies);
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (sessionUser?.id != null) {
      fetchUserCompanies(Number(sessionUser.id));
    }
  }, [sessionUser?.id, fetchUserCompanies]);

  return (
    <div
      className={`flex min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${isDark ? 'dark' : ''}`}
      data-theme={theme}
    >
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <AppNavbar />
        <main className="flex-1 min-h-0 p-6 overflow-auto bg-slate-50 dark:bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
