// API Base URL
export const API_BASE_URL = "https://api.novaxisgreen.com";
// export const API_BASE_URL = " http://localhost:9393";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    ADMIN_LOGIN: '/api/auth/admin-login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    LOGOUT: '/api/auth/logout',
    CHANGE_PASSWORD: '/api/auth/change-password',
    GET_2FA_STATUS: '/api/auth/2fa/status',
    ENABLE_2FA: '/api/auth/2fa/enable',
    VERIFY_2FA: '/api/auth/2fa/verify',
    DISABLE_2FA: '/api/auth/2fa/disable',
  },

  // Reflink - NEW ENDPOINTS
  REFLINK: {
    MY_REFLINKS: '/api/user/my-reflinks',
    VALIDATE: '/api/auth/validate', // Sử dụng: `/api/v1/user/validate/${refCode}`
  },

  // User
  USER: {
    STATISTIC: '/api/user/statistic',
    MY_REFLINKS: '/api/user/my-reflinks',
    BINARY_TREE: '/api/user/binary-tree',       // ← FIX: Đúng endpoint
    MEMBER_LIST: '/api/user/member-list',
    F1_MEMBERS: '/api/user/f1-members',
    F1_MEMBERS_BY_ID: (userId) => `/api/user/f1-members/${userId}`,
    CREATE_TEMP_REFLINK: '/api/user/create-temp-reflink',
    SEARCH: (searchTerm) => `/api/user/search?searchTerm=${encodeURIComponent(searchTerm)}`,
    GET_PACKAGES: '/api/user/packages',
    INVEST: '/api/user/invest',
    GET_MY_INVESTMENTS: '/api/user/my-investments',
    GET_BALANCE: '/api/user/balance',
    GET_ADDRESS: '/api/user/address',
    SWAP: '/api/user/swap',
    GET_SWAP_HISTORY: '/api/user/swap-history',
    GET_WITHDRAW_HISTORY: '/api/user/withdraw-history',
    GET_DEPOSIT_HISTORY: '/api/user/deposit-history',
    GET_TRANSACTIONS: '/api/user/transactions',
    DEPOSIT: '/api/user/deposit',
    WITHDRAW: '/api/user/withdraw',
    TRANSFER: '/api/user/transfer',
    VALIDATE_USERNAME: (username) =>  `/api/user/validate/${username}`,
    VALIDATE_WALLET_ADDRESS: (walletAddress) => `/api/user/validate-address/${walletAddress}`,
    CREATE_DEPOSIT: "/api/user/create-deposit",
    GET_DAILY_INTEREST: "/api/user/daily-interest",
    GET_DIRECT_COMMISSION: '/api/user/direct-commission',
    GET_BINARY_COMMISSION: '/api/user/binary-commission',
    GET_LEADERSHIP_COMMISSION: '/api/user/leadership-commission',
    GET_POP_COMMISSION: '/api/user/pop-commission',
  },

  // Income
  INCOME: {
    GET_24H: '/api/income/24h',
  },

  // Plan info
  PLAN: {
    INFO: '/api/plan',
  },

  // Network / Sales
  NETWORK: {
    SALES_SUMMARY: '/api/network/sales-summary',
    DIRECT_SALES: '/api/network/direct-sales',
  },

  // Admin
  ADMIN: {
    // Auth
    AUTH_LOGOUT: '/api/admin/logout',
    AUTH_CHECK: '/api/admin/check',
    PAY_DAILY: '/api/auth/pay-daily',

    // Dashboard
    DASHBOARD_STATS: '/api/admin/dashboard/stats',

    // Members
    MEMBERS: '/api/admin/members',
    MEMBERS_EXPORT: '/api/admin/members/export',
    MEMBER_DETAIL: (id) => `/api/admin/members/${id}`,
    MEMBER_UPDATE: (id) => `/api/admin/members/${id}`,
    MEMBER_LOCK: (id) => `/api/admin/members/${id}/lock`,
    MEMBER_IMPERSONATE: (id) => `/api/admin/members/${id}/impersonate`,
    MEMBER_BALANCE: (id) => `/api/admin/members/${id}/balance`,

    // Binary Tree
    BINARY_TREE_SYSTEM: '/api/admin/binary-tree/system',
    BINARY_TREE_USER: (userId) => `/api/admin/binary-tree/user/${userId}`,
    BINARY_TREE_SEARCH: '/api/admin/binary-tree/search',
    BINARY_TREE_EXPORT: '/api/admin/binary-tree/export',
    BINARY_TREE_MOVE_NODE: '/api/admin/binary-tree/move-node',
    BINARY_TREE_ADD_NODE: '/api/admin/binary-tree/add-node',
    BINARY_TREE_UPDATE_NODE: (nodeId) => `/api/admin/binary-tree/node/${nodeId}`,

    // Commission Settings
    COMMISSION_DIRECT: '/api/admin/commission-settings/direct',
    COMMISSION_COMPOUND: '/api/admin/commission-settings/compound',
    COMMISSION_VIP: '/api/admin/commission-settings/vip',

    // Settings
    SETTINGS_ADMINS: '/api/admin/settings/admins',
    SETTINGS_ADMIN_ADD: '/api/admin/settings/admins',
    SETTINGS_ADMIN_REMOVE: (id) => `/api/admin/settings/admins/${id}`,
    SETTINGS_EXCHANGE_RATE: '/api/admin/settings/exchange-rate',
    SETTINGS_DISCORD_WEBHOOK: '/api/admin/settings/discord-webhook',
    SETTINGS_DISCORD_WEBHOOK_TEST: '/api/admin/settings/discord-webhook/test',
    SETTINGS_MAINTENANCE: '/api/admin/settings/maintenance',
    SETTINGS_NOTIFICATIONS: '/api/admin/settings/notifications',

    // Wallet Operations
    DEPOSITS: '/api/admin/deposits',
    DEPOSIT_SWAP: '/api/admin/deposits/swap',
    WITHDRAWS: '/api/admin/withdraws',
    WITHDRAW_APPROVE: '/api/admin/withdraws/approve',
    WITHDRAW_CANCEL: '/api/admin/withdraws/cancel',
    WALLET_CONFIG: '/api/admin/wallet-config',

    // System Operations
    RESET_REBUILD: '/api/admin/reset-rebuild',
    RESET_NOVA_FOR_USER: '/api/admin/reset-nova',
    RECALC_NOVA_BALANCES: '/api/admin/recalc-nova-balances',
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// Response Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to access.',
  NOT_FOUND: 'Data not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An error occurred. Please try again.',
};