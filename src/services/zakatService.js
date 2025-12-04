const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * Calculate Zakat for user's investment portfolio
 * @returns {Promise<Object>} Zakat calculation result
 */
export const calculateZakat = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/zakat/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to calculate Zakat');
    }

    return data;

  } catch (error) {
    console.error('Error calculating Zakat:', error);
    throw error;
  }
};

/**
 * Get current gold price for Nisab calculation
 * @returns {Promise<Object>} Gold price data
 */
export const getGoldPrice = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/zakat/gold-price`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get gold price');
    }

    return data;

  } catch (error) {
    console.error('Error fetching gold price:', error);
    throw error;
  }
};

export default {
  calculateZakat,
  getGoldPrice
};
