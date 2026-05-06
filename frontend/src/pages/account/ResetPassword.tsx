import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import { Lock, AlertCircle, Loader2, ShieldCheck, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(prefillEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !code || !newPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, code, newPassword });
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Reset failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-[2rem] shadow-2xl shadow-primary/5 border border-gray-100 text-center">
          <div className="mx-auto h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle2 className="text-green-500" size={24} />
          </div>
          <h2 className="text-2xl font-black text-primary tracking-tight font-garamond">Password Reset!</h2>
          <p className="text-sm text-muted font-medium">Your password has been changed successfully. You can now log in.</p>
          <button
            onClick={() => navigate('/account/login')}
            className="inline-block w-full py-3 px-4 text-sm font-black rounded-xl text-white bg-green-600 hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 active:scale-[0.98]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-[2rem] shadow-2xl shadow-primary/5 border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <ShieldCheck className="text-blue-500" size={24} />
          </div>
          <h2 className="text-2xl font-black text-primary tracking-tight font-garamond">Reset Password</h2>
          <p className="mt-1 text-sm text-muted font-medium">Enter your reset code and a new password</p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100 animate-in fade-in zoom-in-95">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>

          {/* OTP Code */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Reset Code</label>
            <input
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-2xl font-black text-center tracking-[0.5em] placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
              placeholder="000000"
              disabled={loading}
            />
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-11 pr-12 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                placeholder="Min 6 characters"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-11 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                placeholder="Re-type password"
                disabled={loading}
              />
              {confirmPassword && newPassword === confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-green-500">
                  <CheckCircle2 size={16} />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-black rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Resetting...</span>
            ) : 'Reset Password'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] font-medium text-muted">
            <Link to="/account/login" className="font-black text-accent hover:text-accent-dark transition-colors underline decoration-2 underline-offset-4">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
