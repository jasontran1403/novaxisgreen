// src/api/reflinkService.js

import api from '../services/api';

/**
 * Create or get reflink for a specific position
 * 
 * @param {number} placementUserId - ID of user where new member will be placed
 * @param {string} side - "LEFT" or "RIGHT"
 * @returns {Promise<Object>} Reflink data with refCode, isDefault, etc.
 */
export const createTempReflink = async (placementUserId, side) => {
    try {
        const response = await api.post('/api/user/create-temp-reflink', {
            placementUserId,
            side: side.toUpperCase()
        });

        // Giả sử api đã transform response → response chính là { success, data, message }
        if (!response.success) {
            throw new Error(response.message || response.error || 'Failed to create reflink');
        }

        return response.data; // { refCode, isDefault, ... }
    } catch (error) {
        console.error('[API] Create reflink error:', error);

        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Failed to create referral link';

        throw new Error(errorMessage);
    }
};

/**
 * Get current user info
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/api/user/me');

        if (!response.data || !response.data.success) {
            throw new Error('Failed to get current user');
        }

        return response.data.data;
    } catch (error) {
        console.error('[API] Get current user error:', error);
        throw error;
    }
};