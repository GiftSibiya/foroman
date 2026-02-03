import useAuthStore from '@/stores/data/AuthStore';

export function ProfileSettingsPage() {
  const sessionUser = useAuthStore((s) => s.sessionUser);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Profile</h2>
      <p className="mt-1 text-sm text-slate-600">Your account information.</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-slate-500">Name</dt>
          <dd className="mt-1 text-slate-800">{sessionUser?.name ?? sessionUser?.full_name ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Email</dt>
          <dd className="mt-1 text-slate-800">{sessionUser?.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-slate-500">Phone</dt>
          <dd className="mt-1 text-slate-800">{sessionUser?.phone ?? '—'}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm text-slate-500">
        Profile editing will be available in a future update.
      </p>
    </div>
  );
}
