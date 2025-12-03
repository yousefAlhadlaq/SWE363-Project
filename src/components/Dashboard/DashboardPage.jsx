 import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ArrowUpCircle,
  Banknote,
  ChevronRight,
  Link2,
  PenSquare,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Download,
  TrendingUp,
  CreditCard,
<<<<<<< HEAD
  Inbox,
  BarChart3,
=======
  Trash2,
>>>>>>> f535dea (improving linking bank account funcionality as well as the UI look, adding remove bank account funcionality, in addtion to some usability enhancement)
} from 'lucide-react';
import Sidebar from '../Shared/Sidebar';
import Card from '../Shared/Card';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import InputField from '../Shared/InputField';
import SelectMenu from '../Shared/SelectMenu';
import EmptyState from '../Shared/EmptyState';
import { useAuth } from '../../context/AuthContext';

const formatSR = (value = 0, digits = 2) =>
  `SR ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

const financialStatusOptions = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const financialStatusData = {
  weekly: [
    { label: 'Sun', value: 2 },
    { label: 'Mon', value: 7 },
    { label: 'Tue', value: 12 },
    { label: 'Wed', value: 18 },
    { label: 'Thu', value: 22 },
    { label: 'Fri', value: 27 },
    { label: 'Sat', value: 10 },
  ],
  monthly: [
    { label: 'Week 1', value: 12 },
    { label: 'Week 2', value: 19 },
    { label: 'Week 3', value: 27 },
    { label: 'Week 4', value: 32 },
  ],
  yearly: [
    { label: 'Q1', value: 52 },
    { label: 'Q2', value: 61 },
    { label: 'Q3', value: 78 },
    { label: 'Q4', value: 88 },
  ],
};

const initialLatestUpdates = [
  {
    id: 1,
    merchant: 'Apple',
    amount: 89.99,
    timestamp: 'Oct 4, 3:51 PM',
    method: 'POS • Card',
    status: 'out',
    icon: ArrowUpRight, // Changed from ShoppingBag
  },
  {
    id: 2,
    merchant: 'Advance payment',
    amount: 90.0,
    timestamp: 'Oct 4, 3:51 PM',
    method: 'Transfer',
    status: 'out',
    icon: ArrowUpCircle,
  },
  {
    id: 3,
    merchant: 'Advance payment',
    amount: 90.0,
    timestamp: 'Oct 4, 3:50 PM',
    method: 'Transfer',
    status: 'in',
    icon: PiggyBank,
  },
  {
    id: 4,
    merchant: 'King Fahd U',
    amount: 5.18,
    timestamp: 'Sep 21, 11:21 AM',
    method: 'POS',
    status: 'out',
    icon: ArrowDownLeft, // Changed from RefreshCcw
  },
];

const quickActions = [
  {
    id: 'link-account',
    title: 'Link a new account',
    description: 'Connect a bank account',
    icon: Link2,
    accent: 'from-teal-400 to-emerald-500',
    submitLabel: 'Link Account',
    modalTitle: 'Link a New Account',
    modalSubtitle: 'Select a bank to generate and link a new account',
  },
  {
    id: 'quick-deposit',
    title: 'Transfer Funds',
    description: 'Move money between accounts',
    icon: ArrowUpCircle,
    accent: 'from-cyan-400 to-blue-500',
    submitLabel: 'Transfer Funds',
    modalTitle: 'Transfer Funds',
    modalSubtitle: 'Move money between your accounts',
  },
  {
    id: 'manual-entry',
    title: 'Manual entry',
    description: 'Add a transaction',
    icon: PenSquare,
    accent: 'from-indigo-400 to-purple-500',
    submitLabel: 'Add Transaction',
    modalTitle: 'Manual Transaction Entry',
    modalSubtitle: 'Perfect when you need to register something retroactively.',
  },
  {
    id: 'remove-account',
    title: 'Remove bank account',
    description: 'Remove a linked bank account',
    icon: Trash2,
    accent: 'from-rose-500 to-orange-500',
    submitLabel: 'Remove Account',
    modalTitle: 'Remove Linked Account',
    modalSubtitle: 'Select an account to remove from your profile.',
  },
  {
    id: 'export',
    title: 'Export Report',
    description: 'Download your transaction history',
    icon: Download,
    accent: 'from-indigo-500 to-purple-600',
    submitLabel: 'Download Report',
    modalTitle: 'Export Financial Report',
    modalSubtitle: 'Download your transaction history',
  },
];

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getManualEntryInitialValues = () => ({
  transactionType: 'expense',
  account: '',
  amount: '',
  category: '',
  merchant: '',
  date: getTodayDateString(),
  notes: '',
  fromAccount: '',
  toAccount: '',
});

const actionInitialValues = {
  'link-account': {
    bank: '',
    initialDeposit: '',
    accountName: '',
  },
  'quick-deposit': {
    fromAccount: '',
    account: '',
    amount: '',
    description: '',
  },
  'manual-entry': getManualEntryInitialValues(),
  'remove-account': {
    accountId: '',
  },
  export: {
    format: 'csv',
    startDate: '',
    endDate: '',
  },
};

const accountTypeOptions = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit Card' },
];

// linkedAccountOptions will be dynamically generated from linkedAccounts state
// This ensures we use real account IDs from the backend instead of hardcoded values

const bankOptions = [
  { value: '1', label: 'Al Rajhi Bank' },
  { value: '2', label: 'National Commercial Bank' },
  { value: '3', label: 'Riyad Bank' },
  { value: '4', label: 'Saudi British Bank' },
  { value: '5', label: 'Bank Albilad' },
  { value: '6', label: 'Alinma Bank' },
  { value: '7', label: 'Bank Al Jazira' },
  { value: '8', label: 'Banque Saudi Fransi' },
];

const transactionTypeOptions = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

const expenseCategoryOptions = [
  { value: 'telecom', label: 'Telecom' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'travel', label: 'Travel' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'transport', label: 'Transport' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

const incomeCategoryOptions = [
  { value: 'salary', label: 'Salary' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'investment_return', label: 'Investment Return' },
  { value: 'gift', label: 'Gift' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'other', label: 'Other' },
];

const spendingBreakdown = {
  topMerchant: 'Apple',
  amount: 89.99,
  category: 'Telecom',
  percentage: 100,
  allocation: [
    { label: 'Telecom', value: 70 },
    { label: 'Groceries', value: 20 },
    { label: 'Transport', value: 10 },
  ],
};

const textAreaClasses =
  'w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition';

const latestUpdatesLimit = 6;

const getOptionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value || '—';

const formatTimestamp = (inputDate) => {
  const now = new Date();
  let date;
  if (inputDate) {
    const parsed = new Date(inputDate);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(now.getHours(), now.getMinutes());
      date = parsed;
    }
  }
  if (!date) {
    date = now;
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const parseSmsText = (sms = '') => {
  const amountMatch = sms.match(/(\d+(?:\.\d+)?)(?=\s*(?:sr|sar))/i);
  const merchantMatch = sms.match(/at\s+([A-Za-z0-9\s&]+)/i);
  const credited = /(credited|deposit|received)/i.test(sms);
  const debited = /(debited|purchase|spent|withdrawn)/i.test(sms);

  return {
    amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
    merchant: merchantMatch ? merchantMatch[1].trim() : undefined,
    isCredit: credited && !debited ? true : debited ? false : true,
  };
};

function DashboardPage() {
  const { user, authLoading } = useAuth(); // ✅ Get authLoading from context
  const [statusRange, setStatusRange] = useState('weekly');
  const [activeAction, setActiveAction] = useState(null);
  const [actionValues, setActionValues] = useState(actionInitialValues);
  const [latestUpdates, setLatestUpdates] = useState(initialLatestUpdates);
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [linkAccountStep, setLinkAccountStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [linkedAccounts, setLinkedAccounts] = useState([]);
<<<<<<< HEAD
  const [chartData, setChartData] = useState(financialStatusData.weekly);
=======
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
>>>>>>> f535dea (improving linking bank account funcionality as well as the UI look, adding remove bank account funcionality, in addtion to some usability enhancement)

  // Generate account options dynamically from linked accounts
  // Always include a default "Main Account" option for users without linked accounts
  // Use useMemo to ensure UI refreshes when balances change
  const linkedAccountOptions = useMemo(() => {
    const mainBalance = dashboardData?.totalBalance || 0;
    const mainBankLabel = 'Main Account';
    const mainAccountName = 'Main Account (Default)';

    const mainAccountOption = {
      value: 'main',
      label: `${mainBankLabel} — ${mainAccountName} — ${formatSR(mainBalance)}`,
      name: mainAccountName,
      accountName: mainAccountName,
      bank: mainBankLabel,
      balance: mainBalance,
      isAccountOption: true,
      logo: null,
    };

    return [
      mainAccountOption,
      ...linkedAccounts.map(account => {
        const bankLabel = account.bank || account.bankName || 'Bank';
        const accountNameRaw =
          account.accountName ||
          account.name ||
          account.nickname ||
          account.nickName ||
          '';
        const accountNickname = accountNameRaw.trim() || 'Unnamed';
        const balanceValue = account.balance || 0;

        return {
          value: account.id || account._id,  // Use the actual account ID from backend
          bank: bankLabel,
          accountName: accountNickname,
          balance: balanceValue,
          label: `${bankLabel} — ${accountNickname} — ${formatSR(balanceValue)}`,
          name: `${bankLabel} — ${accountNickname} — ${formatSR(balanceValue)}`,
          logo: account.bankLogo || account.logo || account.bank_logo,
          isAccountOption: true,
        };
      })
    ];
  }, [dashboardData?.totalBalance, linkedAccounts]);

  // Filter out Main Account for transfer/deposit/manual actions
  const realAccountOptions = useMemo(() => {
    return linkedAccountOptions.filter(account => account.value !== 'main');
  }, [linkedAccountOptions]);

  // Fetch analytics chart data
  const fetchChartData = useCallback(async (range) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    // ✅ Validate token exists before making request
    if (!token) {
      console.warn('⚠️ Cannot fetch chart data: No token available');
      return;
    }

    console.log(`📊 Fetching chart data for range: ${range}`);

    try {
      const response = await fetch(`${API_BASE_URL}/analytics/spending?range=${range}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error('❌ Unauthorized: Token expired or invalid');
        // Don't clear user here - let auth middleware handle it
        return;
      }

      if (!response.ok) {
        console.error(`❌ Chart fetch failed: ${response.status}`);
        return;
      }

      const result = await response.json();
      if (result.success && result.data.chart) {
        console.log(`✅ Chart data loaded: ${result.data.chart.length} data points, isNewUser=${result.data.isNewUser}`);
        setChartData(result.data.chart);

        // ✅ Store new user flag from analytics
        if (result.data.isNewUser !== undefined) {
          setDashboardData(prev => ({
            ...prev,
            chartIsNewUser: result.data.isNewUser,
          }));
        }
      } else {
        console.warn('⚠️ Chart data missing in response');
      }
    } catch (error) {
      console.error('❌ Error fetching chart data:', error);
    }
  }, []); // ✅ No dependencies - function doesn't change

  // Fetch dashboard data from backend
  const fetchDashboardData = useCallback(async () => {
<<<<<<< HEAD
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
=======
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');
>>>>>>> f535dea (improving linking bank account funcionality as well as the UI look, adding remove bank account funcionality, in addtion to some usability enhancement)

    // ✅ Validate token exists before making request
    if (!token) {
      console.warn('⚠️ Cannot fetch dashboard data: No token available');
      setLoading(false);
      return;
    }

    console.log('📊 Fetching dashboard data...');

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error('❌ Unauthorized: Token expired or invalid');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        console.error(`❌ Dashboard fetch failed: ${response.status}`);
        setLoading(false);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log('✅ Dashboard data loaded');
        setDashboardData(result.data);
        setLinkedAccounts(result.data.accounts || []);

        // Update latest updates from backend
        if (result.data.latestUpdates && result.data.latestUpdates.length > 0) {
          const formattedUpdates = result.data.latestUpdates.map((update, index) => ({
            id: update.id || `update-${index}`,
            merchant: update.merchant,
            amount: update.amount,
            timestamp: formatTimestamp(update.timestamp),
            method: update.method,
            status: update.status,
            icon: update.status === 'investment' ? TrendingUp : (update.status === 'in' ? ArrowUpCircle : ArrowUpRight),
          }));
          setLatestUpdates(formattedUpdates);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []); // ✅ No dependencies - function doesn't change

  // ✅ CRITICAL FIX: Wait for auth to complete, then fetch data
  useEffect(() => {
    // Don't fetch until auth is initialized
    if (authLoading) {
      console.log('⏳ Waiting for auth to complete...');
      return;
    }

    // Don't fetch if user is not logged in
    if (!user) {
      console.log('❌ No user - skipping data fetch');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No token - skipping data fetch');
      setLoading(false);
      return;
    }

    console.log('✅ Auth ready - fetching dashboard and chart data');
    fetchDashboardData();
    fetchChartData(statusRange);
  }, [authLoading, user, statusRange, fetchDashboardData, fetchChartData]);
  // ✅ Dependencies: authLoading (wait for it), user (refetch on login), statusRange (refetch on change)

  // Refresh dashboard when user returns to the page (e.g., after creating an investment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };

    const handleFocus = () => {
      fetchDashboardData();
    };

    // Listen for page visibility changes (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Listen for window focus events (clicking back into the app)
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDashboardData]);

  const mapTransactions = useCallback(
    (transactions = []) =>
      transactions.map((transaction, index) => {
        const amount = Number(transaction.amount ?? transaction.value ?? 0);
        const status = transaction.status || transaction.direction || (transaction.type === 'credit' ? 'in' : 'out');
        const icon = status === 'in' ? ArrowUpCircle : ArrowUpRight; // Changed ShoppingBag to ArrowUpRight
        return {
          id: transaction.id || `tx-${index}`,
          merchant: transaction.merchant || transaction.description || 'Transaction',
          amount,
          timestamp: formatTimestamp(transaction.timestamp || transaction.createdAt || transaction.date),
          method: transaction.method || transaction.category || transaction.type || '—',
          status: status === 'credit' ? 'in' : status === 'debit' ? 'out' : status || 'out',
          icon,
        };
      }),
    []
  );

  const addLatestUpdate = (update) => {
    setLatestUpdates((prev) =>
      [{ id: Date.now(), ...update }, ...prev].slice(0, latestUpdatesLimit)
    );
  };

  // ✅ Show loading state while auth initializes
  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-page text-white pt-20">
        <Sidebar />
        <div className="flex-1 ml-64 px-6 py-8">
          <div className="max-w-6xl space-y-6">
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              <p className="mt-4 text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.fullName || 'Jordan Carter';
  const userInitials = useMemo(() => {
    if (!displayName) return 'U';
    const parts = displayName
      .split(' ')
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() || 'U';
    }
    return `${parts[0][0]?.toUpperCase() || ''}${parts[1][0]?.toUpperCase() || ''}`;
  }, [displayName]);

  // Use real data from backend instead of hardcoded financialStatusData
  const activeFinancialData = chartData;
  const maxFinancialValue = Math.max(
    ...activeFinancialData.map((item) => item.value),
    1
  );

  const chartWidth = 720;
  const chartHeight = 240;
  const chartPaddingX = 40;
  const chartPaddingY = 26;
  const usableWidth = chartWidth - chartPaddingX * 2;
  const usableHeight = chartHeight - chartPaddingY * 2;

  const chartPoints = activeFinancialData.map((entry, index) => {
    const x =
      activeFinancialData.length === 1
        ? chartPaddingX + usableWidth / 2
        : chartPaddingX + (index / (activeFinancialData.length - 1)) * usableWidth;
    const normalizedValue = entry.value / maxFinancialValue;
    const y =
      chartHeight - chartPaddingY - normalizedValue * usableHeight;
    return { ...entry, x, y };
  });

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');

  const areaPath = chartPoints.length
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x.toFixed(2)} ${
        chartHeight - chartPaddingY
      } L ${chartPoints[0].x.toFixed(2)} ${chartHeight - chartPaddingY} Z`
    : '';

  const gridLines = [0.25, 0.5, 0.75].map((ratio) => ({
    y: chartPaddingY + ratio * usableHeight,
  }));

  const currentAction = quickActions.find((action) => action.id === activeAction);
  const handleCancelAction = (actionId) => {
    if (actionId) {
      resetActionForm(actionId);
    }
    setActiveAction(null);
    setLinkingAccount(false);
    setLinkAccountStep(1);
  };

  const updateActionValue = (actionId, field, value) => {
    setActionValues((prev) => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        [field]: value,
      },
    }));
  };

  const resetActionForm = (actionId) => {
    setActionValues((prev) => ({
      ...prev,
      [actionId]: actionId === 'manual-entry'
        ? getManualEntryInitialValues()
        : actionInitialValues[actionId],
    }));
  };

  const handleNextStep = () => {
    if (linkAccountStep < 3) {
      setLinkAccountStep(linkAccountStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (linkAccountStep > 1) {
      setLinkAccountStep(linkAccountStep - 1);
    }
  };

  const handleManualEntryTypeChange = (transactionType) => {
    setActionValues(prev => ({
      ...prev,
      'manual-entry': {
        ...getManualEntryInitialValues(),
        transactionType,
      },
    }));
  };

  const validateManualEntry = (data) => {
    const amount = parseFloat(data.amount);

    if (!data.transactionType) {
      return 'Please select a transaction type';
    }

    if (data.transactionType === 'expense') {
      if (!data.account) return 'Expense account is required';
      if (!data.amount || Number.isNaN(amount) || amount <= 0) return 'Expense amount must be greater than 0';
      if (!data.category) return 'Expense category is required';
      if (!data.merchant) return 'Merchant or description is required for expenses';
      if (!data.date) return 'Expense date is required';
    } else if (data.transactionType === 'income') {
      if (!data.account) return 'Income receiving account is required';
      if (!data.amount || Number.isNaN(amount) || amount <= 0) return 'Income amount must be greater than 0';
      if (!data.category) return 'Income category is required';
      if (!data.merchant) return 'Income source or description is required';
      if (!data.date) return 'Income date is required';
    }

    return null;
  };

  const handleSubmitAction = async (actionId, event) => {
    event.preventDefault();

    if (actionId === 'link-account') {
      const data = actionValues['link-account'];

      // Clear previous errors
      setFormErrors({});

      // Comprehensive client-side validation
      const errors = {};

      if (!data.bank) {
        errors.bank = 'Please select a bank';
      }

      if (!data.initialDeposit) {
        errors.initialDeposit = 'Initial deposit is required';
      } else if (parseFloat(data.initialDeposit) <= 0) {
        errors.initialDeposit = 'Initial deposit must be greater than 0';
      } else if (isNaN(parseFloat(data.initialDeposit))) {
        errors.initialDeposit = 'Please enter a valid number';
      }

      if (!data.accountName) {
        errors.accountName = 'Account name is required';
      } else if (data.accountName.trim().length < 3) {
        errors.accountName = 'Account name must be at least 3 characters';
      }

      // If there are validation errors, display them and don't submit
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setLinkingAccount(true);

      try {
        // Call backend API to create account
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const token = localStorage.getItem('token');

        console.log('Creating account with data:', {
          bankId: data.bank,
          initialDeposit: parseFloat(data.initialDeposit),
          accountName: data.accountName.trim(),
        });

        const response = await fetch(`${API_BASE_URL}/accounts/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            bankId: data.bank,
            initialDeposit: parseFloat(data.initialDeposit),
            accountName: data.accountName.trim(),
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Parse specific error messages from backend
          let errorMsg = 'Failed to create account';

          if (response.status === 400) {
            errorMsg = result.error || 'Invalid account information. Please check your inputs.';
          } else if (response.status === 401) {
            errorMsg = 'Authentication failed. Please log in again.';
          } else if (response.status === 500) {
            errorMsg = result.error || 'Server error. Please try again later.';
          } else {
            errorMsg = result.error || result.message || errorMsg;
          }

          console.error('Account creation failed:', {
            status: response.status,
            error: errorMsg,
            details: result
          });

          setFormErrors({ general: errorMsg });
          return;
        }

        console.log('Account created successfully:', result);

        // Show success toast notification
        setSuccessMessage(`Successfully linked ${getOptionLabel(bankOptions, data.bank)} account!`);
        setTimeout(() => setSuccessMessage(null), 5000);

        // Add success notification or update
        addLatestUpdate({
          merchant: `${getOptionLabel(bankOptions, data.bank)} Account Linked`,
          amount: parseFloat(data.initialDeposit),
          timestamp: formatTimestamp(),
          method: 'Account Creation • Initial Deposit',
          status: 'in',
          icon: Link2,
        });

        // Refresh dashboard data to show new account
<<<<<<< HEAD
        fetchDashboardData();
        fetchChartData(statusRange);
=======
        await fetchDashboardData();
>>>>>>> f535dea (improving linking bank account funcionality as well as the UI look, adding remove bank account funcionality, in addtion to some usability enhancement)

        // Reset form and close modal
        resetActionForm(actionId);
        setActiveAction(null);

      } catch (error) {
        console.error('Error creating account:', error);
        setFormErrors({
          general: error.message || 'Network error. Please check your connection and try again.'
        });
      } finally {
        setLinkingAccount(false);
      }

      return;
    }

    if (actionId === 'quick-deposit') {
      const data = actionValues['quick-deposit'];

      // Validate all fields
      if (!data.fromAccount || !data.account || !data.amount) {
        alert('Please fill in all required fields');
        return;
      }

      // Prevent transfer to same account
      if (data.fromAccount === data.account) {
        alert('Cannot transfer to the same account');
        return;
      }

      try {
        // Call backend API to transfer funds
        const token = localStorage.getItem('token');

        console.log('💸 Submitting Transfer:', {
          fromAccountId: data.fromAccount,
          toAccountId: data.account,
          amount: parseFloat(data.amount),
          description: data.description || 'Transfer',
        });

        const response = await fetch('/api/transactions/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            fromAccountId: data.fromAccount,
            toAccountId: data.account,
            amount: parseFloat(data.amount),
            description: data.description || 'Transfer',
          }),
        });

        // Get the response body for better error messages
        const result = await response.json();

        if (!response.ok) {
          const errorMsg = result.error || 'Failed to transfer funds';
          console.error('❌ Transfer failed:', {
            status: response.status,
            error: errorMsg,
            details: result
          });
          throw new Error(errorMsg);
        }

        console.log('✅ Transfer successful:', result);

        // Add success notification
        const amount = parseFloat(data.amount) || 0;
        const fromLabel = getOptionLabel(linkedAccountOptions, data.fromAccount);
        const toLabel = getOptionLabel(linkedAccountOptions, data.account);

        addLatestUpdate({
          merchant: data.description || 'Transfer',
          amount,
          timestamp: formatTimestamp(),
          method: `${fromLabel} → ${toLabel}`,
          status: 'in',
          icon: ArrowUpCircle,
        });

        // Update accounts and Main Account balance immediately from response
        if (result.updatedAccounts) {
          setLinkedAccounts(result.updatedAccounts);
        }

        if (result.updatedMainBalance !== undefined) {
          // Update the dashboard data with new Main Account balance
          setDashboardData(prevData => ({
            ...prevData,
            totalBalance: result.updatedMainBalance,
            accounts: result.updatedAccounts || prevData.accounts,
          }));
        }

        // Reset form and close modal
        resetActionForm(actionId);
        setActiveAction(null);

        // Show success message
        alert(`Successfully transferred ${formatSR(amount)} from ${fromLabel} to ${toLabel}`);

      } catch (error) {
        console.error('Error processing transfer:', error);
        alert(`Failed to transfer funds: ${error.message}`);
      }

      return;
    }

    if (actionId === 'manual-entry') {
      const data = actionValues['manual-entry'];
      const validationError = validateManualEntry(data);

      // Type-specific validation
      if (validationError) {
        alert(validationError);
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const token = localStorage.getItem('token');

        // Handle EXPENSE and INCOME
        const direction = data.transactionType === 'income' ? 'incoming' : 'outgoing';

        const response = await fetch(`${API_BASE_URL}/transactions/manual`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            accountId: data.account,
            amount: parseFloat(data.amount),
            name: data.merchant || 'Manual transaction',
            date: data.date,
            category: data.category,
            direction,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to create manual entry');
        }

        // Add success notification
        const amount = parseFloat(data.amount) || 0;
        const status = direction === 'incoming' ? 'in' : 'out';
        const transactionLabel = data.transactionType.charAt(0).toUpperCase() + data.transactionType.slice(1);
        const categoryOptions = data.transactionType === 'income' ? incomeCategoryOptions : expenseCategoryOptions;

        addLatestUpdate({
          merchant: data.merchant || 'Manual transaction',
          amount,
          timestamp: formatTimestamp(data.date),
          method: `${transactionLabel} • ${getOptionLabel(categoryOptions, data.category)}`,
          status,
          icon: PenSquare,
        });

        // Refresh dashboard data to show updated balance
        fetchDashboardData();
        fetchChartData(statusRange);

        // Reset form and close modal
        resetActionForm(actionId);
        setActiveAction(null);

      } catch (error) {
        console.error('Error creating manual entry:', error);
        alert(`Failed to create ${data.transactionType}: ${error.message}`);
      }

      return;
    }

    if (actionId === 'remove-account') {
      const { accountId } = actionValues['remove-account'];

      if (!accountId) {
        alert('Please select an account to remove');
        return;
      }

      const selectedOption = linkedAccountOptions.find(opt => opt.value === accountId);
      const confirmationLabel = selectedOption?.label || 'this account';
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('token');

      const confirmed = window.confirm(`Are you sure you want to remove ${confirmationLabel}?`);
      if (!confirmed) return;

      try {
        const response = await fetch(`${API_BASE_URL}/accounts/external/${accountId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(result.error || 'Failed to remove account');
        }

        // Optimistically update local state
        setLinkedAccounts(prev => prev.filter(acc => (acc.id || acc._id) !== accountId));
        setDashboardData(prev => ({
          ...prev,
          accounts: prev?.accounts?.filter(acc => (acc.id || acc._id) !== accountId) || [],
        }));

        // Refresh to ensure balances and state are current
        fetchDashboardData();

<<<<<<< HEAD
          // Add success notification
          addLatestUpdate({
            merchant: parsed.merchant || 'Bank SMS',
            amount: parsed.amount,
            timestamp: formatTimestamp(),
            method: `Parsed SMS`,
            status: parsed.type === 'deposit' ? 'in' : 'out',
            icon: MessageSquare,
          });

          // Refresh dashboard data to show updated balance
          fetchDashboardData();
          fetchChartData(statusRange);

          // Reset form and close modal
          resetActionForm(actionId);
          setActiveAction(null);
        } else {
          alert('Could not extract transaction details from SMS. Please try manual entry.');
        }
=======
        setSuccessMessage(`Removed ${confirmationLabel}`);
        setTimeout(() => setSuccessMessage(null), 4000);
>>>>>>> f535dea (improving linking bank account funcionality as well as the UI look, adding remove bank account funcionality, in addtion to some usability enhancement)

        resetActionForm(actionId);
        setActiveAction(null);
      } catch (error) {
        console.error('Error removing account:', error);
        alert(`Failed to remove account: ${error.message}`);
      }

      return;
    }

    if (actionId === 'export') {
      const { format, startDate, endDate } = actionValues.export;

      // Validation
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        // toast.error is not defined, using alert for now
        alert('Start date cannot be after end date');
        return;
      }

      // Trigger download
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      queryParams.append('format', format);
      
      const endpoint = format === 'pdf' ? '/export/pdf' : '/export/csv';
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}${endpoint}?${queryParams.toString()}`;
      
      try {
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Export failed: ${errorText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // toast.success is not defined, using alert for now
        alert('Report downloaded successfully');
        handleCancelAction('export');
        setActiveAction(null);
      } catch (error) {
        console.error('Export error:', error);
        // toast.error is not defined, using alert for now
        alert(`Failed to download report: ${error.message}`);
      }
      return;
    }

    resetActionForm(actionId);
    setActiveAction(null);
  };

  const renderActionForm = () => {
    if (!currentAction) return null;

    switch (currentAction.id) {
      case 'link-account':
        return (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">
                  Step {linkAccountStep} of 3
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${(linkAccountStep / 3) * 100}%` }}
                />
              </div>
            </div>

            <form
              onSubmit={(event) => handleSubmitAction('link-account', event)}
              className="space-y-5"
            >
              {/* Step 1: Choose Bank */}
              {linkAccountStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Choose Your Bank</h3>
                    <p className="text-sm text-gray-400">Select the bank you want to link</p>
                  </div>
                  <SelectMenu
                    label="Bank"
                    name="bank"
                    value={actionValues['link-account'].bank}
                    onChange={(event) => {
                      updateActionValue('link-account', 'bank', event.target.value);
                      if (formErrors.bank) {
                        setFormErrors({ ...formErrors, bank: null });
                      }
                    }}
                    options={bankOptions}
                    required
                  />
                  {formErrors.bank && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.bank}</p>
                  )}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => handleCancelAction('link-account')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!actionValues['link-account'].bank}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Initial Deposit */}
              {linkAccountStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Initial Deposit</h3>
                    <p className="text-sm text-gray-400">Enter the starting balance for this account</p>
                  </div>
                  <InputField
                    label="Amount (SR)"
                    name="initialDeposit"
                    type="number"
                    min="0"
                    step="0.01"
                    value={actionValues['link-account'].initialDeposit}
                    onChange={(event) => {
                      updateActionValue('link-account', 'initialDeposit', event.target.value);
                      if (formErrors.initialDeposit) {
                        setFormErrors({ ...formErrors, initialDeposit: null });
                      }
                    }}
                    placeholder="0.00"
                    required
                  />
                  {formErrors.initialDeposit && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.initialDeposit}</p>
                  )}
                  <div className="flex justify-between gap-3 pt-2">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={handlePreviousStep}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!actionValues['link-account'].initialDeposit}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Account Name */}
              {linkAccountStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Name Your Account</h3>
                    <p className="text-sm text-gray-400">Give this account a memorable name</p>
                  </div>
                  <InputField
                    label="Account Name"
                    name="accountName"
                    value={actionValues['link-account'].accountName}
                    onChange={(event) => {
                      updateActionValue('link-account', 'accountName', event.target.value);
                      if (formErrors.accountName) {
                        setFormErrors({ ...formErrors, accountName: null });
                      }
                    }}
                    placeholder="e.g., Main Checking, Savings"
                    required
                  />
                  {formErrors.accountName && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.accountName}</p>
                  )}

                  {/* General Error Message */}
                  {formErrors.general && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-red-400 text-sm">{formErrors.general}</p>
                    </div>
                  )}

                  {/* Review Summary */}
                  <div className="mt-6 p-4 rounded-xl bg-slate-700/30 border border-slate-600/50 space-y-2">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">Review</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Bank:</span>
                      <span className="text-white font-medium">
                        {getOptionLabel(bankOptions, actionValues['link-account'].bank)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Initial Deposit:</span>
                      <span className="text-white font-medium">
                        {formatSR(actionValues['link-account'].initialDeposit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Account Name:</span>
                      <span className="text-white font-medium">
                        {actionValues['link-account'].accountName || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between gap-3 pt-2">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={handlePreviousStep}
                    >
                      Back
                    </Button>
                    <Button type="submit" loading={linkingAccount}>
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        );
      case 'quick-deposit':
        // Filter out the selected fromAccount from toAccount options
        // AND ensure Main Account is never an option for transfers
        const fromAccountId = actionValues['quick-deposit'].fromAccount;
        const toAccountOptions = realAccountOptions.filter(
          opt => opt.value !== fromAccountId
        );

        // Filter out the selected toAccount from fromAccount options
        const toAccountId = actionValues['quick-deposit'].account;
        const fromAccountOptions = realAccountOptions.filter(
          opt => opt.value !== toAccountId
        );

        return (
          <form
            onSubmit={(event) => handleSubmitAction('quick-deposit', event)}
            className="space-y-4"
          >
            <SelectMenu
              label="Transfer From"
              name="fromAccount"
              value={actionValues['quick-deposit'].fromAccount}
              onChange={(event) =>
                updateActionValue('quick-deposit', 'fromAccount', event.target.value)
              }
              options={fromAccountOptions}
              required
            />
            <SelectMenu
              label="Transfer To"
              name="account"
              value={actionValues['quick-deposit'].account}
              onChange={(event) =>
                updateActionValue('quick-deposit', 'account', event.target.value)
              }
              options={toAccountOptions}
              required
            />
            <InputField
              label="Amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={actionValues['quick-deposit'].amount}
              onChange={(event) =>
                updateActionValue('quick-deposit', 'amount', event.target.value)
              }
              placeholder="0.00"
              required
            />
            <InputField
              label="Description (Optional)"
              name="description"
              value={actionValues['quick-deposit'].description}
              onChange={(event) =>
                updateActionValue('quick-deposit', 'description', event.target.value)
              }
              placeholder="e.g., Transfer funds"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => handleCancelAction('quick-deposit')}
              >
                Cancel
              </Button>
              <Button type="submit">{currentAction.submitLabel}</Button>
            </div>
          </form>
        );
      case 'manual-entry': {
        const transactionType = actionValues['manual-entry'].transactionType || 'expense';

        return (
          <form
            onSubmit={(event) => handleSubmitAction('manual-entry', event)}
            className="space-y-4"
          >
            {/* Transaction Type Selector */}
            <div>
              <p className="block text-sm font-medium text-gray-400 mb-2">
                Transaction Type
              </p>
              <div className="grid grid-cols-2 gap-3">
                {transactionTypeOptions.map((option) => {
                  const isSelected = transactionType === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleManualEntryTypeChange(option.value)}
                      className={`
                        w-full px-4 py-3 rounded-lg border transition-all duration-200 text-sm font-semibold
                        ${isSelected
                          ? 'border-teal-500 bg-teal-500/10 text-white shadow-[0_0_0_1px_rgba(20,184,166,0.4)]'
                          : 'border-slate-600 bg-slate-700/40 text-gray-300 hover:border-slate-500'}
                      `}
                      aria-pressed={isSelected}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EXPENSE FORM */}
            {transactionType === 'expense' && (
              <>
                <SelectMenu
                  label="Account"
                  name="account"
                  value={actionValues['manual-entry'].account}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'account', event.target.value)
                  }
                  options={realAccountOptions}
                  required
                />
                <InputField
                  label="Amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={actionValues['manual-entry'].amount}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'amount', event.target.value)
                  }
                  placeholder="0.00"
                  required
                />
                <SelectMenu
                  label="Category"
                  name="category"
                  value={actionValues['manual-entry'].category}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'category', event.target.value)
                  }
                  options={expenseCategoryOptions}
                  required
                />
                <InputField
                  label="Merchant / Description"
                  name="merchant"
                  value={actionValues['manual-entry'].merchant}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'merchant', event.target.value)
                  }
                  placeholder="e.g., Apple Store"
                  required
                />
                <InputField
                  label="Date"
                  name="date"
                  type="date"
                  value={actionValues['manual-entry'].date}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'date', event.target.value)
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    name="notes"
                    value={actionValues['manual-entry'].notes}
                    onChange={(event) =>
                      updateActionValue('manual-entry', 'notes', event.target.value)
                    }
                    placeholder="Add any additional details..."
                    className={textAreaClasses}
                  />
                </div>
              </>
            )}

            {/* INCOME FORM */}
            {transactionType === 'income' && (
              <>
                <SelectMenu
                  label="Account"
                  name="account"
                  value={actionValues['manual-entry'].account}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'account', event.target.value)
                  }
                  options={realAccountOptions}
                  required
                />
                <InputField
                  label="Amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={actionValues['manual-entry'].amount}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'amount', event.target.value)
                  }
                  placeholder="0.00"
                  required
                />
                <SelectMenu
                  label="Income Category"
                  name="category"
                  value={actionValues['manual-entry'].category}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'category', event.target.value)
                  }
                  options={incomeCategoryOptions}
                  required
                />
                <InputField
                  label="Source / Description"
                  name="merchant"
                  value={actionValues['manual-entry'].merchant}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'merchant', event.target.value)
                  }
                  placeholder="e.g., Monthly Salary, Bonus"
                  required
                />
                <InputField
                  label="Date"
                  name="date"
                  type="date"
                  value={actionValues['manual-entry'].date}
                  onChange={(event) =>
                    updateActionValue('manual-entry', 'date', event.target.value)
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    name="notes"
                    value={actionValues['manual-entry'].notes}
                    onChange={(event) =>
                      updateActionValue('manual-entry', 'notes', event.target.value)
                    }
                    placeholder="Add any additional details..."
                    className={textAreaClasses}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => handleCancelAction('manual-entry')}
              >
                Cancel
              </Button>
              <Button type="submit">{currentAction.submitLabel}</Button>
            </div>
          </form>
        );
      }
      case 'remove-account':
        return (
          <form
            onSubmit={(event) => handleSubmitAction('remove-account', event)}
            className="space-y-4"
          >
            <SelectMenu
              label="Account to Remove"
              name="accountId"
              value={actionValues['remove-account'].accountId}
              onChange={(event) =>
                updateActionValue('remove-account', 'accountId', event.target.value)
              }
              options={realAccountOptions}
              required
            />
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              Removing an account will also remove its transactions from your dashboard summary.
              This action cannot be undone.
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => handleCancelAction('remove-account')}
              >
                Cancel
              </Button>
              <Button type="submit">{currentAction.submitLabel}</Button>
            </div>
          </form>
        );

      case 'export':
        return (
          <form
            onSubmit={(event) => handleSubmitAction('export', event)}
            className="space-y-4"
          >
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">File Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateActionValue('export', 'format', 'csv')}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    actionValues.export.format === 'csv'
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                      : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
                  }`}
                >
                  CSV (Excel)
                </button>
                <button
                  type="button"
                  onClick={() => updateActionValue('export', 'format', 'pdf')}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    actionValues.export.format === 'pdf'
                      ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                      : 'bg-slate-800/50 border-slate-700 text-gray-400 hover:border-slate-600'
                  }`}
                >
                  PDF Document
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Start Date (Optional)"
                name="startDate"
                type="date"
                value={actionValues.export.startDate}
                onChange={(event) =>
                  updateActionValue('export', 'startDate', event.target.value)
                }
              />
              <InputField
                label="End Date (Optional)"
                name="endDate"
                type="date"
                value={actionValues.export.endDate}
                onChange={(event) =>
                  updateActionValue('export', 'endDate', event.target.value)
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => handleCancelAction('export')}
              >
                Cancel
              </Button>
              <Button type="submit">{currentAction.submitLabel}</Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-page text-white pt-20">
      <Sidebar />

      {/* Success Toast Notification */}
      {successMessage && (
        <div
          className="fixed top-24 right-6 z-50 transition-all duration-300 ease-out"
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <style>{`
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
          `}</style>
          <div className="bg-teal-500/90 backdrop-blur-sm border border-teal-400/50 rounded-lg px-6 py-4 shadow-2xl flex items-center gap-3 max-w-md">
            <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 ml-64 px-6 py-8">
        <div className="max-w-6xl space-y-6">
          <header className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-teal-200/80">
                Home
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome back, {displayName.split(' ')[0] || 'there'} 👋
              </h1>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <Card className="!bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/50 overflow-hidden relative">
                <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none opacity-40" aria-hidden="true">
                  <svg viewBox="0 0 400 400" className="w-full h-full text-slate-800">
                    <defs>
                      <linearGradient id="heroGradient" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(45,212,191,0.05)" />
                        <stop offset="100%" stopColor="rgba(14,165,233,0.05)" />
                      </linearGradient>
                    </defs>
                    <circle cx="200" cy="200" r="180" fill="url(#heroGradient)" />
                  </svg>
                </div>
                <div className="relative space-y-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Welcome back 👋</p>
                      <div className="flex flex-wrap items-baseline gap-3 mt-1">
                        <p className="text-4xl font-bold">
                          {formatSR(dashboardData?.totalBalance || 0)}
                        </p>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-500/10 text-teal-300 border border-teal-500/40">
                          {linkedAccounts.length} accounts
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Total Balance</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-gray-400">
                        Weekly Spend
                      </p>
                      <p className="text-2xl font-semibold text-teal-300">
                        {formatSR(dashboardData?.weeklySpend || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        key: 'weekly-spend',
                        label: 'Weekly Spend',
                        amount: dashboardData?.weeklySpend || 0,
                        icon: Wallet,
                        hint: 'Spent this week',
                      },
                      {
                        key: 'investments',
                        label: 'Investments',
                        amount: dashboardData?.investmentsTotal || 0,
                        icon: TrendingUp,
                        hint: 'Stocks, Gold & more',
                      },
                      {
                        key: 'total-balance',
                        label: 'Total Balance',
                        amount: dashboardData?.totalBalance || 0,
                        icon: Banknote,
                        hint: 'Across all accounts',
                      },
                      {
                        key: 'credit-card',
                        label: 'Credit Card Due',
                        amount: dashboardData?.creditCardDue || 0,
                        icon: CreditCard,
                        hint: 'Outstanding balance',
                      },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={stat.key}
                          className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 flex flex-col gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800/70 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-teal-300" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-gray-400">
                                {stat.label}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xl font-semibold">{formatSR(stat.amount)}</p>
                            <p className="text-xs text-gray-500">{stat.hint}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <Card title="Your financial status">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-400">
                    Track weekly, monthly, or yearly spending performance.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {financialStatusOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                          statusRange === option.key
                            ? 'bg-teal-500/20 text-teal-200 border-teal-400/60 shadow-[0_0_25px_rgba(94,234,212,0.3)]'
                            : 'text-gray-400 border-slate-700/70 hover:text-white hover:border-teal-400/40'
                        }`}
                        onClick={() => setStatusRange(option.key)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-6">
                  <div className="relative">
                    {/* ✅ Show empty state if user has no spending data */}
                    {dashboardData?.chartIsNewUser ? (
                      <EmptyState
                        icon={BarChart3}
                        title="No spending data yet"
                        subtitle="Start by adding your first transaction or linking a bank account."
                        actionLabel="Add Transaction"
                        onAction={() => setActiveAction('manual-entry')}
                        variant="compact"
                      />
                    ) : chartPoints.length ? (
                      <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="w-full h-64"
                      >
                        <defs>
                          <linearGradient id="statusLine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#2dd4bf" />
                            <stop offset="100%" stopColor="#38bdf8" />
                          </linearGradient>
                          <linearGradient id="statusArea" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(45,212,191,0.25)" />
                            <stop offset="100%" stopColor="rgba(15,23,42,0)" />
                          </linearGradient>
                        </defs>

                        {gridLines.map((line, index) => (
                          <line
                            // eslint-disable-next-line react/no-array-index-key
                            key={`grid-${index}`}
                            x1={chartPaddingX}
                            x2={chartWidth - chartPaddingX}
                            y1={line.y}
                            y2={line.y}
                            stroke="rgba(148,163,184,0.15)"
                            strokeDasharray="6 6"
                          />
                        ))}

                        {areaPath && (
                          <path d={areaPath} fill="url(#statusArea)" opacity={0.8} />
                        )}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke="url(#statusLine)"
                            strokeWidth={3}
                            strokeLinecap="round"
                          />
                        )}
                        {chartPoints.map((point) => (
                          <g key={`point-${point.label}`}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={5}
                              fill="#2dd4bf"
                              stroke="#0f172a"
                              strokeWidth={2}
                            />
                          </g>
                        ))}
                      </svg>
                    ) : (
                      <div className="h-48 flex items-center justify-center rounded-xl border border-dashed border-slate-700/50 text-gray-500 text-sm">
                        No spending data recorded yet.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {activeFinancialData.map((entry) => (
                      <div key={entry.label} className="text-center">
                        <p className="text-lg font-semibold text-white">{entry.value}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                          {entry.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Daily spend limit
                    </p>
                    <p className="text-2xl font-semibold text-white mt-1">{formatSR(dashboardData?.dailySpendLimit || 0)}</p>
                    <p className="text-sm text-gray-400 mt-2">Transfers between my accounts</p>
                  </div>
                  <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Remaining limit
                    </p>
                    <p className="text-2xl font-semibold text-white mt-1">{formatSR(dashboardData?.remainingLimit || 0)}</p>
                    <p className="text-sm text-gray-400 mt-2">Safe spending buffer for today</p>
                  </div>
                </div>
              </Card>

              <Card title="Latest updates">
                {/* ✅ Show empty state if no transactions */}
                {dashboardData?.hasNoTransactions || latestUpdates.length === 0 ? (
                  <EmptyState
                    icon={Inbox}
                    title="No transactions available"
                    subtitle="Your recent activity will appear here."
                    actionLabel="Add Transaction"
                    onAction={() => setActiveAction('manual-entry')}
                    variant="compact"
                  />
                ) : (
                  <div className="space-y-3">
                    {latestUpdates.map((transaction) => {
                      const Icon = transaction.icon;
                      const isCredit = transaction.status === 'in';
                      const isInvestment = transaction.status === 'investment';
                      return (
                        <div
                          key={transaction.id}
                          className="flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-slate-800/70 flex items-center justify-center">
                            <Icon className={`w-5 h-5 ${isInvestment ? 'text-yellow-400' : 'text-teal-300'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{transaction.merchant}</p>
                            <p className="text-xs text-gray-400">{transaction.timestamp} • {transaction.method}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-base font-semibold ${isInvestment ? 'text-yellow-400' : (isCredit ? 'text-teal-300' : 'text-rose-300')}`}>
                              {isInvestment ? '' : (isCredit ? '+' : '-')}{formatSR(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-500">{isInvestment ? 'Investment' : (isCredit ? 'Incoming' : 'Outgoing')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Quick Actions">
                <div className="space-y-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        type="button"
                        key={action.id}
                        onClick={() => setActiveAction(action.id)}
                        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/30 px-4 py-3 text-left transition hover:border-teal-500/50 hover:bg-slate-900/60"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.accent} flex items-center justify-center text-slate-900`}
                          >
                            <Icon className="w-5 h-5" />
                          </span>
                          <div>
                            <p className="font-semibold text-white text-sm">{action.title}</p>
                            <p className="text-xs text-gray-400">{action.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card title="Your Accounts">
                {/* ✅ Show empty state if no accounts (only Main Account exists) */}
                {dashboardData?.hasNoAccounts || linkedAccountOptions.length === 1 ? (
                  <EmptyState
                    icon={Wallet}
                    title="No accounts yet"
                    subtitle="Link your first bank account to get started."
                    actionLabel="Link Account"
                    onAction={() => setActiveAction('link-account')}
                    variant="compact"
                  />
                ) : (
                  <div className="space-y-2">
                    {linkedAccountOptions.map((account) => (
                      <div
                        key={account.value}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-900/30 border border-slate-700/40 hover:border-teal-500/30 transition"
                      >
                        <span className="text-sm text-gray-300">{account.name}</span>
                        <span className="text-sm font-semibold text-white">
                          {formatSR(account.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Where did your money go?">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/30 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-400">Top merchant</p>
                  <p className="text-2xl font-semibold text-white mt-1">
                    {dashboardData?.topMerchant?.name || spendingBreakdown.topMerchant}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatSR(dashboardData?.topMerchant?.amount || spendingBreakdown.amount)}
                  </p>
                </div>
                <div className="mt-5 space-y-3">
                  {(dashboardData?.categoryBreakdown || []).length > 0 ? (
                    (dashboardData?.categoryBreakdown || spendingBreakdown.allocation).map((allocation) => (
                      <div key={allocation.label}>
                        <div className="flex items-center justify-between text-sm text-gray-300 mb-1">
                          <span>{allocation.label}</span>
                          <span>{allocation.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800/70">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-500"
                            style={{ width: `${allocation.value}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No spending recorded yet.
                    </div>
                  )}
                </div>
                <div className="mt-6 rounded-2xl border border-slate-700/60 bg-slate-900/30 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-400">Daily spend limit</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {formatSR(dashboardData?.dailySpendLimit || 1000)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Remaining: {formatSR(dashboardData?.remainingLimit || 1000)}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(currentAction)}
        onClose={() => handleCancelAction(currentAction?.id)}
        title={currentAction?.modalTitle}
        subtitle={currentAction?.modalSubtitle}
      >
        {renderActionForm()}
      </Modal>
    </div>
  );
}

export default DashboardPage;
