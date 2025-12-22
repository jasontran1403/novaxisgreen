import { useEffect, useState } from 'react';
import ChangePassword from '../components/ChangePassword';
import PlanInformation from '../components/PlanInformation';
import TwoFactorAuth from '../components/TwoFactorAuth';
import WalletBalance from '../components/WalletBalance';
import { API_ENDPOINTS } from '../config/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Profile() {
  const { user } = useAuth();
  const [balance, setBalance] = useState({ balanceUSDT: 0, balanceNOVA: 0 });
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [twoFAStatus, setTwoFAStatus] = useState({ enabled: false });
  const [twoFALoading, setTwoFALoading] = useState(true);
  
  // Plan Information
  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [salesNetwork, setSalesNetwork] = useState({});
  const [salesNetworkLoading, setSalesNetworkLoading] = useState(true);
  const [income24h, setIncome24h] = useState(0);
  const [income24hLoading, setIncome24hLoading] = useState(true);
  
  // Change Password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // 2FA
  const [twoFASecret, setTwoFASecret] = useState(null);
  const [twoFAQRCode, setTwoFAQRCode] = useState('');
  const [twoFAVerificationCode, setTwoFAVerificationCode] = useState('');
  const [twoFALoadingAction, setTwoFALoadingAction] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFASuccess, setTwoFASuccess] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableToken, setDisableToken] = useState('');

  // Fetch wallet balance
  const fetchBalance = async () => {
    try {
      setBalanceLoading(true);
      const response = await api.get(API_ENDPOINTS.WALLET.GET_BALANCE);
      if (response.success !== false) {
        setBalance(response.data || { balanceUSDT: 0, balanceNOVA: 0 });
      }
    } catch (error) {
      console.error('Fetch balance error:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch 2FA status
  const fetch2FAStatus = async () => {
    try {
      setTwoFALoading(true);
      const response = await api.get(API_ENDPOINTS.AUTH.GET_2FA_STATUS);
      if (response.success !== false) {
        setTwoFAStatus(response.data || { enabled: false });
      }
    } catch (error) {
      console.error('Fetch 2FA status error:', error);
    } finally {
      setTwoFALoading(false);
    }
  };

  // Fetch Plan Information
  const fetchPlan = async () => {
    try {
      setPlanLoading(true);
      const response = await api.get(API_ENDPOINTS.PLAN.INFO);
      if (response.success !== false) {
        setPlan(response.data || null);
      }
    } catch (error) {
      console.error('Fetch plan error:', error);
    } finally {
      setPlanLoading(false);
    }
  };

  // Fetch Sales Network
  const fetchSalesNetwork = async () => {
    try {
      setSalesNetworkLoading(true);
      const response = await api.get(API_ENDPOINTS.NETWORK.SALES_SUMMARY);
      if (response.success !== false) {
        const payload = response.data || response || {};
        setSalesNetwork({
          selfSales: Number(payload.selfSales ?? payload.personalSales ?? 0),
          directSales: Number(payload.directSales ?? payload.teamSales ?? 0),
          currency: payload.currency || 'USDT'
        });
      }
    } catch (error) {
      console.error('Fetch sales network error:', error);
    } finally {
      setSalesNetworkLoading(false);
    }
  };

  // Fetch 24h Income
  const fetchIncome24h = async () => {
    try {
      setIncome24hLoading(true);
      const response = await api.get(API_ENDPOINTS.INCOME.GET_24H);
      if (response.success !== false) {
        setIncome24h(Number(response.data?.totalIncome ?? response.data?.amount ?? 0));
      }
    } catch (error) {
      console.error('Fetch income 24h error:', error);
    } finally {
      setIncome24hLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetch2FAStatus();
    fetchPlan();
    fetchSalesNetwork();
    fetchIncome24h();
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
      setPasswordError('New password and confirm password do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.success) {
        setPasswordSuccess('Password changed successfully');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(response.error || response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setPasswordError(error.response?.data?.error || error.response?.data?.message || 'Error changing password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle enable 2FA
  const handleEnable2FA = async () => {
    try {
      setTwoFALoadingAction(true);
      setTwoFAError('');
      setTwoFASuccess('');
      const response = await api.post(API_ENDPOINTS.AUTH.ENABLE_2FA);

      if (response.success) {
        setTwoFASecret(response.data.secret);
        setTwoFAQRCode(response.data.qrCode);
        setTwoFASuccess('Scan QR code with authenticator app (Google Authenticator, Authy, etc.)');
      } else {
        setTwoFAError(response.error || response.message || 'Error enabling 2FA');
      }
    } catch (error) {
      console.error('Enable 2FA error:', error);
      setTwoFAError(error.response?.data?.error || error.response?.data?.message || 'Error enabling 2FA');
    } finally {
      setTwoFALoadingAction(false);
    }
  };

  // Handle verify 2FA
  const handleVerify2FA = async () => {
    if (!twoFASecret || !twoFAVerificationCode) {
      setTwoFAError('Please enter verification code');
      return;
    }

    try {
      setTwoFALoadingAction(true);
      setTwoFAError('');
      setTwoFASuccess('');
      const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_2FA, {
        secret: twoFASecret,
        token: twoFAVerificationCode
      });

      if (response.success) {
        setTwoFASuccess('2FA has been activated successfully');
        setTwoFASecret(null);
        setTwoFAQRCode('');
        setTwoFAVerificationCode('');
        await fetch2FAStatus();
      } else {
        setTwoFAError(response.error || response.message || 'Verification code is incorrect');
      }
    } catch (error) {
      console.error('Verify 2FA error:', error);
      setTwoFAError(error.response?.data?.error || error.response?.data?.message || 'Error verifying 2FA');
    } finally {
      setTwoFALoadingAction(false);
    }
  };

  // Handle disable 2FA
  const handleDisable2FA = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      setTwoFAError('Please enter password');
      return;
    }

    try {
      setTwoFALoadingAction(true);
      setTwoFAError('');
      setTwoFASuccess('');
      const response = await api.post(API_ENDPOINTS.AUTH.DISABLE_2FA, {
        password: disablePassword,
        token: disableToken || undefined
      });

      if (response.success) {
        setTwoFASuccess('2FA has been disabled successfully');
        setDisablePassword('');
        setDisableToken('');
        await fetch2FAStatus();
      } else {
        setTwoFAError(response.error || response.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Disable 2FA error:', error);
      setTwoFAError(error.response?.data?.error || error.response?.data?.message || 'Error disabling 2FA');
    } finally {
      setTwoFALoadingAction(false);
    }
  };

  // Handle cancel 2FA setup
  const handleCancel2FA = () => {
    setTwoFASecret(null);
    setTwoFAQRCode('');
    setTwoFAVerificationCode('');
    setTwoFAError('');
    setTwoFASuccess('');
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
        twoFAStatus={twoFAStatus}
        twoFALoading={twoFALoading}
        twoFASecret={twoFASecret}
        twoFAQRCode={twoFAQRCode}
        twoFAVerificationCode={twoFAVerificationCode}
        setTwoFAVerificationCode={setTwoFAVerificationCode}
        twoFALoadingAction={twoFALoadingAction}
        twoFAError={twoFAError}
        twoFASuccess={twoFASuccess}
        disablePassword={disablePassword}
        setDisablePassword={setDisablePassword}
        disableToken={disableToken}
        setDisableToken={setDisableToken}
        handleEnable2FA={handleEnable2FA}
        handleVerify2FA={handleVerify2FA}
        handleDisable2FA={handleDisable2FA}
        onCancel={handleCancel2FA}
      />
    </div>
  );
}

export default Profile;

