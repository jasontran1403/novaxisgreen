import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';

function WalletConfig() {
  const [bscWalletAddress, setBscWalletAddress] = useState('');
  const [bscPrivateKey, setBscPrivateKey] = useState('');
  const [novaPrice, setNovaPrice] = useState('');
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
      if (res.success) {
        setBscWalletAddress(res.data?.bscWalletAddress || '');
        setBscPrivateKey(res.data?.bscPrivateKey || '');
        setNovaPrice(res.data?.novaPrice?.toString() || '');
      } else {
        setError(res.error || 'Không thể tải cấu hình ví');
      }
    } catch (err) {
      setError(err.message || 'Không thể tải cấu hình ví');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {};
      
      // Gửi tất cả các field hiện tại
      if (bscWalletAddress.trim()) {
        payload.bscWalletAddress = bscWalletAddress.trim();
      }
      
      if (bscPrivateKey.trim()) {
        payload.bscPrivateKey = bscPrivateKey.trim();
      }
      
      if (novaPrice.trim()) {
        const price = parseFloat(novaPrice);
        if (!isNaN(price) && price > 0) {
          payload.novaPrice = price;
        }
      }
      
      const res = await api.post(API_ENDPOINTS.ADMIN.WALLET_CONFIG, payload);

      if (res.success) {
        setSuccess(res.message || 'Cấu hình đã được cập nhật thành công!');
        
        // Cập nhật với data mới từ server
        if (res.data) {
          setBscWalletAddress(res.data.bscWalletAddress || '');
          setBscPrivateKey(res.data.bscPrivateKey || '');
          setNovaPrice(res.data.novaPrice?.toString() || '');
        }
        
        // Auto-hide success message sau 3 giây
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.error || 'Không thể cập nhật cấu hình');
      }
    } catch (err) {
      setError(err.message || 'Không thể cập nhật cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const validateAddress = (address) => {
    if (!address || address.trim() === '') return true;
    const trimmed = address.trim();
    return trimmed.startsWith('0x') && trimmed.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  };

  const validatePrivateKey = (privateKey) => {
    if (!privateKey || privateKey.trim() === '') return true;
    const trimmed = privateKey.trim();
    const hexOnly = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
    return /^[a-fA-F0-9]{64}$/.test(hexOnly);
  };

  const validateNovaPrice = (price) => {
    if (!price || price.trim() === '') return true;
    const num = parseFloat(price);
    return !isNaN(num) && num > 0;
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess(`Đã copy ${label} vào clipboard!`);
      setTimeout(() => setSuccess(''), 2000);
    }).catch(() => {
      setError(`Không thể copy ${label}`);
    });
  };

  const isBscAddressValid = validateAddress(bscWalletAddress);
  const isBscPrivateKeyValid = validatePrivateKey(bscPrivateKey);
  const isNovaPriceValid = validateNovaPrice(novaPrice);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-6">
          <div className="text-center text-slate-400">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-emerald-500/50 p-3 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-400 mb-4 sm:mb-6">
          Cấu hình ví tổng & Giá NOVA
        </h2>

        {error && (
          <div className="mb-3 sm:mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-3 sm:mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-xs sm:text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* BSC Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-emerald-400 mb-2">
              Địa chỉ ví tổng BSC
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={bscWalletAddress}
                onChange={(e) => setBscWalletAddress(e.target.value)}
                placeholder="0x..."
                className={`flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none ${
                  bscWalletAddress && !isBscAddressValid
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-emerald-500/30 focus:border-emerald-500'
                }`}
              />
              {bscWalletAddress && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(bscWalletAddress, 'địa chỉ ví')}
                  className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-lg text-emerald-400 transition-colors text-sm shrink-0"
                  title="Copy địa chỉ"
                >
                  📋
                </button>
              )}
            </div>
            {bscWalletAddress && !isBscAddressValid && (
              <p className="mt-1 text-xs text-red-400">
                Địa chỉ ví không hợp lệ (phải bắt đầu bằng 0x và có 42 ký tự)
              </p>
            )}
            {bscWalletAddress && isBscAddressValid && (
              <p className="mt-1 text-xs text-green-400">✓ Địa chỉ ví hợp lệ</p>
            )}
          </div>

          {/* BSC Private Key */}
          <div>
            <label className="block text-sm font-medium text-amber-400 mb-2">
              Private Key ví tổng BSC
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type={showPrivateKey ? 'text' : 'password'}
                  value={bscPrivateKey}
                  onChange={(e) => setBscPrivateKey(e.target.value)}
                  placeholder="Nhập private key (64 ký tự hex)"
                  className={`w-full px-3 sm:px-4 py-2 pr-10 text-sm sm:text-base bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none font-mono ${
                    bscPrivateKey && !isBscPrivateKeyValid
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-amber-500/30 focus:border-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-amber-400 text-sm"
                  title={showPrivateKey ? 'Ẩn' : 'Hiện'}
                >
                  {showPrivateKey ? '🙈' : '👁️'}
                </button>
              </div>
              {bscPrivateKey && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(
                    bscPrivateKey.startsWith('0x') ? bscPrivateKey : `0x${bscPrivateKey}`,
                    'private key'
                  )}
                  className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-amber-400 transition-colors text-sm shrink-0"
                  title="Copy private key"
                >
                  📋
                </button>
              )}
            </div>
            {bscPrivateKey && !isBscPrivateKeyValid && (
              <p className="mt-1 text-xs text-red-400">
                Private key không hợp lệ (phải là 64 ký tự hex, có thể có prefix 0x)
              </p>
            )}
            {bscPrivateKey && isBscPrivateKeyValid && (
              <p className="mt-1 text-xs text-green-400">✓ Private key hợp lệ</p>
            )}
            {bscPrivateKey && (
              <p className="mt-1 text-xs text-amber-400/70">
                ⚠️ Không chia sẻ private key với bất kỳ ai!
              </p>
            )}
          </div>

          {/* NOVA Price */}
          <div>
            <label className="block text-sm font-medium text-emerald-400 mb-2">
              Giá NOVA (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={novaPrice}
                onChange={(e) => setNovaPrice(e.target.value)}
                placeholder="0.1000"
                className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none ${
                  novaPrice && !isNovaPriceValid
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-emerald-500/30 focus:border-emerald-500'
                }`}
              />
            </div>
            {novaPrice && !isNovaPriceValid && (
              <p className="mt-1 text-xs text-red-400">Giá NOVA phải lớn hơn 0</p>
            )}
            {novaPrice && isNovaPriceValid && (
              <p className="mt-1 text-xs text-green-400">
                ✓ Giá hợp lệ: ${parseFloat(novaPrice).toFixed(4)}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={
                saving ||
                (bscWalletAddress && !isBscAddressValid) ||
                (bscPrivateKey && !isBscPrivateKeyValid) ||
                (novaPrice && !isNovaPriceValid)
              }
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                saving ||
                (bscWalletAddress && !isBscAddressValid) ||
                (bscPrivateKey && !isBscPrivateKeyValid) ||
                (novaPrice && !isNovaPriceValid)
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              }`}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Đang lưu...
                </span>
              ) : (
                'Lưu cấu hình'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WalletConfig;