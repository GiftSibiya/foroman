import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      toast.success('Check your email for the reset code');
      navigate('/reset-password/verify', {
        replace: true,
        state: { email: email.trim() },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="text-2xl font-bold text-slate-900 dark:text-white no-underline"
          >
            Foroman
          </Link>
          <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-100">
            Forgot password
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter your email and we&apos;ll send you a code to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Sending…' : 'Send reset code'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Remember your password?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
