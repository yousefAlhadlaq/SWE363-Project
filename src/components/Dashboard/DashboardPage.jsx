 import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ArrowUpCircle,
  Banknote,
  ChevronRight,
  Link2,
  MessageSquare,
  PenSquare,
  PiggyBank,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Download,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import Sidebar from '../Shared/Sidebar';
import Card from '../Shared/Card';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import InputField from '../Shared/InputField';
import SelectMenu from '../Shared/SelectMenu';
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
    id: 'parse-sms',
    title: 'Parse SMS',
    description: 'Parse bank SMS text',
    icon: MessageSquare,
    accent: 'from-amber-400 to-pink-500',
    submitLabel: 'Parse & Add',
    modalTitle: 'Parse Bank SMS',
    modalSubtitle: 'Paste your bank message and we will extract the details for you.',
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
    date: '',
    description: '',
  },
  'manual-entry': {
    transactionType: '',
    account: '',
    amount: '',
    category: '',
    merchant: '',
    date: '',
    notes: '',
  },
  'parse-sms': {
    sms: '',
    account: '',
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
  { value: 'transfer', label: 'Transfer' },
];

const categoryOptions = [
  { value: 'telecom', label: 'Telecom' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'travel', label: 'Travel' },
  { value: 'utilities', label: 'Utilities' },
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
  const { user } = useAuth();
  const [statusRange, setStatusRange] = useState('weekly');
  const [activeAction, setActiveAction] = useState(null);
  const [actionValues, setActionValues] = useState(actionInitialValues);
  const [latestUpdates, setLatestUpdates] = useState(initialLatestUpdates);
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [linkAccountStep, setLinkAccountStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [linkedAccounts, setLinkedAccounts] = useState([]);

  // Generate account options dynamically from linked accounts
  // Always include a default "Main Account" option for users without linked accounts
  // Use useMemo to ensure UI refreshes when balances change
  const linkedAccountOptions = useMemo(() => {
    const mainAccountOption = {
      value: 'main',
      label: `Main Account (Default) - ${formatSR(dashboardData?.totalBalance || 0)}`,
      name: 'Main Account (Default)',
      balance: dashboardData?.totalBalance || 0,
    };

    return [
      mainAccountOption,
      ...linkedAccounts.map(account => ({
        value: account.id || account._id,  // Use the actual account ID from backend
        label: `${account.bank} - ${account.accountNumber || account.accountType || 'Account'} - ${formatSR(account.balance || 0)}`,
        name: `${account.bank} - ${account.accountNumber || account.accountType || 'Account'}`,
        balance: account.balance || 0,
      }))
    ];
  }, [dashboardData?.totalBalance, linkedAccounts]);

  // Filter out Main Account for transfer/deposit/manual actions
  const realAccountOptions = useMemo(() => {
    return linkedAccountOptions.filter(account => account.value !== 'main');
  }, [linkedAccountOptions]);

  // Fetch dashboard data from backend
  const fetchDashboardData = useCallback(async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
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
              icon: update.status === 'investment' ? TrendingUp : (update.status === 'in' ? ArrowUpCircle : ArrowUpRight), // Changed ShoppingBag to ArrowUpRight
            }));
            setLatestUpdates(formattedUpdates);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
  const activeFinancialData = dashboardData?.weeklyChart || financialStatusData[statusRange];
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
      [actionId]: actionInitialValues[actionId],
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

  const handleSubmitAction = async (actionId, event) => {
    event.preventDefault();

    if (actionId === 'link-account') {
      const data = actionValues['link-account'];

      // Validate all fields
      if (!data.bank || !data.initialDeposit || !data.accountName) {
        alert('Please fill in all fields');
        return;
      }

      setLinkingAccount(true);

      try {
        // Call backend API to create account
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');

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
            accountName: data.accountName,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create account');
        }

        const result = await response.json();

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
        fetchDashboardData();

        // Reset form and close modal
        resetActionForm(actionId);
        setActiveAction(null);

      } catch (error) {
        console.error('Error creating account:', error);
        alert('Failed to create account. Please try again.');
      } finally {
        setLinkingAccount(false);
      }

      return;
    }

    if (actionId === 'quick-deposit') {
      const data = actionValues['quick-deposit'];

      // Validate all fields
      if (!data.fromAccount || !data.account || !data.amount || !data.date) {
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
            date: data.date,
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
          timestamp: formatTimestamp(data.date),
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

      // Validate all fields
      if (!data.account || !data.amount || !data.date || !data.transactionType) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        // Call backend API to create manual entry
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');

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
          throw new Error('Failed to create manual entry');
        }

        const result = await response.json();

        // Add success notification
        const amount = parseFloat(data.amount) || 0;
        const status = direction === 'incoming' ? 'in' : 'out';
        const transactionLabel = data.transactionType
          ? `${data.transactionType.charAt(0).toUpperCase()}${data.transactionType.slice(1)}`
          : 'Entry';

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

        // Reset form and close modal
        resetActionForm(actionId);
        setActiveAction(null);

      } catch (error) {
        console.error('Error creating manual entry:', error);
        alert('Failed to create manual entry. Please try again.');
      }

      return;
    }

    if (actionId === 'parse-sms') {
      const data = actionValues['parse-sms'];

      // Validate all fields
      if (!data.account || !data.sms) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        // Call backend API to parse SMS
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/transactions/parse-sms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            accountId: data.account,
            smsText: data.sms,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to parse SMS');
        }

        const result = await response.json();

        if (result.success && result.data.saved) {
          const parsed = result.data.parsed;

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

          // Reset form and close modal
          resetActionForm(actionId);
          setActiveAction(null);
        } else {
          alert('Could not extract transaction details from SMS. Please try manual entry.');
        }

      } catch (error) {
        console.error('Error parsing SMS:', error);
        alert('Failed to parse SMS. Please try again.');
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
      const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${endpoint}?${queryParams.toString()}`;
      
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
                    onChange={(event) =>
                      updateActionValue('link-account', 'bank', event.target.value)
                    }
                    options={bankOptions}
                    required
                  />
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
                    onChange={(event) =>
                      updateActionValue('link-account', 'initialDeposit', event.target.value)
                    }
                    placeholder="0.00"
                    required
                  />
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
                    onChange={(event) =>
                      updateActionValue('link-account', 'accountName', event.target.value)
                    }
                    placeholder="e.g., Main Checking, Savings"
                    required
                  />

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
              label="Date"
              name="date"
              type="date"
              value={actionValues['quick-deposit'].date}
              onChange={(event) =>
                updateActionValue('quick-deposit', 'date', event.target.value)
              }
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
      case 'manual-entry':
        return (
          <form
            onSubmit={(event) => handleSubmitAction('manual-entry', event)}
            className="space-y-4"
          >
            <SelectMenu
              label="Transaction Type"
              name="transactionType"
              value={actionValues['manual-entry'].transactionType}
              onChange={(event) =>
                updateActionValue('manual-entry', 'transactionType', event.target.value)
              }
              options={transactionTypeOptions}
              required
            />
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
              min="0"
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
              options={categoryOptions}
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
      case 'parse-sms':
        return (
          <form
            onSubmit={(event) => handleSubmitAction('parse-sms', event)}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                SMS Text
              </label>
              <textarea
                rows={4}
                name="sms"
                value={actionValues['parse-sms'].sms}
                onChange={(event) =>
                  updateActionValue('parse-sms', 'sms', event.target.value)
                }
                placeholder="Paste your bank SMS message here..."
                className={textAreaClasses}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: Your account ending in 1234 has been debited 89.99 SR at Apple Store on 04/10/2024.
              </p>
            </div>
            <SelectMenu
              label="Account to Deposit"
              name="account"
              value={actionValues['parse-sms'].account}
              onChange={(event) =>
                updateActionValue('parse-sms', 'account', event.target.value)
              }
              options={realAccountOptions}
              required
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => handleCancelAction('parse-sms')}
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
            <div className="relative">
              <input
                type="search"
                placeholder="Search accounts, transactions, or requests..."
                className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/60 px-5 py-3 pl-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Search className="w-5 h-5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
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
                    {chartPoints.length ? (
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
                  {linkedAccountOptions.length === 1 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      Link accounts to see more balances
                    </p>
                  )}
                </div>
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
