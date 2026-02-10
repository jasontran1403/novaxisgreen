import { useState } from 'react';
import { ShieldCheckIcon, CheckCircleIcon, XCircleIcon, Copy } from "lucide-react";

function TwoFactorAuth({
  status,           // boolean: true = enabled, false = disabled
  qrCode,           // string: data:image/... base64 from server (or empty)
  secret,           // string: secret key (or empty)
  onEnable,         // function: called when clicking Enable, receives {code}
  onDisable,        // function: called when clicking Disable, receives {code}
  loading,          // boolean: API request in progress
  error,            // string: error message
  success,          // string: success message
  // onClearMessages // optional: function to clear error/success
}) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCodeValid = code.length === 6;

  const handleEnableClick = () => {
    if (isCodeValid) {
      onEnable({ code });
      setCode(''); // reset after submit
    }
  };

  const handleDisableClick = () => {
    if (isCodeValid) {
      onDisable({ code });
      setCode(''); // reset after submit
    }
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-emerald-500/30 shadow-lg">
      <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
        <ShieldCheckIcon className="w-6 h-6" />
        Two-Factor Authentication (2FA)
      </h2>

      <div className="space-y-6">
        {/* Status indicator */}
        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-emerald-500/20">
          <div className="flex items-center gap-3">
            {status ? (
              <>
                <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Enabled</span>
              </>
            ) : (
              <>
                <XCircleIcon className="w-6 h-6 text-red-400" />
                <span className="text-red-300 font-medium">Disabled</span>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm text-center">
            {success}
          </div>
        )}

        {/* Enable 2FA section – shown when NOT enabled */}
        {!status && (
          <div className="p-5 bg-slate-700/60 rounded-lg border border-emerald-500/40 space-y-6">
            <p className="text-emerald-300 text-center font-medium">
              Scan with Google Authenticator
            </p>

            {qrCode && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl shadow-xl border border-emerald-200">
                  <img
                    src={qrCode}
                    alt="2FA QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            )}

            {secret && (
              <div className="text-center text-sm text-emerald-400/90">
                Can't scan? Enter manually:{' '}
                <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                  <code className="bg-slate-800 px-3 py-1.5 rounded font-mono tracking-wider">
                    {secret}
                  </code>
                  <button
                    onClick={handleCopySecret}
                    className="p-2 text-emerald-400 hover:text-emerald-300 transition"
                    title="Copy secret key"
                  >
                    <Copy size={18} />
                  </button>
                  {copied && <span className="text-xs text-emerald-400">Copied!</span>}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">
                  Enter 6-digit code from your authenticator app
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-800 border border-emerald-500/50 rounded-lg 
                           text-center text-2xl tracking-widest text-emerald-100 
                           placeholder-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                />
              </div>

              <button
                onClick={handleEnableClick}
                disabled={loading || !isCodeValid}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg 
                         font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? 'Verifying...' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        )}

        {/* Disable 2FA section – shown when ENABLED */}
        {status && (
          <div className="p-5 bg-slate-700/60 rounded-lg border border-red-500/30 space-y-4">
            <p className="text-red-300 text-sm font-medium text-center">
              Enter 6-digit code from your authenticator app to disable 2FA
            </p>

            <div>
              <label className="block text-sm font-medium text-red-300 mb-2">
                2FA Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                placeholder="000000"
                className="w-full px-4 py-3 bg-slate-800 border border-red-500/50 rounded-lg 
                         text-center text-2xl tracking-widest text-red-100 
                         placeholder-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
              />
            </div>

            <button
              onClick={handleDisableClick}
              disabled={loading || !isCodeValid}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg 
                       font-medium transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TwoFactorAuth;