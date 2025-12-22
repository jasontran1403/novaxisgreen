import { API_BASE_URL, ERROR_MESSAGES, HTTP_METHODS, STATUS_CODES, STORAGE_KEYS } from '../config/apiConfig';

/**
 * API Service - Handles all API calls
 */
class ApiService {
  /**
   * Get token from localStorage
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Get headers for request
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle response from API
   */
  async handleResponse(response, includeAuth = true) {
    // Check Content-Type before parsing JSON
    const contentType = response.headers.get('content-type');
    let data = null;

    try {
      // Chỉ parse JSON nếu response là JSON
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        // Check if text is empty
        if (text.trim() === '') {
          data = {};
        } else {
          data = JSON.parse(text);
        }
      } else {
        // If not JSON, get text
        const text = await response.text();
        throw new Error(text || ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    } catch (error) {
      // Handle JSON parse error
      if (error instanceof SyntaxError) {
        console.error('JSON Parse Error:', error);
        throw new Error('Data format error from server');
      }
      throw error;
    }

    if (!response.ok) {
      // Handle specific errors
      if (response.status === STATUS_CODES.UNAUTHORIZED) {
        // If calling public endpoint (e.g., login) then return original message
        if (!includeAuth) {
          throw new Error(data?.error || data?.message || ERROR_MESSAGES.UNAUTHORIZED);
        }
        // Token expired or invalid
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Can dispatch event to redirect to login
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new Error(data?.error || data?.message || ERROR_MESSAGES.UNAUTHORIZED);
      }

      if (response.status === STATUS_CODES.FORBIDDEN) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      }

      if (response.status === STATUS_CODES.NOT_FOUND) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      }

      if (response.status >= STATUS_CODES.INTERNAL_SERVER_ERROR) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }

      // Error from server (400, 422, etc.)
      throw new Error(data?.error || data?.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }

    return data || {};
  }

  /**
   * Execute API request
   */
  async request(endpoint, method = HTTP_METHODS.GET, body = null, includeAuth = true) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const options = {
        method,
        headers: this.getHeaders(includeAuth),
        credentials: 'include', // Include cookies if needed
      };

      if (body && (method === HTTP_METHODS.POST || method === HTTP_METHODS.PUT || method === HTTP_METHODS.PATCH)) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      return await this.handleResponse(response, includeAuth);
    } catch (error) {
      // Handle network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {object} options - Options object { params: { key: value }, includeAuth: boolean }
   */
  async get(endpoint, options = {}) {
    const { params, includeAuth = true } = options;
    
    // Add query params to URL if any
    let url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}`;
    }
    
    return this.request(url, HTTP_METHODS.GET, null, includeAuth);
  }

  /**
   * POST request
   */
  async post(endpoint, body, includeAuth = true) {
    return this.request(endpoint, HTTP_METHODS.POST, body, includeAuth);
  }

  /**
   * PUT request
   */
  async put(endpoint, body, includeAuth = true) {
    return this.request(endpoint, HTTP_METHODS.PUT, body, includeAuth);
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, includeAuth = true) {
    return this.request(endpoint, HTTP_METHODS.PATCH, body, includeAuth);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, includeAuth = true) {
    return this.request(endpoint, HTTP_METHODS.DELETE, null, includeAuth);
  }
}

// Export singleton instance
export default new ApiService();

