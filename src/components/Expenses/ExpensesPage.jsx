import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import Card from '../Shared/Card';
import FloatingActionButton from '../Shared/FloatingActionButton';
import Modal from '../Shared/Modal';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import { useAuth } from '../../context/AuthContext';
import { accountService, budgetService, categoryService, expenseService, goalService, externalDataService } from '../../services';

const colorPalette = ['#22d3ee', '#0ea5e9', '#14b8a6', '#2dd4bf', '#34d399', '#67e8f9'];

const currencyFormatter = new Intl.NumberFormat('en-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0
});

const formatSar = (value = 0) => currencyFormatter.format(Math.max(0, Number(value) || 0));
const formatShortDate = (value) => {
  if (!value) return '--';
  const safeDate = new Date(value);
  if (Number.isNaN(safeDate.getTime())) return '--';
  return safeDate.toLocaleDateString('en-SA', { month: 'short', day: 'numeric' });
};
const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

const defaultCategoriesSeed = [
  { id: 'cat-housing', name: 'Housing', enabled: true, color: colorPalette[0], icon: '🏠' },
  { id: 'cat-food', name: 'Food & Dining', enabled: true, color: colorPalette[1], icon: '🍽️' },
  { id: 'cat-transport', name: 'Transport', enabled: true, color: colorPalette[2], icon: '🚗' },
  { id: 'cat-entertainment', name: 'Entertainment', enabled: true, color: colorPalette[3], icon: '🎬' }
];

const defaultBudgetsSeed = [
  { id: 'budget-housing', categoryId: 'cat-housing', limit: 4500 },
  { id: 'budget-food', categoryId: 'cat-food', limit: 1800 },
  { id: 'budget-transport', categoryId: 'cat-transport', limit: 900 },
  { id: 'budget-entertainment', categoryId: 'cat-entertainment', limit: 600 }
];

const defaultExpensesSeed = [
  { id: 'exp-1', categoryId: 'cat-housing', amount: 3200, date: '2024-10-05', title: 'Rent' },
  { id: 'exp-2', categoryId: 'cat-food', amount: 1350, date: '2024-10-10', title: 'Groceries' },
  { id: 'exp-3', categoryId: 'cat-food', amount: 220, date: '2024-10-12', title: 'Dining out' },
  { id: 'exp-4', categoryId: 'cat-transport', amount: 420, date: '2024-10-04', title: 'Fuel' },
  { id: 'exp-5', categoryId: 'cat-entertainment', amount: 320, date: '2024-10-08', title: 'Cinema' }
];

const defaultGoalsSeed = [
  { id: 'goal-travel', name: 'Travel goal', targetAmount: 15000, savedAmount: 6200 },
  { id: 'goal-emergency', name: 'Emergency fund', targetAmount: 30000, savedAmount: 11250 }
];

const advisorPrimaryButtonClasses =
  'px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-900 shadow-lg shadow-amber-200/70 hover:shadow-amber-300/80 hover:from-amber-200 hover:to-amber-500 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:from-teal-500 dark:via-teal-500 dark:to-emerald-400 dark:text-white dark:shadow-emerald-500/30 dark:hover:from-teal-400 dark:hover:to-emerald-300 dark:focus-visible:ring-teal-400';

const advisorGhostButtonClasses =
  'px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-600/60 dark:bg-slate-800/50 dark:text-slate-100 dark:hover:border-teal-400/60 dark:hover:bg-slate-700/70 dark:focus-visible:ring-slate-500';

const advisorDangerButtonClasses =
  'px-4 py-2.5 text-sm font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 shadow-[0_8px_25px_rgba(248,113,113,0.18)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20 dark:hover:border-red-400/70 dark:shadow-[0_10px_25px_rgba(248,113,113,0.25)] dark:focus-visible:ring-red-400';

const defaultIconChoices = ['💳', '🍽️', '🏠', '🚗', '🎬', '🩺', '🎁', '🛍️'];

const mapId = (value) => {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    return value._id || value.id || value.valueOf?.();
  }
  return String(value);
};

const normalizeCategories = (list) => {
  const source = Array.isArray(list) ? list : defaultCategoriesSeed;
  return source.map((category, index) => ({
    id: mapId(category.id ?? category._id) ?? createId('cat'),
    name: category.name ?? `Category ${index + 1}`,
    enabled: category.enabled !== undefined ? category.enabled : category.isActive !== false,
    color: category.color ?? colorPalette[index % colorPalette.length],
    icon: category.icon || defaultIconChoices[index % defaultIconChoices.length],
    type: category.type || 'expense'
  }));
};

const normalizeBudgets = (list, categories = []) => {
  const source = Array.isArray(list) ? list : defaultBudgetsSeed;
  const allowedIds = new Set(categories.map((cat) => cat.id));
  return source
    .map((budget, index) => {
      const categoryId =
        mapId(budget.categoryId) ??
        mapId(budget.category?.id) ??
        categories[index]?.id ??
        null;
      if (!categoryId || !allowedIds.has(categoryId)) return null;
      const limit = Math.max(0, Number(budget.limit ?? budget.amount ?? 0));
      if (!limit) return null;
      return {
        id: mapId(budget.id ?? budget._id) ?? createId('budget'),
        categoryId,
        categoryName:
          (typeof budget.categoryId === 'object' && budget.categoryId?.name) ||
          categories.find((cat) => cat.id === categoryId)?.name ||
          'Category',
        limit,
        period: budget.period || 'monthly',
        status: budget.status || null,
        alertThreshold: budget.alertThreshold ?? 80,
        isActive: budget.isActive !== undefined ? budget.isActive : true
      };
    })
    .filter(Boolean);
};

const normalizeExpenses = (list, categories = []) => {
  const source = Array.isArray(list) ? list : defaultExpensesSeed;
  const categoryFallback = categories[0]?.id;
  return source
    .map((expense, index) => {
      const categoryId =
        mapId(expense.categoryId) ??
        mapId(expense.category?._id) ??
        categories.find((cat) => cat.name === expense.category)?.id ??
        categoryFallback;
      const amount = Math.max(0, Number(expense.amount ?? 0));
      if (!categoryId || !amount) return null;
      return {
        id: mapId(expense.id ?? expense._id) ?? createId('exp'),
        categoryId,
        amount,
        date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        title: expense.title ?? `Expense ${index + 1}`,
        description: expense.description || '',
        merchant: expense.merchant || ''
      };
    })
    .filter(Boolean);
};

const normalizeGoals = (list) => {
  const source = Array.isArray(list) ? list : defaultGoalsSeed;
  return source
    .map((goal, index) => {
      const targetAmount = Math.max(0, Number(goal.targetAmount ?? goal.target ?? 0));
      if (!targetAmount) return null;
      return {
        id: mapId(goal.id ?? goal._id) ?? createId('goal'),
        name: goal.name ?? `Goal ${index + 1}`,
        targetAmount,
        savedAmount: Math.max(0, Number(goal.savedAmount ?? goal.saved ?? 0)),
        deadline: goal.deadline ? goal.deadline.split('T')[0] : undefined,
        status: goal.status || 'active'
      };
    })
    .filter(Boolean);
};

const buildSeedStorageKey = (userId) => `expenses:seed:${userId || 'guest'}`;

const broadcastUpdate = (eventName, detail) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

function ExpensesPage() {
  const { user } = useAuth();

  const [storedCategories, setStoredCategories] = useState(() => (user ? [] : defaultCategoriesSeed));
  const [storedBudgets, setStoredBudgets] = useState(() => (user ? [] : defaultBudgetsSeed));
  const [storedExpenses, setStoredExpenses] = useState(() => (user ? [] : defaultExpensesSeed));
  const [storedGoals, setStoredGoals] = useState(() => (user ? [] : defaultGoalsSeed));
  const [accounts, setAccounts] = useState([]);
  const [centralBankData, setCentralBankData] = useState({
    status: 'idle',
    accounts: [],
    totalBalance: 0,
    error: null,
    lastSync: null
  });
  const [syncInfo, setSyncInfo] = useState({ status: user ? 'loading' : 'guest', lastSuccess: null, error: null });
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [spendModal, setSpendModal] = useState({ open: false, categoryId: null });
  const [spendForm, setSpendForm] = useState({ title: '', amount: '', date: today, accountId: '', notes: '' });
  const [spendSaving, setSpendSaving] = useState(false);
  const [spendError, setSpendError] = useState('');
  const seedStateRef = useRef({ storageKey: buildSeedStorageKey(user?._id), categories: false, goals: false });

  const loadSeedFlags = useCallback(() => {
    const storageKey = buildSeedStorageKey(user?._id);
    if (typeof window === 'undefined') {
      seedStateRef.current = { storageKey, categories: false, goals: false };
      return;
    }
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || '{}');
      seedStateRef.current = {
        storageKey,
        categories: Boolean(stored.categories),
        goals: Boolean(stored.goals)
      };
    } catch (error) {
      console.warn('Failed to parse seed flags:', error);
      seedStateRef.current = { storageKey, categories: false, goals: false };
    }
  }, [user]);

  const persistSeedFlags = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      seedStateRef.current.storageKey,
      JSON.stringify({
        categories: seedStateRef.current.categories,
        goals: seedStateRef.current.goals
      })
    );
  }, []);

  const markSeeded = useCallback(
    (type) => {
      seedStateRef.current[type] = true;
      persistSeedFlags();
    },
    [persistSeedFlags]
  );

  const shouldSeedDefaults = useCallback((type) => !seedStateRef.current[type], []);

  useEffect(() => {
    loadSeedFlags();
  }, [loadSeedFlags]);

  const categories = useMemo(() => normalizeCategories(storedCategories), [storedCategories]);
  const budgets = useMemo(() => normalizeBudgets(storedBudgets, categories), [storedBudgets, categories]);
  const expenses = useMemo(() => normalizeExpenses(storedExpenses, categories), [storedExpenses, categories]);
  const goals = useMemo(() => normalizeGoals(storedGoals), [storedGoals]);

  const activeCategoryIds = useMemo(() => {
    return new Set(categories.filter((category) => category.enabled !== false).map((category) => category.id));
  }, [categories]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('category');
  const [modalMode, setModalMode] = useState('add');
  const [modalError, setModalError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', budget: '', color: colorPalette[0], icon: defaultIconChoices[0], period: 'monthly' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', savedAmount: '', deadline: '' });
  const [modalSaving, setModalSaving] = useState(false);

  const seedDefaultCategories = useCallback(async () => {
    for (let index = 0; index < defaultCategoriesSeed.length; index += 1) {
      const template = defaultCategoriesSeed[index];
      try {
        await categoryService.createCategory({
          name: template.name,
          type: 'expense',
          color: template.color || colorPalette[index % colorPalette.length],
          icon: template.icon || defaultIconChoices[index % defaultIconChoices.length]
        });
      } catch (error) {
        const message = error?.message?.toLowerCase?.() || '';
        if (!message.includes('exists')) {
          throw error;
        }
      }
    }
    markSeeded('categories');
  }, [markSeeded]);

  const seedDefaultGoals = useCallback(async () => {
    for (const template of defaultGoalsSeed) {
      try {
        await goalService.createGoal({
          name: template.name,
          targetAmount: template.targetAmount,
          savedAmount: template.savedAmount || 0
        });
      } catch (error) {
        const message = error?.message?.toLowerCase?.() || '';
        if (!message.includes('duplicate')) {
          throw error;
        }
      }
    }
    markSeeded('goals');
  }, [markSeeded]);

  const fetchCentralBankAccounts = useCallback(async () => {
    if (!user) return;
    setCentralBankData((prev) => ({ ...prev, status: 'loading', error: null }));
    try {
      const response = await externalDataService.getCentralBankAccounts();
      setCentralBankData({
        status: 'success',
        accounts: response?.accounts || [],
        totalBalance: response?.totalBalance || 0,
        error: null,
        lastSync: new Date().toISOString()
      });
    } catch (error) {
      setCentralBankData({
        status: 'error',
        accounts: [],
        totalBalance: 0,
        error: error.response?.data?.error || error.message || 'Failed to reach Central Bank',
        lastSync: null
      });
    }
  }, [user]);

  const syncFromServer = useCallback(async () => {
    if (!user) {
      setStoredCategories(defaultCategoriesSeed);
      setStoredBudgets(defaultBudgetsSeed);
      setStoredExpenses(defaultExpensesSeed);
      setStoredGoals(defaultGoalsSeed);
      setAccounts([]);
      setSyncInfo({ status: 'guest', lastSuccess: null, error: null });
      return;
    }

    setSyncInfo((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const [categoriesResponse, budgetsResponse, expensesResponse, goalsResponse, accountsResponse] = await Promise.all([
        categoryService.getCategories(),
        budgetService.getBudgets(),
        expenseService.getExpenses(),
        goalService.getGoals(),
        accountService.getAccounts()
      ]);

      let categoryPayload = (categoriesResponse?.data || categoriesResponse?.categories || []).filter(
        (category) => category.type !== 'income'
      );
      if (!categoryPayload.length && shouldSeedDefaults('categories')) {
        await seedDefaultCategories();
        const seededCategoriesResponse = await categoryService.getCategories();
        categoryPayload = (seededCategoriesResponse?.data || seededCategoriesResponse?.categories || []).filter(
          (category) => category.type !== 'income'
        );
      }

      let goalPayload = goalsResponse?.goals || goalsResponse?.data || [];
      if (!goalPayload.length && shouldSeedDefaults('goals')) {
        await seedDefaultGoals();
        const seededGoalsResponse = await goalService.getGoals();
        goalPayload = seededGoalsResponse?.goals || seededGoalsResponse?.data || [];
      }

      setStoredCategories(categoryPayload);
      setStoredBudgets(budgetsResponse?.data || budgetsResponse?.budgets || []);
      setStoredExpenses(expensesResponse?.data || []);
      setStoredGoals(goalPayload);
      const accountPayload = (accountsResponse?.data || accountsResponse?.accounts || []).map((account) => ({
        id: mapId(account),
        name: account.name || 'Account',
        status: account.status || 'active',
        isPrimary: account.isPrimary,
        type: account.type || 'cash'
      }));
      setAccounts(accountPayload);
      broadcastUpdate('categories:updated', { count: categoryPayload.length });
      broadcastUpdate('accounts:updated', { count: accountPayload.length });

      setSyncInfo({ status: 'success', lastSuccess: new Date().toISOString(), error: null });
    } catch (err) {
      console.error('Expense sync error:', err);
      setSyncInfo((prev) => ({
        status: 'error',
        lastSuccess: prev.lastSuccess || null,
        error: err.response?.data?.error || err.message || 'Failed to sync expenses'
      }));
    }
  }, [seedDefaultCategories, seedDefaultGoals, user]);

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  useEffect(() => {
    if (!user) return;
    fetchCentralBankAccounts();
  }, [fetchCentralBankAccounts, user]);

  useEffect(() => {
    if (!accounts.length) return;
    setSpendForm((prev) => ({
      ...prev,
      accountId: accounts.find((account) => account.id === prev.accountId)?.id || accounts[0].id
    }));
  }, [accounts]);

  useEffect(() => {
    if (typeof window === 'undefined') return () => { };
    const handleRefresh = () => {
      syncFromServer();
    };
    window.addEventListener('expenses:updated', handleRefresh);
    return () => window.removeEventListener('expenses:updated', handleRefresh);
  }, [syncFromServer]);

  useEffect(() => {
    if (typeof document === 'undefined') return () => { };
    const handleVisibility = () => {
      if (!document.hidden) {
        syncFromServer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [syncFromServer]);

  const totalSpent = useMemo(
    () =>
      expenses.reduce((sum, expense) => {
        if (!activeCategoryIds.has(expense.categoryId)) return sum;
        return sum + expense.amount;
      }, 0),
    [expenses, activeCategoryIds]
  );
  const totalBudget = useMemo(
    () =>
      budgets.reduce((sum, budget) => {
        if (!activeCategoryIds.has(budget.categoryId)) return sum;
        return sum + budget.limit;
      }, 0),
    [budgets, activeCategoryIds]
  );
  const coverage = totalBudget ? Math.min((totalSpent / totalBudget) * 100, 150) : 0;

  const spentByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((expense) => {
      map[expense.categoryId] = (map[expense.categoryId] || 0) + expense.amount;
    });
    return map;
  }, [expenses]);

  const budgetByCategory = useMemo(() => {
    const map = {};
    budgets.forEach((budget) => {
      const spent = budget.status?.spent ?? spentByCategory[budget.categoryId] ?? 0;
      const percent = budget.status?.percentage ?? (budget.limit ? (spent / budget.limit) * 100 : 0);
      let state = budget.status?.state || 'idle';
      if (!budget.status) {
        if (!budget.limit) {
          state = 'idle';
        } else if (spent > budget.limit) {
          state = 'over';
        } else if (percent >= (budget.alertThreshold || 80)) {
          state = 'warning';
        } else {
          state = 'ok';
        }
      } else if (state === 'exceeded') {
        state = 'over';
      }
      map[budget.categoryId] = {
        ...budget,
        spent,
        percent,
        status: state
      };
    });
    return map;
  }, [budgets, spentByCategory]);

  const categorySummaries = useMemo(() => {
    return categories.map((category, index) => {
      const spent = spentByCategory[category.id] || 0;
      const budget = budgetByCategory[category.id];
      const limit = budget?.limit ?? 0;
      const progress = limit ? Math.min((spent / limit) * 100, 150) : 100;
      let statusLabel = `${formatSar(spent)} spent`;
      let statusTone = budget?.status ?? 'idle';
      if (limit) {
        if (spent > limit) {
          statusLabel = `Over by ${formatSar(spent - limit)}`;
          statusTone = 'over';
        } else {
          statusLabel = `${formatSar(spent)} / ${formatSar(limit)}`;
          if (statusTone === 'idle') {
            statusTone = spent / limit > 0.75 ? 'warning' : 'ok';
          }
        }
      } else {
        statusLabel = 'No budget set';
        statusTone = 'idle';
      }
      return {
        id: category.id,
        name: category.name,
        color: category.color ?? colorPalette[index % colorPalette.length],
        icon: category.icon || defaultIconChoices[index % defaultIconChoices.length],
        spent,
        limit,
        progress,
        statusLabel,
        statusTone,
        enabled: category.enabled !== false
      };
    });
  }, [categories, spentByCategory, budgetByCategory]);

  const goalsWithProgress = useMemo(() => {
    return goals.map((goal) => {
      const progress = goal.targetAmount ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100) : 0;
      return { ...goal, progress };
    });
  }, [goals]);

  const orderedCategories = useMemo(() => {
    return [...categorySummaries].sort((a, b) => {
      if (a.enabled === b.enabled) {
        return b.spent - a.spent;
      }
      return a.enabled ? -1 : 1;
    });
  }, [categorySummaries]);

  const activeCategories = useMemo(
    () => orderedCategories.filter((category) => category.enabled),
    [orderedCategories]
  );

  const spendTrend = useMemo(() => {
    const daysBack = 10;
    const today = new Date();
    return Array.from({ length: daysBack }, (_, index) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (daysBack - index - 1));
      const key = day.toISOString().split('T')[0];
      const amount = expenses
        .filter((expense) => expense.date === key && activeCategoryIds.has(expense.categoryId))
        .reduce((sum, expense) => sum + expense.amount, 0);
      return { date: key, amount };
    });
  }, [expenses, activeCategoryIds]);

  const maxTrendValue = Math.max(...spendTrend.map((point) => point.amount), 1);
  const sparklineCoords = spendTrend.length
    ? spendTrend.map((point, index) => {
      const x = (index / Math.max(spendTrend.length - 1, 1)) * 100;
      const y = 40 - (point.amount / maxTrendValue) * 40;
      return { x, y: Math.max(0, y) };
    })
    : [
      { x: 0, y: 40 },
      { x: 100, y: 40 }
    ];
  const sparklinePoints = sparklineCoords.map((point) => `${point.x},${point.y}`).join(' ');
  const sparklineAreaPath = `M ${sparklineCoords[0].x} 40 ${sparklineCoords
    .map((point) => `L ${point.x} ${point.y}`)
    .join(' ')} L ${sparklineCoords[sparklineCoords.length - 1].x} 40 Z`;
  const trendLabels = spendTrend.length
    ? [0, Math.floor(spendTrend.length / 2), spendTrend.length - 1]
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((index) => ({
        label: formatShortDate(spendTrend[index]?.date),
        x: sparklineCoords[index]?.x ?? 0
      }))
    : [{ label: formatShortDate(new Date().toISOString().split('T')[0]), x: 0 }];

  const remainingBudget = Math.max(totalBudget - totalSpent, 0);
  const goalCompletionAverage = goalsWithProgress.length
    ? Math.round(
      goalsWithProgress.reduce((sum, goal) => sum + goal.progress, 0) /
      goalsWithProgress.length
    )
    : 0;
  const cappedCoverage = Math.min(coverage, 130);

  const showcaseMetrics = [
    {
      label: 'Avg per day',
      value: formatSar(Math.max(Math.round(totalSpent / 30) || 0, 0)),
      helper: '+8% vs prev. 30d'
    },
    {
      label: 'Highest day',
      value: formatSar(Math.max(...spendTrend.map((point) => point.amount), 0)),
      helper: 'Peak this month'
    },
    {
      label: 'Goals funded',
      value: `${Math.min(goalsWithProgress.length, 9)} / ${goals.length || 1}`,
      helper: 'Active goals'
    },
    {
      label: 'Coverage ratio',
      value: `${Math.round(Math.min((totalSpent / (totalBudget || 1)) * 100, 199))}%`,
      helper: remainingBudget > 0 ? 'Under budget' : 'Over budget'
    }
  ];


  const openModal = ({ tab = 'category', mode = 'add', targetId = null } = {}) => {
    setModalTab(tab);
    setModalMode(mode);
    setModalError('');
    setEditingId(targetId);

    if (tab === 'category') {
      if (mode === 'edit' && targetId) {
        const category = categories.find((item) => item.id === targetId);
        const budget = budgetByCategory[targetId];
        setCategoryForm({
          name: category?.name ?? '',
          budget: budget?.limit ? String(budget.limit) : '',
          color: category?.color ?? colorPalette[0],
          icon: category?.icon ?? defaultIconChoices[0],
          period: budget?.period || 'monthly'
        });
      } else {
        setCategoryForm({ name: '', budget: '', color: colorPalette[0], icon: defaultIconChoices[0], period: 'monthly' });
      }
    } else {
      if (mode === 'edit' && targetId) {
        const goal = goals.find((item) => item.id === targetId);
        setGoalForm({
          name: goal?.name ?? '',
          targetAmount: goal?.targetAmount ? String(goal.targetAmount) : '',
          savedAmount: goal?.savedAmount ? String(goal.savedAmount) : '',
          deadline: goal?.deadline || ''
        });
      } else {
        setGoalForm({ name: '', targetAmount: '', savedAmount: '', deadline: '' });
      }
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
    setEditingId(null);
    setModalSaving(false);
  };

  const handleSubmitCategory = async (event) => {
    event.preventDefault();
    const trimmedName = categoryForm.name.trim();
    const limitValue = Number(categoryForm.budget);
    if (!trimmedName) {
      setModalError('Category name is required');
      return;
    }

    setModalError('');
    setModalSaving(true);

    try {
      if (!user) {
        if (limitValue && limitValue > 0 && categoryForm.period === 'custom') {
          setModalError('Custom budgets require start and end dates. Please choose weekly, monthly, or yearly.');
          setModalSaving(false);
          return;
        }
        let categoryId = editingId;
        if (modalMode === 'edit' && editingId) {
          setStoredCategories((prev) =>
            prev.map((category) =>
              category.id === editingId
                ? { ...category, name: trimmedName, color: categoryForm.color, icon: categoryForm.icon }
                : category
            )
          );
        } else {
          categoryId = createId('cat');
          setStoredCategories((prev) => [
            ...prev,
            {
              id: categoryId,
              name: trimmedName,
              color: categoryForm.color,
              icon: categoryForm.icon,
              enabled: true,
              type: 'expense'
            }
          ]);
        }

        if (categoryId) {
          setStoredBudgets((prev) => {
            const existingIndex = prev.findIndex((budget) => budget.categoryId === categoryId);
            if (limitValue && limitValue > 0) {
              const updatedBudget = {
                id: existingIndex >= 0 ? prev[existingIndex].id : createId('budget'),
                categoryId,
                categoryName: trimmedName,
                limit: limitValue,
                period: categoryForm.period || 'monthly',
                alertThreshold: prev[existingIndex]?.alertThreshold ?? 80,
                isActive: true,
                status: prev[existingIndex]?.status || null
              };
              if (existingIndex >= 0) {
                const clone = [...prev];
                clone[existingIndex] = updatedBudget;
                return clone;
              }
              return [...prev, updatedBudget];
            }
            if (existingIndex >= 0) {
              return prev.filter((budget) => budget.categoryId !== categoryId);
            }
            return prev;
          });
        }

        closeModal();
        broadcastUpdate('categories:updated');
        return;
      }

      let categoryId = editingId;
      if (modalMode === 'edit' && editingId) {
        await categoryService.updateCategory(editingId, {
          name: trimmedName,
          color: categoryForm.color,
          icon: categoryForm.icon
        });
      } else {
        const response = await categoryService.createCategory({
          name: trimmedName,
          type: 'expense',
          color: categoryForm.color,
          icon: categoryForm.icon
        });
        categoryId = mapId(response?.data) || mapId(response?.category);
      }

      if (categoryId) {
        const existingBudget = budgets.find((budget) => budget.categoryId === categoryId);
        if (limitValue && limitValue > 0) {
          if (existingBudget) {
            const payload = { limit: limitValue };
            if (categoryForm.period && categoryForm.period !== existingBudget.period) {
              payload.period = categoryForm.period;
            }
            await budgetService.updateBudget(existingBudget.id, payload);
          } else {
            if (categoryForm.period === 'custom') {
              throw new Error('Custom budgets require start and end dates. Please choose weekly, monthly, or yearly.');
            }
            await budgetService.createBudget({
              categoryId,
              limit: limitValue,
              period: categoryForm.period || 'monthly'
            });
          }
        } else if (existingBudget) {
          await budgetService.deleteBudget(existingBudget.id);
        }
      }

      await syncFromServer();
      broadcastUpdate('categories:updated');
      closeModal();
    } catch (error) {
      console.error('Save category error:', error);
      setModalError(error.response?.data?.error || error.message || 'Failed to save category');
    } finally {
      setModalSaving(false);
    }
  };

  const handleSubmitGoal = async (event) => {
    event.preventDefault();
    const trimmedName = goalForm.name.trim();
    const targetValue = Number(goalForm.targetAmount);
    const savedValue = Number(goalForm.savedAmount);
    if (!trimmedName) {
      setModalError('Goal name is required');
      return;
    }
    if (!targetValue || targetValue <= 0) {
      setModalError('Target amount must be positive');
      return;
    }
    if (goalForm.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(goalForm.deadline);
      if (deadlineDate < today) {
        setModalError('Target date cannot be in the past');
        return;
      }
    }

    setModalError('');
    setModalSaving(true);

    try {
      const payload = {
        name: trimmedName,
        targetAmount: targetValue,
        savedAmount: Math.max(0, savedValue || 0),
        deadline: goalForm.deadline || undefined
      };

      if (!user) {
        if (modalMode === 'edit' && editingId) {
          setStoredGoals((prev) =>
            prev.map((goal) => (goal.id === editingId ? { ...goal, ...payload, deadline: goalForm.deadline || '' } : goal))
          );
        } else {
          setStoredGoals((prev) => [
            ...prev,
            {
              id: createId('goal'),
              ...payload,
              deadline: goalForm.deadline || ''
            }
          ]);
        }
        closeModal();
        return;
      }

      if (modalMode === 'edit' && editingId) {
        await goalService.updateGoal(editingId, payload);
      } else {
        await goalService.createGoal(payload);
      }

      await syncFromServer();
      closeModal();
    } catch (error) {
      console.error('Save goal error:', error);
      setModalError(error.response?.data?.error || error.message || 'Failed to save goal');
    } finally {
      setModalSaving(false);
    }
  };

  const handleToggleCategory = async (categoryId) => {
    if (!user) {
      setStoredCategories((prev) =>
        prev.map((category) => {
          if (category.id !== categoryId) return category;
          const wasEnabled = category.enabled !== false;
          return { ...category, enabled: !wasEnabled };
        })
      );
      broadcastUpdate('categories:updated');
      return;
    }
    try {
      await categoryService.toggleCategory(categoryId);
      await syncFromServer();
      broadcastUpdate('categories:updated');
    } catch (error) {
      console.error('Toggle category error:', error);
      setSyncInfo((prev) => ({
        ...prev,
        status: 'error',
        error: error.response?.data?.error || error.message || 'Failed to toggle category'
      }));
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!user) {
      setStoredGoals((prev) => prev.filter((goal) => goal.id !== goalId));
      return;
    }
    try {
      await goalService.deleteGoal(goalId);
      await syncFromServer();
    } catch (error) {
      console.error('Delete goal error:', error);
      setSyncInfo((prev) => ({
        ...prev,
        status: 'error',
        error: error.response?.data?.error || error.message || 'Failed to delete goal'
      }));
    }
  };

  const handleTabChange = (tab) => {
    setModalTab(tab);
    setModalError('');
    setModalMode('add');
    setEditingId(null);
    if (tab === 'category') {
      setCategoryForm({ name: '', budget: '', color: colorPalette[0], icon: defaultIconChoices[0], period: 'monthly' });
    } else {
      setGoalForm({ name: '', targetAmount: '', savedAmount: '', deadline: '' });
    }
  };

  const ensureSpendAccountId = useCallback(async (preferredAccountId) => {
    if (!user) {
      return null;
    }
    if (preferredAccountId) {
      return preferredAccountId;
    }
    if (accounts.length) {
      return accounts[0].id;
    }
    try {
      const response = await accountService.createAccount({
        name: 'Cash Wallet',
        type: 'cash'
      });
      const createdId = mapId(response?.data || response?.account);
      await syncFromServer();
      broadcastUpdate('accounts:updated', { createdId });
      return createdId || accounts[0]?.id || '';
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to prepare a cash account');
    }
  }, [accounts, syncFromServer, user]);

  const openSpendModal = (categoryId) => {
    const category = categories.find((item) => item.id === categoryId);
    setSpendForm((prev) => ({
      ...prev,
      title: category ? `${category.name} spend` : prev.title || '',
      amount: '',
      date: today,
      accountId: accounts.find((account) => account.id === prev.accountId)?.id || accounts[0]?.id || '',
      notes: ''
    }));
    setSpendError('');
    setSpendSaving(false);
    setSpendModal({ open: true, categoryId });
  };

  const closeSpendModal = () => {
    setSpendModal({ open: false, categoryId: null });
    setSpendSaving(false);
    setSpendError('');
    setSpendForm((prev) => ({ ...prev, amount: '', notes: '', title: '', date: today }));
  };

  const handleSpendSubmit = async (event) => {
    event.preventDefault();
    if (!spendModal.categoryId) return;
    const amountValue = Number(spendForm.amount);
    if (!amountValue || amountValue <= 0) {
      setSpendError('Amount must be greater than zero');
      return;
    }

    if (!user) {
      setStoredExpenses((prev) => [
        {
          id: createId('exp'),
          categoryId: spendModal.categoryId,
          amount: amountValue,
          date: spendForm.date,
          title: spendForm.title || 'Manual spend',
          description: spendForm.notes || ''
        },
        ...prev
      ]);
      closeSpendModal();
      return;
    }
    setSpendSaving(true);
    setSpendError('');
    let accountId;
    try {
      accountId = await ensureSpendAccountId(spendForm.accountId);
      if (!accountId) {
        throw new Error('No active account available to log this spend');
      }
    } catch (error) {
      setSpendError(error.message || 'We could not prepare an account for this spend');
      setSpendSaving(false);
      return;
    }
    try {
      await expenseService.createExpense({
        title: spendForm.title?.trim() || 'Manual spend',
        amount: amountValue,
        date: spendForm.date,
        categoryId: spendModal.categoryId,
        accountId,
        description: spendForm.notes
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('expenses:updated'));
      }
      closeSpendModal();
    } catch (error) {
      console.error('Quick spend error:', error);
      setSpendError(error.response?.data?.error || error.message || 'Failed to log spend');
    } finally {
      setSpendSaving(false);
    }
  };

  const CategoryForm = (
    <form onSubmit={handleSubmitCategory} className="space-y-4">
      <InputField
        key="category-name-input"
        label="Category name"
        name="category-name"
        value={categoryForm.name}
        onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
        placeholder="e.g. Health, Groceries"
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Color</label>
          <input
            key="category-color-input"
            type="color"
            value={categoryForm.color}
            onChange={(event) => setCategoryForm((current) => ({ ...current, color: event.target.value }))}
            className="w-full h-11 rounded-xl border border-slate-200 bg-white px-2 dark:border-white/5 dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Icon</label>
          <select
            key="category-icon-select"
            value={categoryForm.icon}
            onChange={(event) => setCategoryForm((current) => ({ ...current, icon: event.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-white/5 dark:text-white"
          >
            {defaultIconChoices.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          key="category-budget-input"
          label="Budget (SAR)"
          type="number"
          min="0"
          name="category-budget"
          value={categoryForm.budget}
          onChange={(event) => setCategoryForm((current) => ({ ...current, budget: event.target.value }))}
          placeholder="Leave empty to remove budget"
        />
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Period</label>
          <select
            key="category-period-select"
            value={categoryForm.period}
            onChange={(event) => setCategoryForm((current) => ({ ...current, period: event.target.value }))}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-white/5 dark:text-white"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
      {modalError && <p className="text-sm text-red-400">{modalError}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={closeModal} disabled={modalSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={modalSaving}>
          {modalSaving ? 'Saving…' : modalMode === 'edit' ? 'Save changes' : 'Save category'}
        </Button>
      </div>
    </form>
  );

  const GoalForm = (
    <form onSubmit={handleSubmitGoal} className="space-y-4">
      <InputField
        key="goal-name-input"
        label="Goal name"
        name="goal-name"
        value={goalForm.name}
        onChange={(event) => setGoalForm((current) => ({ ...current, name: event.target.value }))}
        placeholder="e.g. New car, Travel"
        required
      />
      <InputField
        key="goal-target-input"
        label="Target (SAR)"
        type="number"
        min="1"
        name="goal-target"
        value={goalForm.targetAmount}
        onChange={(event) => setGoalForm((current) => ({ ...current, targetAmount: event.target.value }))}
        placeholder="15000"
        required
      />
      <InputField
        key="goal-deadline-input"
        label="Target date"
        type="date"
        name="goal-deadline"
        value={goalForm.deadline}
        onChange={(event) => setGoalForm((current) => ({ ...current, deadline: event.target.value }))}
      />
      <InputField
        key="goal-saved-input"
        label="Saved so far (SAR)"
        type="number"
        min="0"
        name="goal-saved"
        value={goalForm.savedAmount}
        onChange={(event) => setGoalForm((current) => ({ ...current, savedAmount: event.target.value }))}
        placeholder="2000"
      />
      {modalError && <p className="text-sm text-red-400">{modalError}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={closeModal} disabled={modalSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={modalSaving}>
          {modalSaving ? 'Saving…' : modalMode === 'edit' ? 'Save changes' : 'Save goal'}
        </Button>
      </div>
    </form>
  );

  // Show full-page spinner while initial data is loading
  if (user && syncInfo.status === 'loading' && !syncInfo.lastSuccess) {
    return (
      <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100 pt-16 lg:pt-20">
        <Sidebar />
        <main className="flex-1 lg:ml-64 relative">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-teal-500/20 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-teal-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-12 h-12 bg-teal-500/10 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-400 text-sm animate-pulse">Loading expenses...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100 pt-16 lg:pt-20">
      <Sidebar />
      <main className="flex-1 lg:ml-64 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white dark:from-slate-900 dark:via-slate-900/70 dark:to-slate-900" aria-hidden />
        <div className="absolute -top-28 right-0 w-80 h-80 bg-emerald-400/20 blur-[140px] dark:bg-emerald-400/15" aria-hidden />
        <div className="absolute top-1/3 -left-28 w-72 h-72 bg-cyan-400/10 blur-[160px] dark:bg-cyan-500/10" aria-hidden />
        <div className="relative w-full max-w-[1700px] px-4 sm:px-8 lg:px-12 py-10 space-y-8">
          <div className="space-y-1">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">Spending</p>
            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="text-slate-800 font-medium dark:text-white">Total spent</span>
              <span>This month</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {!user ? (
                <span>Sign in to sync your secure expense data.</span>
              ) : syncInfo.status === 'loading' ? (
                <span>Syncing expenses from backend…</span>
              ) : syncInfo.status === 'error' ? (
                <span className="text-red-400">{syncInfo.error}</span>
              ) : syncInfo.lastSuccess ? (
                <span>Last synced {new Date(syncInfo.lastSuccess).toLocaleTimeString()}</span>
              ) : (
                <span>Using locally cached data.</span>
              )}
              <button
                type="button"
                onClick={syncFromServer}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                disabled={!user || syncInfo.status === 'loading'}
              >
                {syncInfo.status === 'loading' ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr] items-start">
            <div className="space-y-6">
              <Card className="rounded-3xl lg:p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Total spent · This month</p>
                    <p className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white">{formatSar(totalSpent)}</p>
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300/80">30d ▲ 3.9%</p>
                  </div>
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 120 120" className="w-full h-full">
                      <circle cx="60" cy="60" r="52" stroke="#22323a" strokeWidth="10" fill="none" />
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        stroke="#7ed3c5"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${Math.min(cappedCoverage, 100) * 3.27} 999`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                      <text x="60" y="60" textAnchor="middle" fill="#f8fafc" fontSize="20" dy="7">
                        {Math.round(Math.min(cappedCoverage, 100))}%
                      </text>
                    </svg>
                  </div>
                </div>
                <div className="mt-8 grid gap-4 lg:grid-cols-[1.8fr,1fr]">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-300">
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span>30d trend</span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {remainingBudget > 0 ? `${formatSar(remainingBudget)} left` : 'Over budget'}
                      </span>
                    </div>
                    <div className="relative h-32">
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#8cd6ca" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#031014" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <g>
                          {[0, 20, 40, 60, 80, 100].map((y) => (
                            <line key={y} x1="0" x2="100" y1={y / 2} y2={y / 2} stroke="rgba(148,163,184,0.4)" strokeWidth="0.5" />
                          ))}
                          <path d={sparklineAreaPath} fill="url(#trendFill)" stroke="none" opacity="0.6" />
                          <polyline
                            fill="none"
                            stroke="#8cd6ca"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            points={sparklinePoints}
                          />
                          {sparklineCoords.map((point, index) => (
                            <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="0.8" fill="#8cd6ca" />
                          ))}
                        </g>
                      </svg>
                      <div className="absolute inset-x-0 bottom-1 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        {trendLabels.map((label) => (
                          <span key={label.label} style={{ transform: `translateX(calc(${label.x}% - 12px))` }}>
                            {label.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {showcaseMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-white"
                      >
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">{metric.label}</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-300/80">{metric.helper}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <Card className="rounded-3xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Goals</p>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Saving progress</h3>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{goalCompletionAverage}% average</span>
                </div>
                <div className="mt-6 space-y-4">
                  {goalsWithProgress.map((goal) => (
                    <div
                      key={goal.id}
                      className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 space-y-4 text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{goal.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Target: {formatSar(goal.targetAmount)} · Saved: {formatSar(goal.savedAmount)} · Remaining{' '}
                            {formatSar(Math.max(goal.targetAmount - goal.savedAmount, 0))}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{Math.round(goal.progress)}%</span>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              className="text-xs px-3 py-1"
                              onClick={() => openModal({ tab: 'goal', mode: 'edit', targetId: goal.id })}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              disabled={!user}
                              className="text-xs px-3 py-1"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 dark:from-[#8bd7c8] dark:to-[#2dd4bf]"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {goalsWithProgress.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No goals yet. Use the yellow button to create one.</p>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-3xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Categories</p>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">This month</h3>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{activeCategories.length} active</span>
                </div>
                <div className="mt-6 space-y-4">
                  {orderedCategories.map((category) => {
                    return (
                      <div
                        key={category.id}
                        className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 space-y-4 text-slate-700 dark:border-slate-700/60 dark:bg-slate-900/40 dark:text-slate-200"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div
                              className="w-14 h-14 rounded-2xl border border-slate-200/80 bg-slate-50 text-2xl flex items-center justify-center dark:border-slate-700/60 dark:bg-slate-800/70"
                              style={{
                                color: category.color,
                                borderColor: `${category.color}33`,
                                backgroundColor: `${category.color}1a`
                              }}
                              aria-hidden="true"
                            >
                              <span className="leading-none" role="img">
                                {category.icon}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{category.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {category.limit ? `budget ${formatSar(category.limit)}` : 'No budget set'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatSar(category.spent)}</p>
                            {category.statusTone === 'over' ? (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-[#51201b] dark:text-[#f8b4a0]">
                                over by {formatSar(category.spent - (category.limit || 0))}
                              </span>
                            ) : (
                              category.limit ? (
                                <span className="text-xs text-slate-500 dark:text-slate-400">{category.statusLabel}</span>
                              ) : null
                            )}
                            {!category.enabled && (
                              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                                Disabled
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(category.progress, 100)}%`,
                              background:
                                category.statusTone === 'over'
                                  ? 'linear-gradient(90deg,#f87171,#fb923c)'
                                  : category.statusTone === 'warning'
                                    ? 'linear-gradient(90deg,#fcd34d,#fbbf24)'
                                    : 'linear-gradient(90deg,#34d399,#22d3ee)'
                            }}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={`${advisorGhostButtonClasses} text-xs px-3 py-2`}
                            onClick={() => openSpendModal(category.id)}
                          >
                            Log spend
                          </button>
                          <button
                            type="button"
                            className={`${advisorPrimaryButtonClasses} text-xs px-3 py-2`}
                            onClick={() => openModal({ tab: 'category', mode: 'edit', targetId: category.id })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={`text-xs px-3 py-2 ${category.enabled ? advisorDangerButtonClasses : advisorGhostButtonClasses
                              } ${category.enabled
                                ? ''
                                : 'text-emerald-700 border-emerald-200 hover:border-emerald-300 dark:text-emerald-300 dark:border-emerald-500/40'
                              }`}
                            onClick={() => handleToggleCategory(category.id)}
                          >
                            {category.enabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {orderedCategories.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No categories yet. Use the yellow button to add one.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <FloatingActionButton onClick={() => openModal({ tab: modalTab, mode: 'add' })} />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Edit item' : 'Add item'}
        subtitle="Manage categories or goals"
      >
        {modalMode === 'add' ? (
          <div className="bg-slate-100 rounded-full p-1 flex mb-6 border border-slate-200 dark:bg-[#1b2d36] dark:border-white/5">
            {['category', 'goal'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${modalTab === tab
                    ? 'bg-amber-100 text-amber-900 dark:bg-[#8bd7c8] dark:text-slate-900'
                    : 'text-slate-500 dark:text-slate-200'
                  }`}
              >
                {tab === 'category' ? 'Category' : 'Goal'}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-white/10 dark:bg-[#0f1e26] dark:text-slate-200">
            {modalTab === 'category' ? 'Category' : 'Goal'}
          </div>
        )}
        {modalTab === 'category' ? CategoryForm : GoalForm}
      </Modal>

      <Modal
        isOpen={spendModal.open}
        onClose={closeSpendModal}
        title="Log spend"
        subtitle="Update a category's tracked spending by logging a quick transaction"
      >
        <form className="space-y-4" onSubmit={handleSpendSubmit}>
          <InputField
            key="spend-title-input"
            label="Title"
            name="spend-title"
            value={spendForm.title}
            onChange={(event) => setSpendForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="e.g., Pharmacy run"
            required
          />
          <InputField
            key="spend-amount-input"
            label="Amount (SAR)"
            type="number"
            min="0"
            step="0.01"
            name="spend-amount"
            value={spendForm.amount}
            onChange={(event) => setSpendForm((prev) => ({ ...prev, amount: event.target.value }))}
            required
          />
          <InputField
            key="spend-date-input"
            label="Date"
            type="date"
            name="spend-date"
            value={spendForm.date}
            onChange={(event) => setSpendForm((prev) => ({ ...prev, date: event.target.value }))}
            required
          />
          {user && (
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Account</label>
              {accounts.length ? (
                <select
                  key="spend-account-select"
                  value={spendForm.accountId}
                  onChange={(event) => setSpendForm((prev) => ({ ...prev, accountId: event.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-white/5 dark:text-white"
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-amber-500">
                  No accounts yet — we will spin up a cash wallet automatically on your first log.
                </p>
              )}
            </div>
          )}
          <InputField
            key="spend-notes-input"
            label="Notes"
            name="spend-notes"
            value={spendForm.notes}
            onChange={(event) => setSpendForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Optional context"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Spent totals are calculated from logged expenses. Use this quick entry to keep your categories in sync without
            leaving the page.
          </p>
          {spendError && <p className="text-sm text-red-400">{spendError}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeSpendModal} disabled={spendSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={spendSaving}>
              {spendSaving ? 'Saving…' : 'Save entry'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ExpensesPage;
