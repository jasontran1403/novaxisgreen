function TwoFactorAuth({
  twoFAStatus,
  twoFALoading,
  twoFASecret,
  twoFAQRCode,
  twoFAVerificationCode,
  setTwoFAVerificationCode,
  twoFALoadingAction,
  twoFAError,
  twoFASuccess,
  disablePassword,
  setDisablePassword,
  disableToken,
  setDisableToken,
  handleEnable2FA,
  handleVerify2FA,
  handleDisable2FA,
  onCancel
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-emerald-300 dark:text-emerald-400 mb-4">
        Two-Factor Authentication (2FA)
      </h2>
      {twoFALoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-600/30 dark:bg-gray-700/30 rounded-lg border border-emerald-500/30">
            <div>
              <p className="text-sm font-medium text-emerald-300/80 dark:text-emerald-400/80">
                Status: {twoFAStatus.enabled ? (
                  <span className="text-emerald-400 dark:text-emerald-300 font-semibold">Enabled</span>
                ) : (
                  <span className="text-red-400 dark:text-red-300 font-semibold">Disabled</span>
                )}
              </p>
            </div>
            {!twoFAStatus.enabled && !twoFASecret && (
              <button
                onClick={handleEnable2FA}
                disabled={twoFALoadingAction}
                className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {twoFALoadingAction ? 'Loading...' : 'Enable 2FA'}
              </button>
            )}
          </div>

          {/* Enable 2FA - Show QR Code */}
          {twoFASecret && twoFAQRCode && (
            <div className="p-4 bg-slate-600/30 dark:bg-gray-700/30 rounded-lg border border-emerald-500/30">
              <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-4">
                Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex flex-col items-center mb-4">
                <img src={twoFAQRCode} alt="2FA QR Code" className="w-48 h-48 bg-white p-2 rounded-lg" />
                <p className="text-xs text-emerald-300/60 dark:text-emerald-400/60 mt-2">
                  Manual Entry Key: <code className="bg-slate-700/50 px-2 py-1 rounded">{twoFASecret}</code>
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-300/80 dark:text-emerald-400/80 mb-2">
                    Enter 6-digit code from your authenticator app
                  </label>
                  <input
                    type="text"
                    value={twoFAVerificationCode}
                    onChange={(e) => setTwoFAVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-2 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-100 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-300 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                {twoFAError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {twoFAError}
                  </div>
                )}
                {twoFASuccess && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm">
                    {twoFASuccess}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleVerify2FA}
                    disabled={twoFALoadingAction || !twoFAVerificationCode || twoFAVerificationCode.length !== 6}
                    className="flex-1 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {twoFALoadingAction ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 text-slate-300 hover:bg-slate-600/70 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disable 2FA */}
          {twoFAStatus.enabled && !twoFASecret && (
            <form onSubmit={handleDisable2FA} className="p-4 bg-slate-600/30 dark:bg-gray-700/30 rounded-lg border border-emerald-500/30">
              <p className="text-sm text-emerald-300/80 dark:text-emerald-400/80 mb-4">
                To disable 2FA, please enter your password and a 2FA code from your authenticator app.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-300/80 dark:text-emerald-400/80 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-100 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-emerald-300/80 dark:text-emerald-400/80 mb-2">
                    2FA Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={disableToken}
                    onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-2 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-100 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-300 text-center text-xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                {twoFAError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                    {twoFAError}
                  </div>
                )}
                {twoFASuccess && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm">
                    {twoFASuccess}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={twoFALoadingAction || !disablePassword}
                  className="px-4 py-2 bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {twoFALoadingAction ? 'Disabling...' : 'Disable 2FA'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default TwoFactorAuth;

