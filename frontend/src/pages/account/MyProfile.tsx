import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { updateUserProfile, changePassword } from '../../services/api';
import {
  User, Mail, Phone, Camera, Save, Lock, Loader2,
  CheckCircle2, AlertCircle, Eye, EyeOff, Shield, ShieldCheck
} from 'lucide-react';

export const MyProfile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { data: userData, loading, fetchUserData } = useUserStore();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserData(user.id, user.username);
    }
  }, [user, fetchUserData]);

  useEffect(() => {
    const profileData = userData?.profile || (user ? {
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
    } : null);

    if (profileData) {
      const isDifferent = 
        form.fullName !== (profileData.fullName || '') ||
        form.email !== (profileData.email || '') ||
        form.phone !== (profileData.phone || '') ||
        form.avatar !== (profileData.avatar || '');

      if (isDifferent) {
        Promise.resolve().then(() => {
          setForm({
            fullName: profileData.fullName || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            avatar: profileData.avatar || '',
          });
        });
      }
    }
  }, [userData, user, form]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUserProfile(user!.id!, {
        fullName: form.fullName,
        phone: form.phone,
        avatar: form.avatar,
      });
      updateUser({ fullName: form.fullName, phone: form.phone, avatar: form.avatar });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSavingPw(true);
    setError('');
    setSuccess('');
    try {
      await changePassword(user!.id!, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password.';
      setError(message);
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '140px', borderRadius: '1.5rem', marginBottom: '1.25rem' }} />
        <div className="skeleton-dashboard-card shimmer-skeleton" style={{ height: '400px', borderRadius: '1.5rem' }} />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header-card">
        <div className="profile-avatar-area">
          <div className="profile-avatar">
            {form.avatar ? (
              <img src={form.avatar} alt="Avatar" />
            ) : (
              <User size={36} />
            )}
            <button className="profile-avatar-edit" title="Change avatar">
              <Camera size={14} />
            </button>
          </div>
          <div className="profile-avatar-info">
            <h2>{form.fullName || user?.username}</h2>
            <p>@{user?.username}</p>
            <div className={`profile-verified-badge ${user?.isVerified ? 'profile-verified-badge--yes' : ''}`}>
              {user?.isVerified ? <ShieldCheck size={12} /> : <Shield size={12} />}
              {user?.isVerified ? 'Verified' : 'Not Verified'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'profile' ? 'profile-tab--active' : ''}`}
          onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
        >
          <User size={16} /> Personal Info
        </button>
        <button
          className={`profile-tab ${activeTab === 'password' ? 'profile-tab--active' : ''}`}
          onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
        >
          <Lock size={16} /> Change Password
        </button>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="profile-alert profile-alert--success">
          <CheckCircle2 size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="profile-alert profile-alert--error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <form className="profile-form" onSubmit={handleSaveProfile}>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label><User size={14} /> Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div className="profile-field">
              <label><Mail size={14} /> Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="profile-field--disabled"
                title="Email cannot be changed"
              />
              <span className="profile-field-hint">Email cannot be changed after registration</span>
            </div>
            <div className="profile-field">
              <label><Phone size={14} /> Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
            <div className="profile-field">
              <label><Camera size={14} /> Avatar URL</label>
              <input
                type="url"
                value={form.avatar}
                onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
          <button type="submit" disabled={saving} className="profile-save-btn">
            {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <form className="profile-form" onSubmit={handleChangePassword}>
          <div className="profile-form-grid profile-form-grid--single">
            <div className="profile-field">
              <label><Lock size={14} /> Current Password</label>
              <div className="profile-field-pw">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="profile-pw-toggle">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="profile-field">
              <label><Lock size={14} /> New Password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                required
                placeholder="Min 6 characters"
              />
            </div>
            <div className="profile-field">
              <label><Lock size={14} /> Confirm New Password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                required
                placeholder="Re-type new password"
              />
            </div>
          </div>
          <button type="submit" disabled={savingPw} className="profile-save-btn">
            {savingPw ? <><Loader2 className="animate-spin" size={18} /> Updating...</> : <><Lock size={18} /> Update Password</>}
          </button>
        </form>
      )}
    </div>
  );
};
