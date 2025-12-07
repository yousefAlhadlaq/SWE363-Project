import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const usePortfolioSummary = () => {
  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    totalInvested: 0,
    totalGainLoss: 0,
    gainLossPercentage: 0,
    investmentCount: 0,
    timeSeries: [],
    byCategory: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/investments/portfolio`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio summary');
      }

      const data = await response.json();

      if (data.success && data.portfolio) {
        setPortfolio(data.portfolio);
        setError(null);
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching portfolio summary:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, loading, error, refetch: fetchPortfolio };
};
