import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { registerUser, loginUser } from '../services/api';
import {
  UserPlus, User, Mail, Lock, Phone, AlertCircle,
  Loader2, Eye, EyeOff, CheckCircle2, Shield
} from 'lucide-react';

export const UserRegister: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userId, setUserId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordStrength = (() => {
    const p = form.password;
    if (p.length === 0) return { label: '', width: '0%', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2) return { label: 'Weak', width: '33%', color: '#ef4444' };
    if (score <= 3) return { label: 'Fair', width: '55%', color: '#f59e0b' };
    if (score <= 4) return { label: 'Strong', width: '80%', color: '#22c55e' };
    return { label: 'Very Strong', width: '100%', color: '#10b981' };
  })();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!form.username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      setError('Username must be 3-20 characters (letters, numbers, underscores only).');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        username: form.username,
        password: form.password,
        email: form.email || undefined,
        phone: form.phone || undefined,
        fullName: form.fullName || undefined,
      });

      setUserId(data.id);
      
      // If email was provided, go to OTP step; otherwise auto-login
      if (form.email) {
        setStep('otp');
      } else {
        // Auto-login after registration
        await autoLogin();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const autoLogin = async () => {
    try {
      const data = await loginUser({ username: form.username, password: form.password });
      login(data.username, 'user', {
        id: data.id,
        email: data.email,
        phone: data.phone,
        fullName: data.fullName,
        avatar: data.avatar,
        isVerified: data.isVerified,
      }, data.token);
      navigate('/account');
    } catch {
      navigate('/account/login');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter a valid OTP code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Call verify API
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      // Auto-login after verification
      await autoLogin();
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await fetch('/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setError('');
    } catch {
      // Silent fail for resend
    }
  };

  // ── OTP Step ──
  if (step === 'otp') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center pt-12 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="text-green-500" size={32} />
            </div>
            <h2 className="text-3xl font-black text-primary tracking-tight font-garamond">Verify Your Email</h2>
            <p className="mt-2 text-sm text-muted font-medium">
              We've sent a verification code to<br />
              <strong className="text-primary">{form.email}</strong>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Verification Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="block w-full px-4 py-4 border border-gray-200 rounded-2xl text-2xl font-black text-center tracking-[0.5em] placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                placeholder="000000"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 4}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all shadow-xl shadow-green-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Verifying...</span>
              ) : 'Verify & Continue'}
            </button>
          </form>

          <div className="text-center space-y-3 pt-2">
            <p className="text-xs text-muted">
              Didn't receive the code?{' '}
              <button onClick={handleResendOtp} className="font-black text-accent hover:text-accent-dark underline decoration-2 underline-offset-4">
                Resend
              </button>
            </p>
            <button
              onClick={autoLogin}
              className="text-xs font-bold text-muted hover:text-primary underline decoration-1 underline-offset-4"
            >
              Skip verification for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Step ──
  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-8 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-md w-full space-y-4 bg-white p-6 rounded-3xl shadow-2xl shadow-primary/5 border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-2">
            <UserPlus className="text-accent" size={24} />
          </div>
          <h2 className="text-2xl font-black text-primary tracking-tight font-garamond">Create Account</h2>
          <p className="mt-1 text-xs text-muted font-medium">Join PlayPen House for the best baby products</p>
        </div>

        <form className="mt-4 space-y-3.5" onSubmit={handleRegister}>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Username *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-gray-400 font-bold text-sm">@</span>
              </div>
              <input
                type="text"
                name="username"
                required
                value={form.username}
                onChange={handleChange}
                className="block w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                placeholder="john_doe"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email & Phone Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                  placeholder="john@mail.com"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                  placeholder="+880 1XXXXXXXXX"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                placeholder="Min 6 characters"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="flex items-center gap-2 mt-1.5 px-1">
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                  />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Confirm Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                placeholder="Re-type password"
                disabled={loading}
              />
              {form.confirmPassword && form.password === form.confirmPassword && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
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
              <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Creating account...</span>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs font-medium text-muted">
            Already have an account?{' '}
            <Link to="/account/login" className="font-black text-accent hover:text-accent-dark transition-colors underline decoration-2 underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
