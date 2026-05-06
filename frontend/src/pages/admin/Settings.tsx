import React, { useState } from 'react';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { CheckCircle, Copy, ExternalLink, Mail, Bell, Send, Loader2, AlertCircle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // ── Email Notification Settings ──
  const [adminEmail, setAdminEmail] = useState(() => {
    return localStorage.getItem('pphouse_admin_email') || '';
  });
  const [emailSaved, setEmailSaved] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // ── Payment Settings ──
  const [paymentSettings, setPaymentSettings] = useState({
    bkash_number: '',
    nagad_number: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/v1/settings');
        if (res.ok) {
          const data = await res.json();
          setPaymentSettings({
            bkash_number: data.bkash_number || '',
            nagad_number: data.nagad_number || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSavePaymentSettings = async () => {
    setSettingsLoading(true);
    setSettingsSaved(false);
    try {
      const res = await fetch('/api/v1/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentSettings),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      alert('URL copied to clipboard!');
    }
  };

  const handleSaveEmail = () => {
    localStorage.setItem('pphouse_admin_email', adminEmail);
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 3000);
  };

  const handleTestEmail = async () => {
    if (!adminEmail) {
      setTestResult({ ok: false, msg: 'Please enter an email address first.' });
      return;
    }

    setTestSending(true);
    setTestResult(null);

    try {
      // Send a test notification via the API
      const res = await fetch('/api/v1/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setTestResult({ ok: true, msg: 'Test email sent! Check your inbox.' });
      } else {
        setTestResult({ ok: false, msg: data.message || 'Failed to send test email.' });
      }
    } catch {
      setTestResult({ ok: false, msg: 'Network error. Is the backend running?' });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* ── Email Notifications ── */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-xl shadow-primary/5 border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Bell className="text-blue-500" size={20} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-primary">Email Notifications</h2>
            <p className="text-muted font-medium text-[10px] md:text-sm">Configure where order notification emails are sent</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-primary uppercase tracking-widest ml-1">Admin Notification Email</label>
            <p className="text-xs text-muted ml-1">New order alerts and system notifications will be sent to this address.</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => { setAdminEmail(e.target.value); setEmailSaved(false); }}
                className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveEmail}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              {emailSaved ? (
                <><CheckCircle size={18} /> Saved!</>
              ) : (
                'Save Email'
              )}
            </button>
            <button
              onClick={handleTestEmail}
              disabled={testSending || !adminEmail}
              className="flex items-center justify-center gap-2 py-3.5 px-6 border-2 border-blue-500 text-sm font-black rounded-2xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testSending ? (
                <><Loader2 className="animate-spin" size={18} /> Sending...</>
              ) : (
                <><Send size={16} /> Test</>
              )}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border animate-in zoom-in-95 duration-300 ${
              testResult.ok
                ? 'bg-green-50 text-green-600 border-green-100'
                : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {testResult.ok ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {testResult.msg}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
          <p className="text-xs font-medium text-blue-800/70 leading-relaxed">
            <strong>How it works:</strong> When a customer places an order, an email notification is sent to this address.
            You'll also receive emails for cancellation requests and return requests. Make sure you have the
            <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 text-[10px] font-black mx-1">GOOGLE_SCRIPT_URL</code>
            environment variable configured for email delivery.
          </p>
        </div>
      </div>

      {/* ── Payment Settings ── */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-xl shadow-primary/5 border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="text-orange-500" size={20} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-primary">Payment Settings</h2>
            <p className="text-muted font-medium text-[10px] md:text-sm">Configure MFS numbers for customer payments</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#e2136e] uppercase tracking-widest ml-1">Personal bKash Number</label>
              <input
                type="text"
                value={paymentSettings.bkash_number}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, bkash_number: e.target.value })}
                className="block w-full px-4 py-4 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#e2136e]/10 focus:border-[#e2136e] transition-all bg-gray-50/50"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#f7941d] uppercase tracking-widest ml-1">Personal Nagad Number</label>
              <input
                type="text"
                value={paymentSettings.nagad_number}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, nagad_number: e.target.value })}
                className="block w-full px-4 py-4 border border-gray-200 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#f7941d]/10 focus:border-[#f7941d] transition-all bg-gray-50/50"
                placeholder="01XXXXXXXXX"
              />
            </div>
          </div>

          <button
            onClick={handleSavePaymentSettings}
            disabled={settingsLoading}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-accent hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 active:scale-[0.98] disabled:opacity-50"
          >
            {settingsLoading ? (
              <><Loader2 className="animate-spin" size={18} /> Saving...</>
            ) : settingsSaved ? (
              <><CheckCircle size={18} /> Settings Saved Successfully!</>
            ) : (
              'Save Payment Settings'
            )}
          </button>
        </div>
      </div>

      {/* ── Image Upload ── */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-xl shadow-primary/5 border border-gray-100">
        <h2 className="text-xl md:text-2xl font-black text-primary mb-2">Image Storage (ImgBB)</h2>
        <p className="text-muted font-medium text-[10px] md:text-sm mb-8">Test your ImgBB integration here. Upload an image to get a permanent URL.</p>

        <div className="space-y-6">
          <ImageUpload 
            label="Test Upload" 
            onUploadSuccess={(url) => setUploadedUrl(url)} 
          />

          {uploadedUrl && (
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 text-green-600 mb-4">
                <CheckCircle size={20} />
                <span className="font-black text-xs uppercase tracking-widest">Upload Successful!</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={uploadedUrl} 
                  className="flex-grow bg-white border border-green-200 rounded-xl px-4 py-3 text-sm font-medium text-primary focus:outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-white border border-green-200 text-green-600 rounded-xl hover:bg-green-100 transition-colors shadow-sm"
                >
                  <Copy size={20} />
                </button>
                <a 
                  href={uploadedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-8 border border-amber-100">
        <h3 className="text-lg font-black text-amber-800 mb-2">Technical Information</h3>
        <p className="text-sm font-medium text-amber-700/80 leading-relaxed">
          Your images are currently being uploaded to ImgBB using the API key provided in your environment variables. 
          The URLs returned are high-quality, permanent links that can be used directly in your products and banners.
        </p>
      </div>
    </div>
  );
};
