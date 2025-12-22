function ChangePassword({ 
  passwordForm, 
  setPasswordForm, 
  passwordLoading, 
  passwordError, 
  passwordSuccess, 
  handleChangePassword 
}) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-emerald-300 dark:text-emerald-400 mb-4">
        Change Password
      </h2>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-emerald-300/80 dark:text-emerald-400/80 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full px-4 py-2 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-100 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-emerald-300/80 dark:text-emerald-400/80 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="w-full px-4 py-2 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-100 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-300"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-emerald-300/80 dark:text-emerald-400/80 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 bg-slate-600/50 dark:bg-gray-700/50 border border-emerald-500/50 dark:border-emerald-400/50 rounded-lg text-emerald-100 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-300"
            required
            minLength={6}
          />
        </div>
        {passwordError && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-300 text-sm">
            {passwordSuccess}
          </div>
        )}
        <button
          type="submit"
          disabled={passwordLoading}
          className="px-6 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {passwordLoading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;

