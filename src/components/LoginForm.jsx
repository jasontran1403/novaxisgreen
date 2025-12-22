import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '', // Email hoặc username
    password: ''
  });
  const [errors, setErrors] = useState({
    identifier: '',
    password: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateIdentifier = (identifier) => {
    if (!identifier || identifier.trim() === '') {
      return 'Please enter email or username';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password || password.trim() === '') {
      return 'Please enter password';
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

    if (name === 'identifier') {
      error = validateIdentifier(value);
    } else if (name === 'password') {
      error = validatePassword(value);
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
      email: '',
      password: '',
      general: ''
    });

    // Validate form
    const identifierError = validateIdentifier(formData.identifier);
    const passwordError = validatePassword(formData.password);

    if (identifierError || passwordError) {
      setErrors({
        identifier: identifierError,
        password: passwordError,
        general: ''
      });
      return;
    }

    setLoading(true);

    // Call login with identifier (email or username)
    const result = await login(formData.identifier, formData.password);

    if (result.success) {
      // Login successful, context will automatically redirect
      window.location.href = '/dashboard';
    } else {
      // Handle error from API
      const errorMessage = result.error || 'Login failed';
      
      // Check error type to display appropriately
      if (errorMessage.includes('Email/Username hoặc password không đúng') || errorMessage.includes('Email hoặc password không đúng') || errorMessage.includes('Email/Username or password is incorrect') || errorMessage.includes('Email or password is incorrect')) {
        setErrors({
          identifier: '',
          password: '',
          general: 'Email/Username or password is incorrect. Please check again.'
        });
      } else if (errorMessage.includes('Vui lòng nhập email/username') || errorMessage.includes('Please enter email/username')) {
        setErrors({
          identifier: 'Please enter email or username',
          password: '',
          general: ''
        });
      } else if (errorMessage.includes('Vui lòng nhập password') || errorMessage.includes('Vui lòng nhập mật khẩu') || errorMessage.includes('Please enter password')) {
        setErrors({
          identifier: '',
          password: 'Please enter password',
          general: ''
        });
      } else if (errorMessage.includes('Vui lòng nhập email/username và password') || errorMessage.includes('Please enter email/username and password')) {
        setErrors({
          identifier: 'Please enter email or username',
          password: 'Please enter password',
          general: ''
        });
      } else {
        setErrors({
          identifier: '',
          password: '',
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

        {/* Email or Username */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2">
            Email or Username <span className="text-red-400">*</span>
          </label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            value={formData.identifier}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.identifier 
                ? 'border-red-500/50 focus:ring-red-500' 
                : 'border-emerald-500/30 dark:border-emerald-400/30 focus:ring-emerald-500'
            }`}
            placeholder="Enter your email or username"
          />
          {errors.identifier && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.identifier}
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
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 bg-slate-600/50 dark:bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              errors.password 
                ? 'border-red-500/50 focus:ring-red-500' 
                : 'border-emerald-500/30 dark:border-emerald-400/30 focus:ring-emerald-500'
            }`}
            placeholder="Enter your password"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-gray-400 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Register now
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;

