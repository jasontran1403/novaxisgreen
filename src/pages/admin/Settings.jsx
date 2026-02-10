import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';

function Settings() {
  const [activeTab, setActiveTab] = useState('discord');
  const [exchangeRate, setExchangeRate] = useState({ novaToUsd: 0 });
  const [maintenance, setMaintenance] = useState({
    withdraw: { enabled: false, message: '' },
    swap: { enabled: false, message: '' },
    transfer: { enabled: false, message: '' }
  });
  const [notifications, setNotifications] = useState({ text: '', enabled: false });

  // ── New states for Admin 2FA ──
  const [twoFA, setTwoFA] = useState({
    enabled: false,
    qrCode: '',
    secret: ''
  });
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
    fetchMaintenance();
    fetchNotifications();
    fetch2FAInfo();           // ← thêm gọi api 2fa info
  }, []);

  // ── Fetch 2FA info for current admin ──
  const fetch2FAInfo = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.GET_2FA_INFO);
      if (res.success && res.data) {
        setTwoFA({
          enabled: res.data.enabled || false,
          qrCode: res.data.qrCode || '',
          secret: res.data.secret || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch 2FA info:', err);
    }
  };

  // ── Enable 2FA ──
  const handleEnable2FA = async () => {
    if (twoFACode.length !== 6) {
      setTwoFAError('Please enter a valid 6-digit code');
      return;
    }

    setTwoFALoading(true);
    setTwoFAError('');
    setTwoFASuccess('');

    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.ENABLE_2FA, { code: twoFACode });
      if (res.success) {
        setTwoFASuccess('2FA enabled successfully!');
        setTwoFA(prev => ({ ...prev, enabled: true, qrCode: '', secret: '' }));
        setTwoFACode('');
      } else {
        setTwoFAError(res.error || 'Failed to enable 2FA');
      }
    } catch (err) {
      setTwoFAError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error enabling 2FA'
      );
    } finally {
      setTwoFALoading(false);
    }
  };

  // ── Disable 2FA ──
  const handleDisable2FA = async () => {
    if (twoFACode.length !== 6) {
      setTwoFAError('Please enter a valid 6-digit code');
      return;
    }

    setTwoFALoading(true);
    setTwoFAError('');
    setTwoFASuccess('');

    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.DISABLE_2FA, { code: twoFACode });
      if (res.success) {
        setTwoFASuccess('2FA disabled successfully');
        setTwoFA(prev => ({ ...prev, enabled: false }));
        setTwoFACode('');
        // Optional: fetch lại để chắc chắn
        fetch2FAInfo();
      } else {
        setTwoFAError(res.error || 'Invalid code or failed to disable 2FA');
      }
    } catch (err) {
      setTwoFAError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error disabling 2FA'
      );
    } finally {
      setTwoFALoading(false);
    }
  };

  // ── Copy secret helper ──
  const handleCopySecret = () => {
    if (twoFA.secret) {
      navigator.clipboard.writeText(twoFA.secret);
      setTwoFASuccess('Secret copied to clipboard!');
      setTimeout(() => setTwoFASuccess(''), 2000);
    }
  };

  // ── Các fetch khác giữ nguyên ──
  const fetchExchangeRate = async () => { /* ... giữ nguyên */ };
  const fetchMaintenance = async () => { /* ... giữ nguyên */ };
  const fetchNotifications = async () => { /* ... giữ nguyên */ };

  const handleUpdateExchangeRate = async () => { /* ... giữ nguyên */ };
  const handleUpdateMaintenance = async (type, enabled, message) => { /* ... giữ nguyên */ };
  const handleUpdateNotifications = async () => { /* ... giữ nguyên */ };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        <h2 className="text-xl font-semibold text-emerald-400 mb-4">System Settings</h2>

        {/* Tabs – thêm tab "2fa" */}
        <div className="flex gap-2 mb-4 border-b border-emerald-500/30 overflow-x-auto">
          {['discord', 'exchange', 'maintenance', 'notifications', '2fa'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              {tab === '2fa' ? '2FA (Admin)' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'discord' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Discord Webhook Configuration</h3>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30">
              <p className="text-sm text-slate-300 mb-4">
                Configure Discord webhook URL to receive notifications for user actions (invest, transfer, swap, withdraw).
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await api.post(API_ENDPOINTS.ADMIN.SETTINGS_DISCORD_WEBHOOK, {
                        action: 'decrypt'
                      });
                      if (res.success) {
                        alert(`Current webhook URL: ${res.data.url || 'Not configured'}`);
                      }
                    } catch (err) {
                      alert(err.message || 'Failed to get webhook URL');
                    }
                  }}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded text-blue-400 text-sm"
                >
                  View Current URL
                </button>
                <button
                  onClick={async () => {
                    const url = prompt('Enter Discord webhook URL:');
                    if (url) {
                      try {
                        const res = await api.post(API_ENDPOINTS.ADMIN.SETTINGS_DISCORD_WEBHOOK, {
                          url,
                          action: 'encrypt'
                        });
                        if (res.success) {
                          alert('Discord webhook URL saved successfully!');
                        }
                      } catch (err) {
                        alert(err.message || 'Failed to save webhook URL');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded text-green-400 text-sm"
                >
                  Update URL
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await api.post('/api/admin/settings/discord-webhook/test');
                      if (res.success) {
                        alert('Test notification sent! Please check your Discord channel.');
                      }
                    } catch (err) {
                      alert(err.message || 'Failed to send test notification');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded text-emerald-400 text-sm"
                >
                  🧪 Test Webhook
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exchange Rate */}
        {activeTab === 'exchange' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">NOVA Exchange Rate</h3>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30">
              <label className="block text-sm text-slate-300 mb-2">NOVA to USD Rate</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={exchangeRate.novaToUsd}
                  onChange={(e) => setExchangeRate({ novaToUsd: parseFloat(e.target.value) || 0 })}
                  className="flex-1 px-3 py-2 bg-slate-600 border border-emerald-500/30 rounded text-white"
                />
                <button
                  onClick={handleUpdateExchangeRate}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded text-emerald-400"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Maintenance Mode</h3>
            {['withdraw', 'swap', 'transfer'].map((type) => (
              <div key={type} className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-emerald-400 capitalize">{type}</h4>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={maintenance[type]?.enabled || false}
                      onChange={(e) => {
                        handleUpdateMaintenance(type, e.target.checked, maintenance[type]?.message || '');
                      }}
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-slate-300">Enable Maintenance</span>
                  </label>
                </div>
                <textarea
                  value={maintenance[type]?.message || ''}
                  onChange={(e) => {
                    setMaintenance(prev => ({
                      ...prev,
                      [type]: { ...prev[type], message: e.target.value }
                    }));
                  }}
                  onBlur={() => {
                    handleUpdateMaintenance(type, maintenance[type]?.enabled || false, maintenance[type]?.message || '');
                  }}
                  placeholder="Maintenance message..."
                  className="w-full px-3 py-2 bg-slate-600 border border-emerald-500/30 rounded text-white text-sm"
                  rows="2"
                />
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">System Notifications</h3>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-emerald-500/30">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={notifications.enabled}
                  onChange={(e) => setNotifications(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-5 h-5"
                />
                <span className="text-sm text-slate-300">Enable Notification</span>
              </label>
              <textarea
                value={notifications.text}
                onChange={(e) => setNotifications(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Notification message..."
                className="w-full px-3 py-2 bg-slate-600 border border-emerald-500/30 rounded text-white text-sm mb-3"
                rows="4"
              />
              <button
                onClick={handleUpdateNotifications}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded text-emerald-400"
              >
                Update Notification
              </button>
            </div>
          </div>
        )}

        {/* ── New Tab: 2FA for Admin ── */}
        {activeTab === '2fa' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-emerald-400">Two-Factor Authentication (2FA)</h3>

            <div className="bg-slate-700/50 rounded-lg p-5 border border-emerald-500/30">
              {/* Status */}
              <div className="flex items-center justify-between mb-6 p-4 bg-slate-800/50 rounded border border-emerald-500/20">
                <span className="text-slate-300">Current Status:</span>
                <span className={`font-medium ${twoFA.enabled ? 'text-emerald-400' : 'text-red-400'}`}>
                  {twoFA.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {/* Messages */}
              {twoFAError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm text-center">
                  {twoFAError}
                </div>
              )}
              {twoFASuccess && (
                <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-300 text-sm text-center">
                  {twoFASuccess}
                </div>
              )}

              {/* Setup / Enable section – only show when NOT enabled */}
              {!twoFA.enabled && (
                <div className="space-y-6">
                  <p className="text-slate-300 text-center">
                    Scan this QR code with Google Authenticator, Authy, or similar app
                  </p>

                  {twoFA.qrCode && (
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-xl shadow border border-emerald-200">
                        <img
                          src={twoFA.qrCode}
                          alt="2FA QR Code"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {twoFA.secret && (
                    <div className="text-center text-sm text-emerald-400/90">
                      Can't scan? Enter manually:{' '}
                      <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
                        <code className="bg-slate-800 px-3 py-1.5 rounded font-mono tracking-wider">
                          {twoFA.secret}
                        </code>
                        <button
                          onClick={handleCopySecret}
                          className="p-2 text-emerald-400 hover:text-emerald-300"
                          title="Copy secret"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Enter 6-digit code from authenticator app
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={twoFACode}
                        onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full px-4 py-3 bg-slate-800 border border-emerald-500/50 rounded text-center text-2xl tracking-widest text-white placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>

                    <button
                      onClick={handleEnable2FA}
                      disabled={twoFALoading || twoFACode.length !== 6}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                    >
                      {twoFALoading ? 'Verifying...' : 'Enable 2FA'}
                    </button>
                  </div>
                </div>
              )}

              {/* Disable section – only show when ENABLED */}
              {twoFA.enabled && (
                <div className="space-y-4">
                  <p className="text-red-300 text-sm text-center">
                    Enter 6-digit code from your authenticator app to disable 2FA
                  </p>

                  <div>
                    <label className="block text-sm text-red-300 mb-2">
                      2FA Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 bg-slate-800 border border-red-500/50 rounded text-center text-2xl tracking-widest text-red-100 placeholder-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>

                  <button
                    onClick={handleDisable2FA}
                    disabled={twoFALoading || twoFACode.length !== 6}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded font-medium disabled:opacity-50 transition shadow-md"
                  >
                    {twoFALoading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;