import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { authService } from '../../services/authService';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetToken = sessionStorage.getItem('reset_token');
  const email = sessionStorage.getItem('reset_email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !email) {
      toast.error('Session expired. Please start over.');
      navigate('/forgot-password', { replace: true });
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPasswordWithToken(email, resetToken, password);
      sessionStorage.removeItem('reset_token');
      sessionStorage.removeItem('reset_email');
      toast.success('Password reset successfully. You can now log in.');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Session expired
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please start the password reset process again.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 no-underline"
          >
            Forgot password
          </Link>
          <p>
            <Link
              to="/login"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    );
  }

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
            Set new password
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Enter your new password below (min 8 characters).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <LuEyeOff size={20} />
                ) : (
                  <LuEye size={20} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 pr-10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <LuEyeOff size={20} />
                ) : (
                  <LuEye size={20} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
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
