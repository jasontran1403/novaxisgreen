import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/apiConfig';

function RegisterForm() {
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Lấy refCode từ URL nếu có
  const refCodeFromUrl = searchParams.get('ref') || '';
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    refCode: refCodeFromUrl
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    refCode: '',
    general: ''
  });

  const [loading, setLoading] = useState(false);
  
  // State cho refCode validation
  const [refCodeValidation, setRefCodeValidation] = useState({
    isValidating: false,
    isValid: null,
    message: '',
    sponsor: ''
  });

  // Validate refCode khi user nhập
  useEffect(() => {
    const validateRefCode = async () => {
      const refCode = formData.refCode.trim();
      
      // Reset nếu refCode rỗng
      if (!refCode || refCode.length < 3) {
        setRefCodeValidation({
          isValidating: false,
          isValid: null,
          message: '',
          sponsor: ''
        });
        return;
      }

      // Bắt đầu validate
      setRefCodeValidation(prev => ({ ...prev, isValidating: true }));

      try {
        const response = await api.get(`${API_ENDPOINTS.REFLINK.VALIDATE}/${refCode}`, { includeAuth: false });
        
        if (response.success && response.data) {
          const isValid = response.data.valid && response.data.available;
          
          setRefCodeValidation({
            isValidating: false,
            isValid: isValid,
            message: response.data.message || '',
            sponsor: response.data.sponsor || ''
          });

          // Clear error nếu valid
          if (isValid) {
            setErrors(prev => ({ ...prev, refCode: '' }));
          }
        } else {
          setRefCodeValidation({
            isValidating: false,
            isValid: false,
            message: 'Invalid referral code',
            sponsor: ''
          });
        }
      } catch (error) {
        setRefCodeValidation({
          isValidating: false,
          isValid: false,
          message: error.message || 'Error validating referral code',
          sponsor: ''
        });
      }
    };

    // Debounce validation
    const timer = setTimeout(() => {
      validateRefCode();
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.refCode]);

  // Validation functions
  const validateUsername = (username) => {
    if (!username || username.trim() === '') {
      return 'Username is required';
    }
    if (username.length < 3 || username.length > 50) {
      return 'Username must be between 3 and 50 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === '') {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword || confirmPassword.trim() === '') {
      return 'Please confirm password';
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match';
    }
    return '';
  };

  const validateFullName = (fullName) => {
    if (!fullName || fullName.trim() === '') {
      return 'Full name is required';
    }
    return '';
  };

  const validateRefCode = (refCode) => {
    if (!refCode || refCode.trim() === '') {
      return 'Referral code is required';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when user is typing
    setErrors({
      ...errors,
      [name]: '',
      general: ''
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';

    switch (name) {
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value, formData.password);
        break;
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'refCode':
        error = validateRefCode(value);
        break;
      default:
        break;
    }

    setErrors({
      ...errors,
      [name]: error
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      refCode: '',
      general: ''
    });

    // Validate all fields
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
        general: ''
      });
      return;
    }

    // CRITICAL: Kiểm tra refCode có hợp lệ không trước khi submit
    if (refCodeValidation.isValid !== true) {
      setErrors({
        ...errors,
        refCode: 'Please enter a valid and available referral code',
        general: 'Cannot register: Invalid or unavailable referral code'
      });
      return;
    }

    setLoading(true);

    // Call register API
    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      refCode: formData.refCode
    });

    if (result.success) {
      // Registration successful, redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Handle error from API
      const errorMessage = result.error || 'Registration failed';
      
      // Parse error message to set appropriate field errors
      if (errorMessage.toLowerCase().includes('username already exists')) {
        setErrors({
          username: 'This username is already taken',
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          refCode: '',
          general: ''
        });
      } else if (errorMessage.toLowerCase().includes('email already exists')) {
        setErrors({
          username: '',
          email: 'This email is already registered',
          password: '',
          confirmPassword: '',
          fullName: '',
          refCode: '',
          general: ''
        });
      } else if (errorMessage.toLowerCase().includes('invalid referral code')) {
        setErrors({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          refCode: 'Invalid referral code',
          general: ''
        });
      } else if (errorMessage.toLowerCase().includes('placement position is already taken')) {
        setErrors({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          refCode: 'This placement position is already taken',
          general: ''
        });
      } else {
        setErrors({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          fullName: '',
          refCode: '',
          general: errorMessage
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-slate-700/50 dark:bg-gray-800/50 rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 p-6 md:p-8 glow-border relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
            Username <span className="text-red-400">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.username 
                ? 'border-red-500/50 focus:ring-red-500' 
                : 'border-emerald-500/30 dark:border-emerald-400/30 focus:ring-emerald-500'
            }`}
            placeholder="Choose a username (3-50 characters)"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.username}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.email 
                ? 'border-red-500/50 focus:ring-red-500' 
                : 'border-emerald-500/30 dark:border-emerald-400/30 focus:ring-emerald-500'
            }`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.fullName 
                ? 'border-red-500/50 focus:ring-red-500' 
                : 'border-emerald-500/30 dark:border-emerald-400/30 focus:ring-emerald-500'
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
            Password <span className="text-red-400">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.password 
                ? 'border-red-500/50 focus:ring-red-500' 
                : 'border-emerald-500/30 dark:border-emerald-400/30 focus:ring-emerald-500'
            }`}
            placeholder="Create a password (min 6 characters)"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
            Confirm Password <span className="text-red-400">*</span>
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.confirmPassword 
                ? 'border-red-500/50 focus:ring-red-500' 
                : 'border-emerald-500/30 dark:border-emerald-400/30 focus:ring-emerald-500'
            }`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Referral Code - BẮT BUỘC */}
        <div>
          <label htmlFor="refCode" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
            Referral Code <span className="text-red-400">*</span>
          </label>
          <input
            id="refCode"
            name="refCode"
            type="text"
            required
            value={formData.refCode}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.refCode 
                ? 'border-red-500/50 focus:ring-red-500' 
                : refCodeValidation.isValid === true
                  ? 'border-green-500/50 focus:ring-green-500'
                  : 'border-emerald-500/30 dark:border-emerald-400/30 focus:ring-emerald-500'
            }`}
            placeholder="Enter referral code"
          />
          
          {/* Real-time RefCode Validation */}
          {refCodeValidation.isValidating && (
            <div className="mt-2 flex items-center text-sm text-gray-400">
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating referral code...
            </div>
          )}

          {!refCodeValidation.isValidating && refCodeValidation.isValid === false && formData.refCode.length >= 3 && (
            <div className="mt-2 flex items-center text-sm text-red-400">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {refCodeValidation.message || 'Invalid or unavailable referral code'}
            </div>
          )}

          {!refCodeValidation.isValidating && refCodeValidation.isValid === true && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-green-400">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Valid referral code
              </div>
              {refCodeValidation.sponsor && (
                <div className="text-sm text-gray-400 ml-6">
                  Sponsor: <span className="text-emerald-400 font-medium">{refCodeValidation.sponsor}</span>
                </div>
              )}
            </div>
          )}

          {errors.refCode && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.refCode}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || refCodeValidation.isValid !== true || refCodeValidation.isValidating}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/50"
        >
          {loading ? 'Creating Account...' : 
           refCodeValidation.isValidating ? 'Validating...' :
           refCodeValidation.isValid !== true ? 'Please enter valid referral code' :
           'Register'}
        </button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-gray-400 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;