import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginUser } from '../services/api';
import { LogIn, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export const UserLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username/email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await loginUser({ username, password });
      
      login(data.username, 'user', {
        id: data.id,
        email: data.email,
        phone: data.phone,
        fullName: data.fullName,
        avatar: data.avatar,
        isVerified: data.isVerified,
      }, data.token);

      navigate('/account');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center pt-12 pb-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
            <LogIn className="text-accent" size={32} />
          </div>
          <h2 className="text-4xl font-black text-primary tracking-tight font-garamond">Welcome Back</h2>
          <p className="mt-2 text-sm text-muted font-medium">Please enter your details to sign in</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100 animate-in fade-in zoom-in-95">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                  placeholder="john_doe or john@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-4 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all bg-gray-50/50"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-muted">
                Remember me
              </label>
            </div>

            <div className="text-xs">
              <Link to="/account/forgot-password" className="font-bold text-accent hover:text-accent-dark transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Signing in...</span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-xs font-medium text-muted">
            Don't have an account?{' '}
            <Link to="/account/register" className="font-black text-accent hover:text-accent-dark transition-colors underline decoration-2 underline-offset-4">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
