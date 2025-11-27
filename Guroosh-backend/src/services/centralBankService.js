const axios = require('axios');

// Central Bank mock server URL
const CENTRAL_BANK_URL = process.env.CENTRAL_BANK_URL || 'http://localhost:5002';

/**
 * Create user accounts and portfolios in Central Bank
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with accounts and stocks
 */
exports.createUser = async (userId) => {
  try {
    const response = await axios.post(`${CENTRAL_BANK_URL}/api/create_user`, {
      userId
    });

    return response.data;
  } catch (error) {
    console.error('Error creating user in Central Bank:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to create user in Central Bank');
  }
};

/**
 * Get user's bank accounts from Central Bank
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Accounts with billing information
 */
exports.getAccounts = async (userId) => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_URL}/api/accounts/${userId}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching accounts from Central Bank:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch accounts from Central Bank');
  }
};

/**
 * Get user's stock portfolios from Central Bank
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Stock portfolios grouped by brokerage
 */
exports.getStocks = async (userId) => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_URL}/api/stocks/${userId}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching stocks from Central Bank:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch stocks from Central Bank');
  }
};

/**
 * Perform an operation on Central Bank
 * @param {Object} operationData - Operation details
 * @param {string} operationData.userId - User ID
 * @param {string} operationData.operation_type - deposit, payment, transfer, buy_stock, sell_stock
 * @param {string} operationData.account_id - Account ID
 * @param {number} operationData.amount - Amount for deposit/payment/transfer
 * @param {string} operationData.description - Description of operation
 * @param {string} operationData.to_account_id - Target account for transfers
 * @param {string} operationData.stock_symbol - Stock symbol for buy/sell
 * @param {number} operationData.shares - Number of shares for buy/sell
 * @returns {Promise<Object>} Operation result
 */
exports.performOperation = async (operationData) => {
  try {
    const response = await axios.post(`${CENTRAL_BANK_URL}/api/perform_operation`, operationData);

    return response.data;
  } catch (error) {
    console.error('Error performing operation in Central Bank:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to perform operation in Central Bank');
  }
};

/**
 * Get user's gold reserve value from Central Bank
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Gold reserve details with investment value
 */
exports.getGoldValue = async (userId) => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_URL}/api/gold_value/${userId}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching gold value from Central Bank:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch gold value from Central Bank');
  }
};

/**
 * Check Central Bank server health
 * @returns {Promise<Object>} Health status
 */
exports.checkHealth = async () => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_URL}/health`);

    return response.data;
  } catch (error) {
    console.error('Error checking Central Bank health:', error.message);
    throw new Error('Central Bank server is not reachable');
  }
};
