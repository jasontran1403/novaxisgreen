import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/apiConfig';
import api from '../../services/api';

function WalletConfig() {
  const [usdtAddress, setUsdtAddress] = useState('');
  const [novaAddress, setNovaAddress] = useState('');
  const [usdtContractAddress, setUsdtContractAddress] = useState('');
  const [novaContractAddress, setNovaContractAddress] = useState('');
  const [usdtPrivateKey, setUsdtPrivateKey] = useState('');
  const [novaPrivateKey, setNovaPrivateKey] = useState('');
  const [hasUsdtPrivateKey, setHasUsdtPrivateKey] = useState(false);
  const [hasNovaPrivateKey, setHasNovaPrivateKey] = useState(false);
  const [showUsdtPrivateKey, setShowUsdtPrivateKey] = useState(false);
  const [showNovaPrivateKey, setShowNovaPrivateKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resettingNova, setResettingNova] = useState(false);

  useEffect(() => {
    fetchWalletConfig();
  }, []);

  const fetchWalletConfig = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(API_ENDPOINTS.ADMIN.WALLET_CONFIG);
      if (res.success) {
        setUsdtAddress(res.data?.usdtAddress || '');
        setNovaAddress(res.data?.novaAddress || '');
        setUsdtContractAddress(res.data?.usdtContractAddress || '');
        setNovaContractAddress(res.data?.novaContractAddress || '');
        setHasUsdtPrivateKey(res.data?.hasUsdtPrivateKey || false);
        setHasNovaPrivateKey(res.data?.hasNovaPrivateKey || false);
        // Không load private key thực tế vì lý do bảo mật
        setUsdtPrivateKey('');
        setNovaPrivateKey('');
      } else {
        setError(res.error || 'Không thể tải cấu hình địa chỉ ví');
      }
    } catch (err) {
      setError(err.message || 'Không thể tải cấu hình địa chỉ ví');
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
      const payload = {
        usdtAddress: usdtAddress.trim() || undefined,
        novaAddress: novaAddress.trim() || undefined,
        usdtContractAddress: usdtContractAddress.trim() || undefined,
        novaContractAddress: novaContractAddress.trim() || undefined
      };
      
      // Chỉ gửi private key nếu có nhập mới
      if (usdtPrivateKey.trim()) {
        payload.usdtPrivateKey = usdtPrivateKey.trim();
      }
      if (novaPrivateKey.trim()) {
        payload.novaPrivateKey = novaPrivateKey.trim();
      }
      
      const res = await api.post(API_ENDPOINTS.ADMIN.WALLET_CONFIG, payload);

      if (res.success) {
        setSuccess(res.message || 'Cấu hình địa chỉ ví đã được cập nhật thành công');
        // Update local state with returned values
        if (res.data) {
          setUsdtAddress(res.data.usdtAddress || '');
          setNovaAddress(res.data.novaAddress || '');
          setUsdtContractAddress(res.data.usdtContractAddress || '');
          setNovaContractAddress(res.data.novaContractAddress || '');
          setHasUsdtPrivateKey(res.data.hasUsdtPrivateKey || false);
          setHasNovaPrivateKey(res.data.hasNovaPrivateKey || false);
        }
        // Clear private key fields sau khi lưu thành công
        setUsdtPrivateKey('');
        setNovaPrivateKey('');
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
    if (!address || address.trim() === '') return true; // Empty is allowed
    const trimmed = address.trim();
    return trimmed.startsWith('0x') && trimmed.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(trimmed);
  };

  const validatePrivateKey = (privateKey) => {
    if (!privateKey || privateKey.trim() === '') return true; // Empty is allowed
    const trimmed = privateKey.trim();
    const hexOnly = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed;
    return /^[a-fA-F0-9]{64}$/.test(hexOnly);
  };

  const isUsdtValid = validateAddress(usdtAddress);
  const isNovaValid = validateAddress(novaAddress);
  const isUsdtContractValid = validateAddress(usdtContractAddress);
  const isNovaContractValid = validateAddress(novaContractAddress);
  const isUsdtPrivateKeyValid = validatePrivateKey(usdtPrivateKey);
  const isNovaPrivateKeyValid = validatePrivateKey(novaPrivateKey);

  const handleResetNovaForUser = async () => {
    const username = prompt('Nhập username của user cần reset NOVA:');
    if (!username) return;

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn reset toàn bộ số dư NOVA về 0 cho user "${username}"?\nThao tác này không thể hoàn tác.`
      )
    ) {
      return;
    }

    try {
      setResettingNova(true);
      setError('');
      setSuccess('');

      const res = await api.post(API_ENDPOINTS.ADMIN.RESET_NOVA_FOR_USER, { username });

      if (res.success) {
        setSuccess(
          res.message ||
            `Đã reset NOVA cho user ${username}. Balance NOVA mới: ${res.data?.balanceNOVA ?? 0}`
        );
      } else {
        setError(res.error || res.message || 'Không thể reset NOVA cho user này');
      }
    } catch (err) {
      setError(err.message || 'Không thể reset NOVA cho user này');
    } finally {
      setResettingNova(false);
    }
  };

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
        <h2 className="text-lg sm:text-xl font-semibold text-emerald-400 mb-4 sm:mb-6">Cấu hình địa chỉ ví tổng</h2>

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
          {/* USDT Address */}
          <div>
            <label className="block text-sm font-medium text-emerald-400 mb-2">
              Địa chỉ ví tổng BSC
            </label>
            <input
              type="text"
              value={usdtAddress}
              onChange={(e) => setUsdtAddress(e.target.value)}
              placeholder="0x..."
              className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none ${
                usdtAddress && !isUsdtValid
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-emerald-500/30 focus:border-emerald-500'
              }`}
            />
            {usdtAddress && !isUsdtValid && (
              <p className="mt-1 text-xs text-red-400">
                Địa chỉ ví không hợp lệ (phải bắt đầu bằng 0x và có 42 ký tự)
              </p>
            )}
            {usdtAddress && isUsdtValid && (
              <p className="mt-1 text-xs text-green-400">✓ Địa chỉ ví hợp lệ</p>
            )}
          </div>

          {/* USDT Private Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-emerald-400">
                Private Key ví tổng
              </label>
              {hasUsdtPrivateKey && (
                <span className="text-xs text-green-400">✓ Đã cấu hình</span>
              )}
            </div>
            <div className="relative">
              <input
                type={showUsdtPrivateKey ? 'text' : 'password'}
                value={usdtPrivateKey}
                onChange={(e) => setUsdtPrivateKey(e.target.value)}
                placeholder={hasUsdtPrivateKey ? 'Nhập private key mới để cập nhật (hoặc để trống)' : 'Nhập private key (64 ký tự)'}
                className={`w-full px-3 sm:px-4 py-2 pr-10 text-sm sm:text-base bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none font-mono ${
                  usdtPrivateKey && !isUsdtPrivateKeyValid
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-emerald-500/30 focus:border-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowUsdtPrivateKey(!showUsdtPrivateKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-emerald-400 text-sm"
              >
                {showUsdtPrivateKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {usdtPrivateKey && !isUsdtPrivateKeyValid && (
              <p className="mt-1 text-xs text-red-400">
                Private key không hợp lệ (phải là 64 ký tự, có thể có prefix 0x)
              </p>
            )}
            {usdtPrivateKey && isUsdtPrivateKeyValid && (
              <p className="mt-1 text-xs text-green-400">✓ Private key hợp lệ</p>
            )}
            {!usdtPrivateKey && hasUsdtPrivateKey && (
              <p className="mt-1 text-xs text-slate-400">
                Để trống nếu không muốn thay đổi private key hiện tại
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                saving ||
                (usdtAddress && !isUsdtValid) ||
                (novaAddress && !isNovaValid) ||
                (usdtContractAddress && !isUsdtContractValid) ||
                (novaContractAddress && !isNovaContractValid) ||
                (usdtPrivateKey && !isUsdtPrivateKeyValid) ||
                (novaPrivateKey && !isNovaPrivateKeyValid)
              }
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                saving ||
                (usdtAddress && !isUsdtValid) ||
                (novaAddress && !isNovaValid) ||
                (usdtContractAddress && !isUsdtContractValid) ||
                (novaContractAddress && !isNovaContractValid) ||
                (usdtPrivateKey && !isUsdtPrivateKeyValid) ||
                (novaPrivateKey && !isNovaPrivateKeyValid)
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WalletConfig;

