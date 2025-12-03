const Notification = require('../models/notification');
const Settings = require('../models/settings');

/**
 * Check if user has enabled notifications for a specific category
 * @param {String} userId - User's MongoDB ObjectId
 * @param {String} category - Category name (transactionAlerts, budgetReminders, investmentUpdates, marketingEmails)
 * @returns {Boolean} - Whether notifications are enabled for this category
 */
async function isNotificationEnabled(userId, category) {
  try {
    const settings = await Settings.findOne({ user: userId });

    if (!settings || !settings.alertSettings) {
      // If no settings exist, default to true (enabled)
      return true;
    }

    return settings.alertSettings[category] !== false;
  } catch (error) {
    console.error('Error checking notification settings:', error);
    // Default to true on error
    return true;
  }
}

/**
 * Create a notification - ALWAYS creates for Latest Updates feed
 * Bell notification only if user has enabled that category
 *
 * IMPORTANT: This function ALWAYS creates a record for the Latest Updates feed.
 * The `read` status only affects whether it appears in the bell badge count.
 *
 * @param {Object} notificationData - Notification data
 * @param {String} notificationData.userId - User's MongoDB ObjectId
 * @param {String} notificationData.type - Notification type (transaction, budget, investment, marketing, info, warning, success, error)
 * @param {String} notificationData.category - Category (transactionAlerts, budgetReminders, investmentUpdates, marketingEmails)
 * @param {String} notificationData.title - Notification title
 * @param {String} notificationData.message - Notification message
 * @param {Object} notificationData.metadata - Optional metadata object
 * @returns {Object} - Created notification (always returns, never null)
 */
async function createNotification(notificationData) {
  try {
    const { userId, type, category, title, message, metadata = {} } = notificationData;

    console.log('🔔 [NOTIFICATION] createNotification called:', {
      userId,
      type,
      category,
      title,
      messagePreview: message.substring(0, 50),
      hasMetadata: Object.keys(metadata).length > 0
    });

    // Check if user has enabled this notification category for BELL notifications
    const isEnabled = await isNotificationEnabled(userId, category);
    console.log(`🔔 [NOTIFICATION] Category ${category} enabled:`, isEnabled);

    // Create the notification ALWAYS (for Latest Updates feed)
    // If user disabled this category, mark as 'read' so it doesn't show in bell badge
    const notification = new Notification({
      user: userId,
      type,
      category,
      title,
      message,
      metadata,
      read: !isEnabled // Mark as read if user disabled this category
    });

    await notification.save();
    console.log("NOTIFICATION SAVED:", notification); // 🚨 REQUIRED DEBUG LOG
    console.log(`🔔 [NOTIFICATION] Saved to DB: ID=${notification._id}, read=${notification.read}`);

    if (isEnabled) {
      console.log(`✅ Notification created (unread) for user ${userId}: ${title}`);
    } else {
      console.log(`📝 Activity logged (marked read) for user ${userId}: ${title} - category ${category} is disabled`);
    }

    return notification;
  } catch (error) {
    console.error('❌ [NOTIFICATION] Error creating notification:', error);
    console.error('❌ [NOTIFICATION] Stack:', error.stack);
    // Still try to return something for Latest Updates
    throw error;
  }
}

/**
 * Create a transaction notification
 */
async function createTransactionNotification(userId, transactionData) {
  const {
    amount,
    type, // 'deposit', 'withdrawal', 'transfer_in', 'transfer_out'
    accountName,
    transactionId,
    merchant = null, // Optional merchant name
    method = 'Transaction' // e.g., "POS • Card", "Transfer", "Bank Transfer"
  } = transactionData;

  // Determine direction for Latest Updates feed
  const isIncoming = type === 'deposit' || type === 'transfer_in';
  const direction = isIncoming ? 'in' : 'out';

  // Format title for display
  let title;
  if (merchant) {
    title = merchant; // Use merchant name if available
  } else if (type === 'transfer_in' || type === 'transfer_out') {
    title = 'Transfer'; // Generic transfer title
  } else {
    title = `${type === 'deposit' ? 'Deposit' : 'Withdrawal'}`; // Fallback
  }

  // Format message for bell notification
  const sign = isIncoming ? '+' : '-';
  const action = isIncoming ? 'added to' : 'withdrawn from';
  const message = `${sign}SR ${amount.toFixed(2)} ${action} ${accountName}`;

  return await createNotification({
    userId,
    type: 'transaction',
    category: 'transactionAlerts',
    title,
    message,
    metadata: {
      transactionId,
      amount,
      accountName,
      method,
      merchant,
      direction
    }
  });
}

/**
 * Create a budget reminder notification
 */
async function createBudgetNotification(userId, budgetData) {
  const { budgetName, percentUsed, budgetId } = budgetData;

  let type = 'info';
  let title = 'Budget Update';
  let message = `You've used ${percentUsed}% of your ${budgetName} budget`;

  if (percentUsed >= 90) {
    type = 'warning';
    title = 'Budget Alert';
    message = `Warning: You've used ${percentUsed}% of your ${budgetName} budget`;
  } else if (percentUsed >= 100) {
    type = 'error';
    title = 'Budget Exceeded';
    message = `You've exceeded your ${budgetName} budget by ${percentUsed - 100}%`;
  }

  return await createNotification({
    userId,
    type,
    category: 'budgetReminders',
    title,
    message,
    metadata: {
      budgetId,
      percentUsed
    }
  });
}

/**
 * Create an investment update notification
 */
async function createInvestmentNotification(userId, investmentData) {
  const {
    investmentType, // 'Stock', 'Gold', 'Real Estate', 'Crypto'
    amount,
    change,
    investmentId,
    name, // Investment name (e.g., 'Apple', 'Gold Reserve')
    quantity = null, // Shares, ounces, etc.
    symbol = null // Stock ticker (e.g., 'AAPL')
  } = investmentData;

  // Determine if this is a purchase or update
  const isPurchase = !change; // No change means it's a new purchase

  let type, title, message;

  if (isPurchase) {
    // New investment purchase
    type = 'info';
    if (quantity && symbol) {
      title = `Bought ${quantity} share${quantity > 1 ? 's' : ''} of ${symbol}`;
      message = `Investment purchase: ${name} - SR ${amount.toFixed(2)}`;
    } else {
      title = `${investmentType} Investment`;
      message = `Purchased ${name} - SR ${amount.toFixed(2)}`;
    }
  } else {
    // Investment value update
    type = change >= 0 ? 'success' : 'warning';
    title = change >= 0 ? 'Investment Growth' : 'Investment Update';
    message = `Your ${investmentType} investment ${change >= 0 ? 'gained' : 'lost'} SR ${Math.abs(change).toFixed(2)} (${amount > 0 ? ((change / amount) * 100).toFixed(2) : 0}%)`;
  }

  return await createNotification({
    userId,
    type,
    category: 'investmentUpdates',
    title,
    message,
    metadata: {
      investmentId,
      amount,
      accountName: investmentType,
      method: 'Investment',
      direction: 'investment',
      quantity,
      symbol
    }
  });
}

/**
 * Create a link account notification
 */
async function createLinkAccountNotification(userId, accountData) {
  const { bankName, accountNumber, initialDeposit } = accountData;

  return await createNotification({
    userId,
    type: 'success',
    category: 'transactionAlerts',
    title: 'New Account Linked',
    message: `Successfully linked ${bankName} account with initial deposit of SR ${initialDeposit.toFixed(2)}`,
    metadata: {
      amount: initialDeposit,
      accountName: bankName,
      method: 'Account Setup',
      merchant: `${bankName} - ${accountNumber}`,
      direction: 'in'
    }
  });
}

/**
 * Create a marketing/promotional notification
 */
async function createMarketingNotification(userId, marketingData) {
  const { title, message } = marketingData;

  return await createNotification({
    userId,
    type: 'info',
    category: 'marketingEmails',
    title,
    message,
    metadata: {}
  });
}

/**
 * Create notifications for multiple users (e.g., admin broadcast)
 */
async function createBulkNotifications(userIds, notificationData) {
  const promises = userIds.map(userId =>
    createNotification({ ...notificationData, userId })
  );

  const results = await Promise.allSettled(promises);

  const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
  const failed = results.filter(r => r.status === 'rejected' || r.value === null).length;

  console.log(`Bulk notifications: ${successful} successful, ${failed} failed/skipped`);

  return { successful, failed };
}

module.exports = {
  isNotificationEnabled,
  createNotification,
  createTransactionNotification,
  createBudgetNotification,
  createInvestmentNotification,
  createLinkAccountNotification,
  createMarketingNotification,
  createBulkNotifications
};
