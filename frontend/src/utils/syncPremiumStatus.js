import API from '../api/axios';

/**
 * Fetches user data from backend, updates localStorage, and returns user object.
 * Use this as the single source of truth for premium status and expiry.
 */
export async function syncPremiumStatus() {
  try {
    const res = await API.get('/api/user/me');
    const user = res.data.data;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isPremium', user.isPremium);
    localStorage.setItem('premiumExpiryDate', user.premiumExpiryDate || '');
    return user;
  } catch (error) {
    console.error('Failed to sync premium status:', error);
    return null;
  }
}
