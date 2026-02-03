import { Link, Outlet, useLocation } from 'react-router-dom';

const SETTINGS_TABS = [
  { to: '/app/settings', label: 'Profile', exact: true },
  { to: '/app/settings/company', label: 'Company', exact: false },
  { to: '/app/settings/preferences', label: 'Preferences', exact: false },
];

export function SettingsPage() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="mt-1 text-slate-600">Manage your account and preferences.</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {SETTINGS_TABS.map((tab) => {
          const isActive = tab.exact
            ? location.pathname === tab.to
            : location.pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors no-underline ${
                isActive
                  ? 'bg-white border border-slate-200 border-b-white -mb-px text-indigo-600'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
