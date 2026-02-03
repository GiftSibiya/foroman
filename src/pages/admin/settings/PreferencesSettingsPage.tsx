export function PreferencesSettingsPage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Preferences</h2>
      <p className="mt-1 text-sm text-slate-600">Customize your experience.</p>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-slate-800">Currency</p>
            <p className="text-sm text-slate-500">Default currency for invoices and statements</p>
          </div>
          <span className="text-sm text-slate-600">ZAR (Rand)</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="font-medium text-slate-800">Date format</p>
            <p className="text-sm text-slate-500">How dates are displayed</p>
          </div>
          <span className="text-sm text-slate-600">MM/DD/YYYY</span>
        </div>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Preference editing will be available in a future update.
      </p>
    </div>
  );
}
