import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api';
import { Mail, AlertCircle, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center pt-12 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-md w-full space-y-6 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100 text-center">
          <div className="mx-auto h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 className="text-green-500" size={32} />
          </div>
          <h2 className="text-3xl font-black text-primary tracking-tight font-garamond">Check Your Email</h2>
          <p className="text-sm text-muted font-medium">
            If an account exists for <strong className="text-primary">{email}</strong>, we've sent a 6-digit reset code.
          </p>
          <Link
            to={`/account/reset-password?email=${encodeURIComponent(email)}`}
            className="inline-block w-full py-4 px-4 text-sm font-black rounded-2xl text-white bg-primary hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-[0.98] text-center"
          >
            Enter Reset Code
          </Link>
          <p className="text-xs text-muted">
            <Link to="/account/login" className="font-bold text-accent hover:text-accent-dark underline decoration-2 underline-offset-4">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-12 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
            <KeyRound className="text-amber-500" size={32} />
          </div>
          <h2 className="text-3xl font-black text-primary tracking-tight font-garamond">Forgot Password</h2>
          <p className="mt-2 text-sm text-muted font-medium">
            Enter your email and we'll send you a reset code
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100 animate-in fade-in zoom-in-95">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                placeholder="john@example.com"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Sending...</span>
            ) : 'Send Reset Code'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs font-medium text-muted">
            Remember your password?{' '}
            <Link to="/account/login" className="font-black text-accent hover:text-accent-dark transition-colors underline decoration-2 underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
