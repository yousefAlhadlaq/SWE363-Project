import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpCircle,
  Banknote,
  ChevronRight,
  CreditCard,
  Link2,
  MessageSquare,
  PenSquare,
  PiggyBank,
  Search,
  ShoppingBag,
  TrendingUp,
  Wallet,
  RefreshCcw,
} from 'lucide-react';
import Sidebar from '../Shared/Sidebar';
import Card from '../Shared/Card';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import InputField from '../Shared/InputField';
import SelectMenu from '../Shared/SelectMenu';
import { useAuth } from '../../context/AuthContext';
import { accountService, categoryService, expenseService } from '../../services';

const formatSR = (value = 0, digits = 2) =>
  `SR ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;

const heroStats = [
  {
    key: 'weekly-spend',
    label: 'Weekly Spend',
    amount: 0,
    digits: 2,
    icon: Wallet,
    hint: 'Spent this week',
  },
  {
    key: 'investments',
    label: 'Investments',
    amount: 0,
    digits: 2,
    icon: TrendingUp,
    hint: 'Investments tracked',
  },
  {
    key: 'current-account',
    label: 'Current Account',
    amount: 0.39,
    digits: 2,
    icon: Banknote,
    hint: 'Cash on hand',
  },
  {
    key: 'credit-card',
    label: 'Credit Card',
    amount: 0.84,
    digits: 2,
    icon: CreditCard,
    hint: 'Due next week',
  },
];

const financialStatusOptions = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const financialStatusData = {
  weekly: [
    { label: 'Sun', value: 2 },
    { label: 'Mon', value: 9 },
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
    icon: ShoppingBag,
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
    icon: RefreshCcw,
  },
];

const quickActions = [
  {
    id: 'link-account',
    title: 'Link a new account',
    description: 'Connect a bank or card',
    icon: Link2,
    accent: 'from-teal-400 to-emerald-500',
    submitLabel: 'Link Account',
    modalTitle: 'Link a New Account',
    modalSubtitle: 'We keep your credentials encrypted and secure at all times.',
  },
  {
    id: 'quick-deposit',
    title: 'Quick deposit',
    description: 'Record a deposit',
    icon: ArrowUpCircle,
    accent: 'from-cyan-400 to-blue-500',
    submitLabel: 'Record Deposit',
    modalTitle: 'Quick Deposit',
    modalSubtitle: 'Choose where the funds are going and leave a short note.',
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
];

const actionInitialValues = {
  'link-account': {
    accountType: '',
    institution: '',
    accountNumber: '',
    nickname: '',
  },
  'quick-deposit': {
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
    bank: '',
  },
};

const accountTypeOptions = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit Card' },
];

const linkedAccountOptions = [
  { value: 'primary', label: 'Primary Account' },
  { value: 'travel', label: 'Travel Wallet' },
];

const bankOptions = [
  { value: 'guroosh', label: 'Guroosh Bank' },
  { value: 'snb', label: 'SNB' },
  { value: 'riyad', label: 'Riyad Bank' },
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

const mapId = (value) => (typeof value === 'object' && value !== null ? value._id || value.id : value);

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
  const [financialSources, setFinancialSources] = useState({
    categories: categoryOptions,
    accounts: linkedAccountOptions,
    loading: false,
    error: null
  });
  const [manualEntryState, setManualEntryState] = useState({ saving: false, error: '', success: '' });

  const addLatestUpdate = (update) => {
    setLatestUpdates((prev) =>
      [{ id: Date.now(), ...update }, ...prev].slice(0, latestUpdatesLimit)
    );
  };

  const refreshFinancialSources = useCallback(async () => {
    if (!user) {
      setFinancialSources({
        categories: categoryOptions,
        accounts: linkedAccountOptions,
        loading: false,
        error: null
      });
      return;
    }
    setFinancialSources((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [categoriesResponse, accountsResponse] = await Promise.all([
        categoryService.getCategories(),
        accountService.getAccounts()
      ]);
      const categoryList = (categoriesResponse?.data || categoriesResponse?.categories || [])
        .filter((category) => category.type !== 'income' && (category.isActive !== false && category.enabled !== false));
      const accountList = accountsResponse?.data || accountsResponse?.accounts || [];
      const mappedCategories = categoryList.map((category) => ({
        value: mapId(category),
        label: `${category.icon ? `${category.icon} ` : ''}${category.name || 'Category'}`.trim()
      }));
      const mappedAccounts = accountList
        .filter((account) => account.status !== 'inactive')
        .map((account) => ({ value: mapId(account), label: account.name || 'Account' }));
      setFinancialSources({ categories: mappedCategories, accounts: mappedAccounts, loading: false, error: null });
    } catch (error) {
      setFinancialSources({
        categories: [],
        accounts: [],
        loading: false,
        error: error.response?.data?.error || error.message || 'Failed to load categories'
      });
    }
  }, [user]);

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

  const activeFinancialData = financialStatusData[statusRange];
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

  useEffect(() => {
    refreshFinancialSources();
  }, [refreshFinancialSources]);

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};
    const handleUpdate = () => refreshFinancialSources();
    window.addEventListener('categories:updated', handleUpdate);
    window.addEventListener('accounts:updated', handleUpdate);
    return () => {
      window.removeEventListener('categories:updated', handleUpdate);
      window.removeEventListener('accounts:updated', handleUpdate);
    };
  }, [refreshFinancialSources]);

  useEffect(() => {
    if (!financialSources.categories.length) return;
    setActionValues((prev) => {
      const current = prev['manual-entry']?.category;
      const valid = financialSources.categories.some((option) => option.value === current);
      if (valid) return prev;
      const fallback = financialSources.categories[0]?.value || '';
      if (!fallback) return prev;
      return {
        ...prev,
        'manual-entry': { ...prev['manual-entry'], category: fallback }
      };
    });
  }, [financialSources.categories]);

  useEffect(() => {
    if (!financialSources.accounts.length) return;
    setActionValues((prev) => {
      const current = prev['manual-entry']?.account;
      const valid = financialSources.accounts.some((option) => option.value === current);
      if (valid) return prev;
      const fallback = financialSources.accounts[0]?.value || '';
      if (!fallback) return prev;
      return {
        ...prev,
        'manual-entry': { ...prev['manual-entry'], account: fallback }
      };
    });
  }, [financialSources.accounts]);

  const ensureManualEntryAccount = useCallback(async (preferredAccountId) => {
    if (!user) {
      return null;
    }
    if (preferredAccountId) {
      return preferredAccountId;
    }
    if (financialSources.accounts.length) {
      return financialSources.accounts[0].value;
    }
    try {
      const response = await accountService.createAccount({ name: 'Cash Wallet', type: 'cash' });
      const createdId = mapId(response?.data || response?.account);
      await refreshFinancialSources();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('accounts:updated', { detail: { createdId } }));
      }
      return createdId;
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to provision an account');
    }
  }, [financialSources.accounts, refreshFinancialSources, user]);
  const handleOpenAction = useCallback(
    (actionId) => {
      if (actionId === 'manual-entry' && user) {
        refreshFinancialSources();
      }
      setManualEntryState({ saving: false, error: '', success: '' });
      setActiveAction(actionId);
    },
    [refreshFinancialSources, user]
  );

  const handleCancelAction = (actionId) => {
    if (actionId) {
      resetActionForm(actionId);
    }
    setActiveAction(null);
    if (actionId === 'manual-entry') {
      setManualEntryState({ saving: false, error: '', success: '' });
    }
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

  const handleManualEntrySubmit = async (event) => {
    event.preventDefault();
    const data = actionValues['manual-entry'];
    const amount = parseFloat(data.amount);
    if (!data.transactionType) {
      setManualEntryState({ saving: false, error: 'Select a transaction type', success: '' });
      return;
    }
    if (!amount || amount <= 0) {
      setManualEntryState({ saving: false, error: 'Amount must be greater than zero', success: '' });
      return;
    }

    if (!user) {
      const status = data.transactionType === 'income' ? 'in' : 'out';
      const transactionLabel = `${data.transactionType.charAt(0).toUpperCase()}${data.transactionType.slice(1)}`;
      addLatestUpdate({
        merchant: data.merchant || 'Manual transaction',
        amount,
        timestamp: formatTimestamp(data.date),
        method: `${transactionLabel} • ${getOptionLabel(categoryOptions, data.category)}`,
        status,
        icon: PenSquare,
      });
      resetActionForm('manual-entry');
      setManualEntryState({ saving: false, error: '', success: '' });
      setActiveAction(null);
      return;
    }

    if (data.transactionType !== 'expense') {
      setManualEntryState({ saving: false, error: 'Only expense entries sync to budgets right now.', success: '' });
      return;
    }
    if (!data.category) {
      setManualEntryState({ saving: false, error: 'Choose a category', success: '' });
      return;
    }

    setManualEntryState({ saving: true, error: '', success: '' });
    let accountId;
    try {
      accountId = await ensureManualEntryAccount(data.account);
      if (!accountId) {
        throw new Error('No account available for this entry');
      }
    } catch (error) {
      setManualEntryState({ saving: false, error: error.message || 'Failed to prepare an account', success: '' });
      return;
    }

    try {
      await expenseService.createExpense({
        title: data.merchant?.trim() || 'Manual transaction',
        amount,
        date: data.date,
        categoryId: data.category,
        accountId,
        description: data.notes
      });
      addLatestUpdate({
        merchant: data.merchant || 'Manual transaction',
        amount,
        timestamp: formatTimestamp(data.date),
        method: `Expense • ${getOptionLabel(financialSources.categories, data.category)}`,
        status: 'out',
        icon: PenSquare
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('expenses:updated'));
      }
      resetActionForm('manual-entry');
      setManualEntryState({ saving: false, error: '', success: '' });
      setActiveAction(null);
    } catch (error) {
      setManualEntryState({
        saving: false,
        error: error.response?.data?.error || error.message || 'Failed to save expense',
        success: ''
      });
    }
  };

  const handleSubmitAction = (actionId, event) => {
    event.preventDefault();

    if (actionId === 'quick-deposit') {
      const data = actionValues['quick-deposit'];
      const amount = parseFloat(data.amount) || 0;
      addLatestUpdate({
        merchant: data.description || 'Quick deposit',
        amount,
        timestamp: formatTimestamp(data.date),
        method: `${getOptionLabel(linkedAccountOptions, data.account)} • Deposit`,
        status: 'in',
        icon: ArrowUpCircle,
      });
    }

    if (actionId === 'parse-sms') {
      const data = actionValues['parse-sms'];
      const parsed = parseSmsText(data.sms);
      addLatestUpdate({
        merchant: parsed.merchant || 'Bank SMS',
        amount: parsed.amount,
        timestamp: formatTimestamp(),
        method: `${getOptionLabel(bankOptions, data.bank)} • Parsed SMS`,
        status: parsed.isCredit ? 'in' : 'out',
        icon: MessageSquare,
      });
    }

    resetActionForm(actionId);
    setActiveAction(null);
  };

  const renderActionForm = () => {
    if (!currentAction) return null;

    switch (currentAction.id) {
      case 'link-account':
        return (
          <form
            onSubmit={(event) => handleSubmitAction('link-account', event)}
            className="space-y-4"
          >
            <SelectMenu
              label="Account Type"
              name="accountType"
              value={actionValues['link-account'].accountType}
              onChange={(event) =>
                updateActionValue('link-account', 'accountType', event.target.value)
              }
              options={accountTypeOptions}
              required
            />
            <InputField
              label="Institution Name"
              name="institution"
              value={actionValues['link-account'].institution}
              onChange={(event) =>
                updateActionValue('link-account', 'institution', event.target.value)
              }
              placeholder="e.g., Bank of America"
              required
            />
            <InputField
              label="Account Number"
              name="accountNumber"
              value={actionValues['link-account'].accountNumber}
              onChange={(event) =>
                updateActionValue('link-account', 'accountNumber', event.target.value)
              }
              placeholder="Enter account number"
              required
            />
            <p className="text-xs text-gray-500 -mt-3">
              Your account information is encrypted and secure.
            </p>
            <InputField
              label="Account Nickname (Optional)"
              name="nickname"
              value={actionValues['link-account'].nickname}
              onChange={(event) =>
                updateActionValue('link-account', 'nickname', event.target.value)
              }
              placeholder="e.g., My Main Checking"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => handleCancelAction('link-account')}
              >
                Cancel
              </Button>
              <Button type="submit">{currentAction.submitLabel}</Button>
            </div>
          </form>
        );
      case 'quick-deposit':
        return (
          <form
            onSubmit={(event) => handleSubmitAction('quick-deposit', event)}
            className="space-y-4"
          >
            <SelectMenu
              label="Deposit To"
              name="account"
              value={actionValues['quick-deposit'].account}
              onChange={(event) =>
                updateActionValue('quick-deposit', 'account', event.target.value)
              }
              options={linkedAccountOptions}
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
              placeholder="e.g., Salary deposit"
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
            onSubmit={handleManualEntrySubmit}
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
              options={user ? financialSources.accounts : linkedAccountOptions}
              required={!user || Boolean(financialSources.accounts.length)}
            />
            {user && !financialSources.accounts.length && !financialSources.loading && (
              <p className="text-xs text-amber-400 -mt-2">
                No accounts yet. We will create a cash wallet automatically the first time you submit.
              </p>
            )}
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
              options={user ? financialSources.categories : categoryOptions}
              required={!user || Boolean(financialSources.categories.length)}
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
            {manualEntryState.error && (
              <p className="text-sm text-red-400">{manualEntryState.error}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => handleCancelAction('manual-entry')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={manualEntryState.saving}>
                {manualEntryState.saving ? 'Saving…' : currentAction.submitLabel}
              </Button>
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
              label="Bank"
              name="bank"
              value={actionValues['parse-sms'].bank}
              onChange={(event) =>
                updateActionValue('parse-sms', 'bank', event.target.value)
              }
              options={bankOptions}
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
                          {formatSR(1245.9)}
                        </p>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-teal-500/10 text-teal-300 border border-teal-500/40">
                          +3.2% · 30d
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Weekly spend</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-gray-400">
                        Weekly Spend
                      </p>
                      <p className="text-2xl font-semibold text-teal-300">
                        {formatSR(0)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {heroStats.map((stat) => {
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
                            <p className="text-xl font-semibold">{formatSR(stat.amount, stat.digits)}</p>
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
                    <p className="text-2xl font-semibold text-white mt-1">{formatSR(10)}</p>
                    <p className="text-sm text-gray-400 mt-2">Transfers between my accounts</p>
                  </div>
                  <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Remaining limit
                    </p>
                    <p className="text-2xl font-semibold text-white mt-1">{formatSR(90)}</p>
                    <p className="text-sm text-gray-400 mt-2">Safe spending buffer for today</p>
                  </div>
                </div>
              </Card>

              <Card title="Latest updates">
                <div className="space-y-3">
                  {latestUpdates.map((transaction) => {
                    const Icon = transaction.icon;
                    const isCredit = transaction.status === 'in';
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/40 px-4 py-3"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-800/70 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-teal-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{transaction.merchant}</p>
                          <p className="text-xs text-gray-400">{transaction.timestamp} • {transaction.method}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-base font-semibold ${isCredit ? 'text-teal-300' : 'text-rose-300'}`}>
                            {isCredit ? '+' : '-'}{formatSR(transaction.amount)}
                          </p>
                          <p className="text-xs text-gray-500">{isCredit ? 'Incoming' : 'Outgoing'}</p>
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
                        onClick={() => handleOpenAction(action.id)}
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

              <Card title="Where did your money go?">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/30 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-400">Top merchant</p>
                  <p className="text-2xl font-semibold text-white mt-1">{spendingBreakdown.topMerchant}</p>
                  <p className="text-sm text-gray-400">{formatSR(spendingBreakdown.amount)}</p>
                </div>
                <div className="mt-5 space-y-3">
                  {spendingBreakdown.allocation.map((allocation) => (
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
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-slate-700/60 bg-slate-900/30 p-4">
                  <p className="text-xs uppercase tracking-widest text-gray-400">Category breakdown</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {spendingBreakdown.category} {spendingBreakdown.percentage}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Latest purchases were mostly telecom expenses.
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
