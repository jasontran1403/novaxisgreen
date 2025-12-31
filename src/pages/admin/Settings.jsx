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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRate();
    fetchMaintenance();
    fetchNotifications();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.SETTINGS_ADMINS);
      if (res.success) {
        setAdmins(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.SETTINGS_EXCHANGE_RATE);
      if (res.success) {
        setExchangeRate(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch exchange rate:', err);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.SETTINGS_MAINTENANCE);
      if (res.success) {
        setMaintenance(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch maintenance:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get(API_ENDPOINTS.ADMIN.SETTINGS_NOTIFICATIONS);
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleUpdateExchangeRate = async () => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.SETTINGS_EXCHANGE_RATE, exchangeRate);
      if (res.success) {
        alert('Exchange rate updated successfully');
      }
    } catch (err) {
      alert(err.message || 'Failed to update exchange rate');
    }
  };

  const handleUpdateMaintenance = async (type, enabled, message) => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.SETTINGS_MAINTENANCE, {
        type,
        enabled,
        message
      });
      if (res.success) {
        alert('Maintenance status updated successfully');
        fetchMaintenance();
      }
    } catch (err) {
      alert(err.message || 'Failed to update maintenance');
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      const res = await api.post(API_ENDPOINTS.ADMIN.SETTINGS_NOTIFICATIONS, notifications);
      if (res.success) {
        alert('Notifications updated successfully');
      }
    } catch (err) {
      alert(err.message || 'Failed to update notifications');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-4 md:p-6">
        <h2 className="text-xl font-semibold text-emerald-400 mb-4">System Settings</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-emerald-500/30 overflow-x-auto">
          {['discord', 'exchange', 'maintenance', 'notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Discord Webhook */}
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
      </div>
    </div>
  );
}

export default Settings;

