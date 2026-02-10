import { useEffect, useState } from 'react';
import ChangePassword from '../components/ChangePassword';
import TwoFactorAuth from '../components/TwoFactorAuth';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Profile() {
  const { user } = useAuth();

  // Change Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [twoFA, setTwoFA] = useState({
    status: false,
    qrCode: '',
    secret: '',
  });
  const [loading2FA, setLoading2FA] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState('');

  const fetch2FAInfo = async () => {
    try {
      setLoading2FA(true);
      setTwoFAError('');
      const res = await api.get(API_ENDPOINTS.USER.GET_2FA_INFO);
      if (res.data) {
        setTwoFA({
          status: res.data.enabled || false,
          qrCode: res.data.qrCode || '',
          secret: res.data.secret || '',
        });
      }
    } catch (err) {
      console.error(err);
      setTwoFAError('Không thể tải thông tin 2FA');
    } finally {
      setLoading2FA(false);
    }
  };

  useEffect(() => {
    fetch2FAInfo();
  }, []);

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await api.post(API_ENDPOINTS.USER.USER_CHANGE_PASSWORD, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        setPasswordSuccess('Changed password successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        // Lấy lỗi từ backend (response.error hoặc response.message)
        setPasswordError(response.error || response.message || 'Change password failed');
      }
    } catch (error) {
      console.error('Change password error:', error);

      // Xử lý lỗi từ backend một cách chi tiết
      let errMsg = 'There was an error changing the password';
      if (error.response) {
        const backendError = error.response.data?.error || error.response.data?.message;
        if (backendError) {
          // Dịch lỗi phổ biến sang tiếng Việt
          if (backendError.toLowerCase().includes('current password is incorrect') ||
            backendError.toLowerCase().includes('mật khẩu cũ không đúng')) {
            errMsg = 'Old password is incorrect';
          } else if (backendError.toLowerCase().includes('at least 6 characters')) {
            errMsg = 'New password must be at least 6 characters';
          } else {
            errMsg = backendError;
          }
        } else {
          errMsg = error.response.statusText || errMsg;
        }
      } else if (error.message) {
        errMsg = error.message;
      }

      setPasswordError(errMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle enable 2FA
  const handleEnable2FA = async ({ code }) => {
    setActionLoading(true);
    setTwoFAError('');
    setTwoFASuccess('');

    try {
      const res = await api.post(API_ENDPOINTS.USER.ENABLE_2FA, { code });

      if (res.success) {
        setTwoFASuccess('2FA enabled successfully!');
        setTwoFA(prev => ({
          ...prev,
          status: true,
          qrCode: '',
          secret: ''
        }));
      } else {
        setTwoFAError(res.error || 'Failed to enable 2FA');
      }
    } catch (err) {
      if (err.message === "Invalid verification code") {
        setTwoFAError('2FA code is incorrect');
      }
      else {
        setTwoFAError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Error enabling 2FA'
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable2FA = async ({ code }) => {
    setActionLoading(true);
    setTwoFAError('');
    setTwoFASuccess('');

    try {
      const res = await api.post(API_ENDPOINTS.USER.DISABLE_2FA, { code });

      if (res.success) {
        setTwoFASuccess('2FA disabled successfully');
        setTwoFA(prev => ({ ...prev, status: false }));

        // Optional: refresh latest status from server
        await fetch2FAInfo();
      } else {
        setTwoFAError(res.error || 'Invalid code or system error');
      }
    } catch (err) {
      if (err.message === "Invalid 2FA code") {
        setTwoFAError('2FA code is incorrect');
      } else {
        setTwoFAError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Error disabling 2FA'
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6">
      <h1 className="text-3xl font-bold text-emerald-400 dark:text-emerald-300">
        Profile Settings
      </h1>

      <ChangePassword
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        passwordLoading={passwordLoading}
        passwordError={passwordError}
        passwordSuccess={passwordSuccess}
        handleChangePassword={handleChangePassword}
      />

      <TwoFactorAuth
        status={twoFA.status}
        qrCode={twoFA.qrCode}
        secret={twoFA.secret}
        onEnable={handleEnable2FA}
        onDisable={handleDisable2FA}
        loading={actionLoading}
        error={twoFAError}
        success={twoFASuccess}
      />
    </div>
  );
}

export default Profile;

