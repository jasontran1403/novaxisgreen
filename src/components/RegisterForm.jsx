import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';

function RegisterForm() {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Lấy ref từ URL
  const refCodeFromUrl = searchParams.get('ref') || '';
  const hasRefFromUrl = !!refCodeFromUrl;

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    refCode: hasRefFromUrl ? refCodeFromUrl : '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    refCode: '',
    general: '',
  });

  const [loading, setLoading] = useState(false);

  const [refCodeValidation, setRefCodeValidation] = useState({
    isValidating: false,
    isValid: null,
    message: '',
    sponsor: '',
  });

  // Tự động validate refCode từ URL khi component mount
  useEffect(() => {
    if (!hasRefFromUrl) return;

    const validateUrlRefCode = async () => {
      const refCode = refCodeFromUrl.trim();

      if (!refCode || refCode.length < 3) {
        setRefCodeValidation({
          isValidating: false,
          isValid: false,
          message: 'Invalid referral code in link',
          sponsor: '',
        });
        setErrors(prev => ({ ...prev, refCode: 'Invalid referral code' }));
        return;
      }

      setRefCodeValidation(prev => ({ ...prev, isValidating: true }));

      try {
        const response = await api.get(`${API_ENDPOINTS.REFLINK.VALIDATE}`, {
          params: { refCode },  // Axios tự động encode
          includeAuth: false
        });

        if (response.success && response.data) {
          const isValid = response.data.valid && response.data.available;

          setRefCodeValidation({
            isValidating: false,
            isValid: isValid,
            message: response.data.message || '',
            sponsor: response.data.sponsor || '',
          });

          if (!isValid) {
            setErrors(prev => ({
              ...prev,
              refCode: response.data.message || 'This referral position is no longer available',
            }));
          } else {
            setErrors(prev => ({ ...prev, refCode: '' }));
          }
        } else {
          setRefCodeValidation({
            isValidating: false,
            isValid: false,
            message: 'Invalid referral link',
            sponsor: '',
          });
          setErrors(prev => ({ ...prev, refCode: 'Invalid or unavailable referral code' }));
        }
      } catch (error) {
        setRefCodeValidation({
          isValidating: false,
          isValid: false,
          message: 'Failed to validate referral link',
          sponsor: '',
        });
        setErrors(prev => ({ ...prev, refCode: 'Error validating referral code' }));
      }
    };

    validateUrlRefCode();
  }, [hasRefFromUrl, refCodeFromUrl]);

  // Realtime validation chỉ khi KHÔNG có ref từ URL
  useEffect(() => {
    if (hasRefFromUrl) return;

    const validateRefCode = async () => {
      const refCode = formData.refCode.trim();

      if (!refCode || refCode.length < 3) {
        setRefCodeValidation({
          isValidating: false,
          isValid: null,
          message: '',
          sponsor: '',
        });
        return;
      }

      setRefCodeValidation(prev => ({ ...prev, isValidating: true }));

      try {
        const response = await api.get(`${API_ENDPOINTS.REFLINK.VALIDATE}/${refCode}`, { includeAuth: false });

        if (response.success && response.data) {
          const isValid = response.data.valid && response.data.available;

          setRefCodeValidation({
            isValidating: false,
            isValid: isValid,
            message: response.data.message || '',
            sponsor: response.data.sponsor || '',
          });

          if (isValid) {
            setErrors(prev => ({ ...prev, refCode: '' }));
          }
        } else {
          setRefCodeValidation({
            isValidating: false,
            isValid: false,
            message: 'Invalid referral code',
            sponsor: '',
          });
        }
      } catch (error) {
        setRefCodeValidation({
          isValidating: false,
          isValid: false,
          message: 'Error validating referral code',
          sponsor: '',
        });
      }
    };

    const timer = setTimeout(validateRefCode, 500);
    return () => clearTimeout(timer);
  }, [formData.refCode, hasRefFromUrl]);

  // Validation functions
  const validateUsername = (username) => (!username.trim() ? 'Username is required' :
    username.length < 3 || username.length > 50 ? 'Username must be between 3 and 50 characters' :
      !/^[a-zA-Z0-9_]+$/.test(username) ? 'Username can only contain letters, numbers, and underscores' : '');

  const validateEmail = (email) => (!email.trim() ? 'Email is required' :
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Invalid email format' : '');

  const validatePassword = (password) => (!password ? 'Password is required' :
    password.length < 6 ? 'Password must be at least 6 characters' : '');

  const validateConfirmPassword = (confirm, password) => (!confirm ? 'Please confirm password' :
    confirm !== password ? 'Passwords do not match' : '');

  const validateFullName = (fullName) => (!fullName.trim() ? 'Full name is required' : '');

  const validateRefCode = (refCode) => (!refCode.trim() ? 'Referral code is required' : '');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Chặn thay đổi refCode nếu có từ URL
    if (hasRefFromUrl && name === 'refCode') return;

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '', general: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'username': error = validateUsername(value); break;
      case 'email': error = validateEmail(value); break;
      case 'password': error = validatePassword(value); break;
      case 'confirmPassword': error = validateConfirmPassword(value, formData.password); break;
      case 'fullName': error = validateFullName(value); break;
      case 'refCode': error = validateRefCode(value); break;
      default: break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, general: '' }));

    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    const fullNameError = validateFullName(formData.fullName);
    const refCodeError = validateRefCode(formData.refCode);

    if (usernameError || emailError || passwordError || confirmPasswordError || fullNameError || refCodeError) {
      setErrors({
        username: usernameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        fullName: fullNameError,
        refCode: refCodeError,
        general: '',
      });
      return;
    }

    // Kiểm tra refCode hợp lệ (cả từ URL và tự nhập)
    if (refCodeValidation.isValid !== true) {
      setErrors(prev => ({
        ...prev,
        refCode: 'Please use a valid and available referral code',
        general: 'Invalid referral code',
      }));
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      refCode: formData.refCode,
    });

    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      const msg = result.error || 'Registration failed';
      if (msg.toLowerCase().includes('username already exists')) {
        setErrors(prev => ({ ...prev, username: 'This username is already taken' }));
      } else if (msg.toLowerCase().includes('email already exists')) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
      } else if (msg.toLowerCase().includes('invalid referral code') || msg.toLowerCase().includes('placement position')) {
        setErrors(prev => ({ ...prev, refCode: msg }));
      } else {
        setErrors(prev => ({ ...prev, general: msg }));
      }
    }

    setLoading(false);
  };

  const isRefValid = refCodeValidation.isValid === true;
  const isRefInvalid = refCodeValidation.isValid === false && (hasRefFromUrl || formData.refCode.length >= 3);

  return (
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 md:p-8 glow-border relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Các field khác giữ nguyên */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Username <span className="text-red-400">*</span>
          </label>
          <input id="username" name="username" type="text" required value={formData.username} onChange={handleChange} onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.username ? 'border-red-500/50 focus:ring-red-500' : 'border-emerald-500/30 focus:ring-emerald-500'
              }`} placeholder="Choose a username" />
          {errors.username && <p className="mt-1 text-sm text-red-400 flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email <span className="text-red-400">*</span>
          </label>
          <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500/50 focus:ring-red-500' : 'border-emerald-500/30 focus:ring-emerald-500'
              }`} placeholder="Enter your email" />
          {errors.email && <p className="mt-1 text-sm text-red-400 flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input id="fullName" name="fullName" type="text" required value={formData.fullName} onChange={handleChange} onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${errors.fullName ? 'border-red-500/50 focus:ring-red-500' : 'border-emerald-500/30 focus:ring-emerald-500'
              }`} placeholder="Enter your full name" />
          {errors.fullName && <p className="mt-1 text-sm text-red-400 flex items-center"><svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.fullName}</p>}
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 bg-slate-600/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-10 ${errors.password ? 'border-red-500/50 focus:ring-red-500' : 'border-emerald-500/30 focus:ring-emerald-500'
                }`}
              placeholder="Create a password (min 6 characters)"
            />
            {/* Nút toggle password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                // Icon mắt mở
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                // Icon mắt đóng
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password với toggle */}
        <div className="relative">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 bg-slate-600/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all pr-10 ${errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500' : 'border-emerald-500/30 focus:ring-emerald-500'
                }`}
              placeholder="Confirm your password"
            />
            {/* Nút toggle confirm password */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Referral Code - ĐÃ CẬP NHẬT */}
        <div>
          <label htmlFor="refCode" className="block text-sm font-medium text-gray-300 mb-2">
            Referral Code <span className="text-red-400">*</span>
            {hasRefFromUrl && <span className="text-xs text-emerald-400 ml-2">(from referral link)</span>}
          </label>
          <input
            id="refCode"
            name="refCode"
            type="text"
            required
            value={formData.refCode}
            onChange={handleChange}
            onBlur={handleBlur}
            readOnly={hasRefFromUrl}
            disabled={hasRefFromUrl}
            className={`w-full px-4 py-3 bg-slate-600/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${hasRefFromUrl ? 'opacity-80 cursor-not-allowed bg-slate-700/70' : ''
              } ${errors.refCode
                ? 'border-red-500/50 focus:ring-red-500'
                : isRefValid
                  ? 'border-green-500/50 focus:ring-green-500'
                  : 'border-emerald-500/30 focus:ring-emerald-500'
              }`}
            placeholder={hasRefFromUrl ? '' : 'Enter referral code'}
          />

          {/* Validation messages */}
          {refCodeValidation.isValidating && (
            <div className="mt-2 flex items-center text-sm text-gray-400">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {hasRefFromUrl ? 'Validating referral link...' : 'Validating referral code...'}
            </div>
          )}

          {isRefInvalid && (
            <div className="mt-2 flex items-center text-sm text-red-400">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {refCodeValidation.message || 'Invalid or unavailable referral code'}
            </div>
          )}

          {isRefValid && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-green-400">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {hasRefFromUrl ? 'Referral link is valid' : 'Valid referral code'}
              </div>
              {refCodeValidation.sponsor && (
                <div className="text-sm text-gray-400 ml-6">
                  Sponsor: <span className="text-emerald-400 font-medium">{refCodeValidation.sponsor}</span>
                </div>
              )}
            </div>
          )}

          {errors.refCode && !refCodeValidation.isValidating && !isRefValid && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.refCode}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || refCodeValidation.isValidating || !isRefValid}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/50"
        >
          {loading ? 'Creating Account...' : refCodeValidation.isValidating ? 'Validating...' : !isRefValid ? 'Invalid referral code' : 'Register'}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;