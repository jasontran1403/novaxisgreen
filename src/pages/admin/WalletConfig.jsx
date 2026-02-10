import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';

function WalletConfig() {
  const [config, setConfig] = useState({
    bscWalletAddress: '',
    bscPrivateKey: '',
    novaPrice: '',
    autoPayUsdt: 0,
    autoPayNova: 0,
    fromUsdt: '',
    toUsdt: '',
    fromNova: '',
    toNova: ''
  });

  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWalletConfig();
  }, []);

  const fetchWalletConfig = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(API_ENDPOINTS.ADMIN.WALLET_CONFIG);
      if (res.success && res.data) {
        setConfig({
          bscWalletAddress: res.data.bscWalletAddress || '',
          bscPrivateKey: res.data.bscPrivateKey || '',
          novaPrice: res.data.novaPrice?.toString() || '',
          autoPayUsdt: res.data.autoPayUsdt ?? 0,
          autoPayNova: res.data.autoPayNova ?? 0,
          fromUsdt: res.data.fromUsdt?.toString() || '0',
          toUsdt: res.data.toUsdt?.toString() || '0',
          fromNova: res.data.fromNova?.toString() || '0',
          toNova: res.data.toNova?.toString() || '0'
        });
      } else {
        setError(res.error || 'Không thể tải cấu hình ví');
      }
    } catch (err) {
      setError(err.message || 'Không thể tải cấu hình ví');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : e.target.value;
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddress = (addr) => !addr || (addr.startsWith('0x') && addr.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(addr));
  const validatePrivateKey = (key) => !key || /^[a-fA-F0-9]{64}$/.test(key.startsWith('0x') ? key.slice(2) : key);
  const validatePrice = (price) => !price || (parseFloat(price) > 0 && !isNaN(parseFloat(price)));
  const validateRange = (from, to) => {
    const f = parseFloat(from);
    const t = parseFloat(to);
    return isNaN(f) || isNaN(t) || f <= t;
  };

  const isValid = {
    bscWalletAddress: validateAddress(config.bscWalletAddress),
    bscPrivateKey: validatePrivateKey(config.bscPrivateKey),
    novaPrice: validatePrice(config.novaPrice),
    usdtRange: validateRange(config.fromUsdt, config.toUsdt),
    novaRange: validateRange(config.fromNova, config.toNova)
  };

  const hasError = Object.values(isValid).some((v) => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasError) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {};

      // Chỉ gửi field nếu có giá trị hoặc thay đổi
      if (config.bscWalletAddress.trim()) payload.bscWalletAddress = config.bscWalletAddress.trim();
      if (config.bscPrivateKey.trim()) payload.bscPrivateKey = config.bscPrivateKey.trim();
      if (config.novaPrice.trim()) payload.novaPrice = parseFloat(config.novaPrice);

      payload.autoPayUsdt = config.autoPayUsdt;
      payload.autoPayNova = config.autoPayNova;
      payload.fromUsdt = parseFloat(config.fromUsdt) || 0;
      payload.toUsdt = parseFloat(config.toUsdt) || 0;
      payload.fromNova = parseFloat(config.fromNova) || 0;
      payload.toNova = parseFloat(config.toNova) || 0;

      const res = await api.post(API_ENDPOINTS.ADMIN.WALLET_CONFIG, payload);

      if (res.success) {
        setSuccess('Cấu hình đã được cập nhật thành công!');
        setTimeout(() => setSuccess(''), 4000);

        // Cập nhật lại từ server để đồng bộ
        fetchWalletConfig();
      } else {
        setError(res.error || 'Không thể cập nhật cấu hình');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setSuccess(`Đã sao chép ${label}!`);
    setTimeout(() => setSuccess(''), 2000);
  };

  if (loading) {
    return <div className="text-center py-10 text-slate-400">Đang tải cấu hình...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl border border-emerald-500/40 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-emerald-400 mb-6">Cấu hình Ví Tổng & Auto Pay</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-lg text-emerald-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Phần BSC Wallet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BSC Wallet Address */}
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Địa chỉ ví tổng BSC
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={config.bscWalletAddress}
                  onChange={handleChange('bscWalletAddress')}
                  placeholder="0x..."
                  className={`flex-1 px-4 py-3 bg-slate-700 border rounded-l-lg text-white focus:outline-none focus:ring-2 ${
                    config.bscWalletAddress && !isValid.bscWalletAddress
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-emerald-600/50 focus:ring-emerald-500'
                  }`}
                />
                {config.bscWalletAddress && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(config.bscWalletAddress, 'địa chỉ ví')}
                    className="px-4 bg-emerald-700/50 hover:bg-emerald-600 border border-emerald-600 rounded-r-lg text-emerald-200"
                  >
                    📋
                  </button>
                )}
              </div>
              {config.bscWalletAddress && !isValid.bscWalletAddress && (
                <p className="mt-1 text-xs text-red-400">Địa chỉ không hợp lệ (0x + 40 hex)</p>
              )}
            </div>

            {/* BSC Private Key */}
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-2">
                Private Key ví tổng BSC
              </label>
              <div className="flex">
                <div className="relative flex-1">
                  <input
                    type={showPrivateKey ? 'text' : 'password'}
                    value={config.bscPrivateKey}
                    onChange={handleChange('bscPrivateKey')}
                    placeholder="64 ký tự hex..."
                    className={`w-full px-4 py-3 pr-12 bg-slate-700 border rounded-l-lg text-white font-mono focus:outline-none focus:ring-2 ${
                      config.bscPrivateKey && !isValid.bscPrivateKey
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-amber-600/50 focus:ring-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300"
                  >
                    {showPrivateKey ? '🙈' : '👁️'}
                  </button>
                </div>
                {config.bscPrivateKey && (
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        config.bscPrivateKey.startsWith('0x') ? config.bscPrivateKey : `0x${config.bscPrivateKey}`,
                        'private key'
                      )
                    }
                    className="px-4 bg-amber-700/50 hover:bg-amber-600 border border-amber-600 rounded-r-lg text-amber-200"
                  >
                    📋
                  </button>
                )}
              </div>
              {config.bscPrivateKey && !isValid.bscPrivateKey && (
                <p className="mt-1 text-xs text-red-400">Private key không hợp lệ (64 hex)</p>
              )}
              {config.bscPrivateKey && (
                <p className="mt-1 text-xs text-amber-400/80">⚠️ Tuyệt đối không chia sẻ!</p>
              )}
            </div>
          </div>

          {/* Giá NOVA */}
          <div>
            <label className="block text-sm font-medium text-emerald-300 mb-2">Giá NOVA (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={config.novaPrice}
                onChange={handleChange('novaPrice')}
                placeholder="0.1000"
                className={`w-full pl-10 px-4 py-3 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  config.novaPrice && !isValid.novaPrice
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-emerald-600/50 focus:ring-emerald-500'
                }`}
              />
            </div>
            {config.novaPrice && !isValid.novaPrice && (
              <p className="mt-1 text-xs text-red-400">Giá phải lớn hơn 0</p>
            )}
          </div>

          {/* Auto Pay Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-emerald-500/30">
            {/* Auto Pay USDT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium text-cyan-300">Auto Pay USDT</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoPayUsdt === 1}
                    onChange={handleChange('autoPayUsdt')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:bg-cyan-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Giới hạn (USDT)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.toUsdt}
                    onChange={handleChange('toUsdt')}
                    className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      !isValid.usdtRange ? 'border-red-500 focus:ring-red-500' : 'border-cyan-600/50 focus:ring-cyan-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Auto Pay NOVA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-medium text-purple-300">Auto Pay NOVA</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoPayNova === 1}
                    onChange={handleChange('autoPayNova')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Giới hạn (NOVA)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.0001"
                    value={config.toNova}
                    onChange={handleChange('toNova')}
                    className={`w-full px-4 py-2.5 bg-slate-700 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                      !isValid.novaRange ? 'border-red-500 focus:ring-red-500' : 'border-purple-600/50 focus:ring-purple-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nút Lưu */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving || hasError}
              className={`px-8 py-3 rounded-lg font-medium transition-all shadow-lg ${
                saving || hasError
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang lưu...
                </span>
              ) : (
                'Lưu toàn bộ cấu hình'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WalletConfig;