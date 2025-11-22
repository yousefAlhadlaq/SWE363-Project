import React, { useMemo, useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import Card from '../Shared/Card';
import FloatingActionButton from '../Shared/FloatingActionButton';
import Modal from '../Shared/Modal';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import useLocalStorage from '../../hooks/useLocalStorage';

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
  { id: 'cat-housing', name: 'Housing', enabled: true, color: colorPalette[0] },
  { id: 'cat-food', name: 'Food & Dining', enabled: true, color: colorPalette[1] },
  { id: 'cat-transport', name: 'Transport', enabled: true, color: colorPalette[2] },
  { id: 'cat-entertainment', name: 'Entertainment', enabled: true, color: colorPalette[3] }
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
  'px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:from-teal-400 hover:to-emerald-300 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400';

const advisorGhostButtonClasses =
  'px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-600/60 bg-slate-800/50 text-slate-100 hover:border-teal-400/60 hover:bg-slate-700/70 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500';

const advisorDangerButtonClasses =
  'px-4 py-2.5 text-sm font-semibold rounded-lg border border-red-500/50 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:border-red-400/70 shadow-[0_10px_25px_rgba(248,113,113,0.25)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400';

const normalizeCategories = (list = []) => {
  const source = Array.isArray(list) && list.length ? list : defaultCategoriesSeed;
  return source.map((category, index) => ({
    id: category.id ?? createId('cat'),
    name: category.name ?? `Category ${index + 1}`,
    enabled: category.enabled !== false,
    color: category.color ?? colorPalette[index % colorPalette.length],
    manualSpent:
      typeof category.manualSpent === 'number' && !Number.isNaN(category.manualSpent)
        ? Math.max(0, category.manualSpent)
        : undefined
  }));
};

const normalizeBudgets = (list = [], categories = []) => {
  const source = Array.isArray(list) && list.length ? list : defaultBudgetsSeed;
  const allowedIds = new Set(categories.map((cat) => cat.id));
  return source
    .map((budget, index) => {
      const categoryId = budget.categoryId ?? categories[index]?.id;
      if (!categoryId || !allowedIds.has(categoryId)) return null;
      const limit = Math.max(0, Number(budget.limit ?? budget.amount ?? 0));
      if (!limit) return null;
      return {
        id: budget.id ?? createId('budget'),
        categoryId,
        limit
      };
    })
    .filter(Boolean);
};

const normalizeExpenses = (list = [], categories = []) => {
  const source = Array.isArray(list) && list.length ? list : defaultExpensesSeed;
  const categoryFallback = categories[0]?.id;
  return source
    .map((expense, index) => {
      const categoryId =
        expense.categoryId ??
        categories.find((cat) => cat.name === expense.category)?.id ??
        categoryFallback;
      const amount = Math.max(0, Number(expense.amount ?? 0));
      if (!categoryId || !amount) return null;
      return {
        id: expense.id ?? createId('exp'),
        categoryId,
        amount,
        date: expense.date ?? new Date().toISOString().split('T')[0],
        title: expense.title ?? `Expense ${index + 1}`
      };
    })
    .filter(Boolean);
};

const normalizeGoals = (list = []) => {
  const source = Array.isArray(list) && list.length ? list : defaultGoalsSeed;
  return source
    .map((goal, index) => {
      const targetAmount = Math.max(0, Number(goal.targetAmount ?? goal.target ?? 0));
      if (!targetAmount) return null;
      return {
        id: goal.id ?? createId('goal'),
        name: goal.name ?? `Goal ${index + 1}`,
        targetAmount,
        savedAmount: Math.max(0, Number(goal.savedAmount ?? goal.saved ?? 0))
      };
    })
    .filter(Boolean);
};

function ExpensesPage() {
  const [storedCategories, setStoredCategories] = useLocalStorage('qu_categories', defaultCategoriesSeed);
  const [storedBudgets, setStoredBudgets] = useLocalStorage('qu_budgets', defaultBudgetsSeed);
  const [storedExpenses] = useLocalStorage('qu_expenses', defaultExpensesSeed);
  const [storedGoals, setStoredGoals] = useLocalStorage('qu_goals', defaultGoalsSeed);

  const categories = useMemo(() => normalizeCategories(storedCategories), [storedCategories]);
  const budgets = useMemo(() => normalizeBudgets(storedBudgets, categories), [storedBudgets, categories]);
  const expenses = useMemo(() => normalizeExpenses(storedExpenses, categories), [storedExpenses, categories]);
  const goals = useMemo(() => normalizeGoals(storedGoals), [storedGoals]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('category');
  const [modalMode, setModalMode] = useState('add');
  const [modalError, setModalError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', budget: '', spent: '' });
  const [goalForm, setGoalForm] = useState({ name: '', targetAmount: '', savedAmount: '' });

  const updateCategories = (updater) => {
    setStoredCategories((prev) => {
      const normalized = normalizeCategories(prev);
      return typeof updater === 'function' ? updater(normalized) : updater;
    });
  };

  const updateBudgets = (updater) => {
    setStoredBudgets((prev) => {
      const normalized = normalizeBudgets(prev, categories);
      return typeof updater === 'function' ? updater(normalized) : updater;
    });
  };

  const updateGoals = (updater) => {
    setStoredGoals((prev) => {
      const normalized = normalizeGoals(prev);
      return typeof updater === 'function' ? updater(normalized) : updater;
    });
  };

  const totalSpent = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);
  const totalBudget = useMemo(() => budgets.reduce((sum, budget) => sum + budget.limit, 0), [budgets]);
  const coverage = totalBudget ? Math.min((totalSpent / totalBudget) * 100, 150) : 0;

  const budgetByCategory = useMemo(() => {
    const map = {};
    budgets.forEach((budget) => {
      map[budget.categoryId] = budget;
    });
    return map;
  }, [budgets]);

  const spentByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((expense) => {
      map[expense.categoryId] = (map[expense.categoryId] || 0) + expense.amount;
    });
    return map;
  }, [expenses]);

  const categorySummaries = useMemo(() => {
    return categories.map((category, index) => {
      const manualOverride =
        typeof category.manualSpent === 'number' && !Number.isNaN(category.manualSpent)
          ? category.manualSpent
          : null;
      const spent = manualOverride !== null ? manualOverride : spentByCategory[category.id] || 0;
      const budget = budgetByCategory[category.id];
      const limit = budget?.limit ?? 0;
      const progress = limit ? Math.min((spent / limit) * 100, 150) : 100;
      let statusLabel = `${formatSar(spent)} spent`;
      let statusTone = 'ok';
      if (limit) {
        if (spent > limit) {
          statusLabel = `Over by ${formatSar(spent - limit)}`;
          statusTone = 'over';
        } else {
          statusLabel = `${formatSar(spent)} / ${formatSar(limit)}`;
          statusTone = spent / limit > 0.75 ? 'warning' : 'ok';
        }
      } else {
        statusLabel = 'No budget set';
        statusTone = 'idle';
      }
      return {
        id: category.id,
        name: category.name,
        color: category.color ?? colorPalette[index % colorPalette.length],
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
        .filter((expense) => expense.date === key)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return { date: key, amount };
    });
  }, [expenses]);

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
          spent:
            category && typeof category.manualSpent === 'number'
              ? String(category.manualSpent)
              : spentByCategory[targetId]
              ? String(spentByCategory[targetId])
              : ''
        });
      } else {
        setCategoryForm({ name: '', budget: '', spent: '' });
      }
    } else {
      if (mode === 'edit' && targetId) {
        const goal = goals.find((item) => item.id === targetId);
        setGoalForm({
          name: goal?.name ?? '',
          targetAmount: goal?.targetAmount ? String(goal.targetAmount) : '',
          savedAmount: goal?.savedAmount ? String(goal.savedAmount) : ''
        });
      } else {
        setGoalForm({ name: '', targetAmount: '', savedAmount: '' });
      }
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError('');
    setEditingId(null);
  };

  const handleSubmitCategory = (event) => {
    event.preventDefault();
    const trimmedName = categoryForm.name.trim();
    const limitValue = Number(categoryForm.budget);
    const manualSpentValue = (() => {
      if (categoryForm.spent === '' || categoryForm.spent === null || categoryForm.spent === undefined) {
        return null;
      }
      const parsed = Number(categoryForm.spent);
      if (Number.isNaN(parsed) || parsed < 0) {
        return null;
      }
      return parsed;
    })();
    if (!trimmedName) {
      setModalError('Category name is required');
      return;
    }

    let newCategoryId = editingId;

    updateCategories((prev) => {
      if (modalMode === 'edit' && editingId) {
        return prev.map((category) => {
          if (category.id !== editingId) return category;
          const updated = { ...category, name: trimmedName };
          if (manualSpentValue === null) {
            delete updated.manualSpent;
          } else {
            updated.manualSpent = manualSpentValue;
          }
          return updated;
        });
      }
      newCategoryId = createId('cat');
      const colorIndex = prev.length % colorPalette.length;
      const nextCategory = {
        id: newCategoryId,
        name: trimmedName,
        enabled: true,
        color: colorPalette[colorIndex]
      };
      if (manualSpentValue !== null) {
        nextCategory.manualSpent = manualSpentValue;
      }
      return [...prev, nextCategory];
    });

    updateBudgets((prev) => {
      const targetCategoryId = modalMode === 'edit' ? editingId : newCategoryId;
      if (!targetCategoryId) return prev;

      if (!limitValue) {
        return prev.filter((budget) => budget.categoryId !== targetCategoryId);
      }

      const existing = prev.some((budget) => budget.categoryId === targetCategoryId);
      if (existing) {
        return prev.map((budget) =>
          budget.categoryId === targetCategoryId ? { ...budget, limit: limitValue } : budget
        );
      }
      return [...prev, { id: createId('budget'), categoryId: targetCategoryId, limit: limitValue }];
    });

    closeModal();
  };

  const handleSubmitGoal = (event) => {
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

    updateGoals((prev) => {
      if (modalMode === 'edit' && editingId) {
        return prev.map((goal) =>
          goal.id === editingId
            ? {
                ...goal,
                name: trimmedName,
                targetAmount: targetValue,
                savedAmount: Math.max(0, savedValue || 0)
              }
            : goal
        );
      }
      return [
        ...prev,
        {
          id: createId('goal'),
          name: trimmedName,
          targetAmount: targetValue,
          savedAmount: Math.max(0, savedValue || 0)
        }
      ];
    });

    closeModal();
  };

  const handleToggleCategory = (categoryId) => {
    updateCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, enabled: !category.enabled } : category
      )
    );
  };

  const handleDeleteGoal = (goalId) => {
    updateGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const handleTabChange = (tab) => {
    setModalTab(tab);
    setModalError('');
    setModalMode('add');
    setEditingId(null);
    if (tab === 'category') {
      setCategoryForm({ name: '', budget: '', spent: '' });
    } else {
      setGoalForm({ name: '', targetAmount: '', savedAmount: '' });
    }
  };

  const CategoryForm = (
    <form onSubmit={handleSubmitCategory} className="space-y-4">
      <InputField
        label="Category name"
        name="category-name"
        value={categoryForm.name}
        onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
        placeholder="e.g. Health, Groceries"
        required
      />
      <InputField
        label="Budget (SAR)"
        type="number"
        min="0"
        name="category-budget"
        value={categoryForm.budget}
        onChange={(event) => setCategoryForm((current) => ({ ...current, budget: event.target.value }))}
        placeholder="Enter a limit"
      />
      <InputField
        label="Spent (SAR)"
        type="number"
        min="0"
        name="category-spent"
        value={categoryForm.spent}
        onChange={(event) => setCategoryForm((current) => ({ ...current, spent: event.target.value }))}
        placeholder="Enter spent amount for showcase"
      />
      {modalError && <p className="text-sm text-red-400">{modalError}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit">{modalMode === 'edit' ? 'Save changes' : 'Save category'}</Button>
      </div>
    </form>
  );

  const GoalForm = (
    <form onSubmit={handleSubmitGoal} className="space-y-4">
      <InputField
        label="Goal name"
        name="goal-name"
        value={goalForm.name}
        onChange={(event) => setGoalForm((current) => ({ ...current, name: event.target.value }))}
        placeholder="e.g. New car, Travel"
        required
      />
      <InputField
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
        <Button type="button" variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit">{modalMode === 'edit' ? 'Save changes' : 'Save goal'}</Button>
      </div>
    </form>
  );

  return (
    <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100 pt-20">
      <Sidebar />
      <main className="flex-1 ml-64 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white dark:from-slate-900 dark:via-slate-900/70 dark:to-slate-900" aria-hidden />
    <div className="absolute -top-28 right-0 w-80 h-80 bg-emerald-400/20 blur-[140px] dark:bg-emerald-400/15" aria-hidden />
    <div className="absolute top-1/3 -left-28 w-72 h-72 bg-cyan-400/10 blur-[160px] dark:bg-cyan-500/10" aria-hidden />
  <div className="relative w-full max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-8">
          <div className="space-y-1">
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">Spending</p>
            <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="text-slate-800 font-medium dark:text-white">Total spent</span>
              <span>This month</span>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr] items-start">
            <div className="space-y-6">
              <Card className="rounded-xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-sm p-6 lg:p-8 shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <p className="text-sm text-slate-300">Total spent · This month</p>
                    <p className="mt-2 text-4xl font-semibold text-white">{formatSar(totalSpent)}</p>
                    <p className="mt-2 text-xs text-emerald-300/80">30d ▲ 3.9%</p>
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
                  <div className="rounded-xl bg-slate-900/40 border border-slate-700/60 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <span>30d trend</span>
                      <span>{remainingBudget > 0 ? `${formatSar(remainingBudget)} left` : 'Over budget'}</span>
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
                            <line key={y} x1="0" x2="100" y1={y / 2} y2={y / 2} stroke="#142228" strokeWidth="0.5" />
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
                      <div className="absolute inset-x-0 bottom-1 flex justify-between text-[10px] text-slate-500">
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
                      <div key={metric.label} className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                        <p className="mt-2 text-xl font-semibold text-white">{metric.value}</p>
                        <p className="text-xs text-emerald-300/80">{metric.helper}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <Card className="rounded-xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-sm p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Goals</p>
                    <h3 className="text-2xl font-semibold text-white">Saving progress</h3>
                  </div>
                  <span className="text-sm text-slate-400">{goalCompletionAverage}% average</span>
                </div>
                <div className="mt-6 space-y-4">
                  {goalsWithProgress.map((goal) => (
                    <div key={goal.id} className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-white">{goal.name}</p>
                          <p className="text-xs text-slate-400">
                            Target: {formatSar(goal.targetAmount)} · Saved: {formatSar(goal.savedAmount)} · Remaining:{' '}
                            {formatSar(Math.max(goal.targetAmount - goal.savedAmount, 0))}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-white">{Math.round(goal.progress)}%</span>
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
                              className="text-xs px-3 py-1"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-[#1f2c31] overflow-hidden">
                        <div className="h-full bg-[#8bd7c8]" style={{ width: `${goal.progress}%` }} />
                      </div>
                    </div>
                  ))}
                  {goalsWithProgress.length === 0 && (
                    <p className="text-sm text-slate-400">No goals yet. Use the yellow button to create one.</p>
                  )}
                </div>
              </Card>
            </div>

            <Card className="rounded-xl border border-slate-700/50 bg-slate-800/95 backdrop-blur-sm p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Categories</p>
                  <h3 className="text-2xl font-semibold text-white">This month</h3>
                </div>
                <span className="text-sm text-slate-400">{activeCategories.length} active</span>
              </div>
              <div className="mt-6 space-y-4">
                {orderedCategories.map((category, index) => {
                  const showcaseNumber = String(index + 1).padStart(2, '0');
                  return (
                    <div key={category.id} className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl border border-slate-700/60 bg-slate-800/70 text-slate-200 font-semibold tracking-[0.3em] flex items-center justify-center text-sm">
                            {showcaseNumber}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{category.name}</p>
                            <p className="text-xs text-slate-400">
                              {category.limit ? `budget ${formatSar(category.limit)}` : 'No budget set'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-lg font-semibold text-white">{formatSar(category.spent)}</p>
                          {category.statusTone === 'over' ? (
                            <span className="inline-flex items-center rounded-full bg-[#51201b] px-2 py-0.5 text-xs font-semibold text-[#f8b4a0]">
                              over by {formatSar(category.spent - (category.limit || 0))}
                            </span>
                          ) : (
                            category.limit ? <span className="text-xs text-slate-500">{category.statusLabel}</span> : null
                          )}
                          {!category.enabled && (
                            <span className="inline-flex items-center rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-200">
                              Disabled
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800/70 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(category.progress, 100)}%`,
                            backgroundColor:
                              category.statusTone === 'over'
                                ? '#f88379'
                                : category.statusTone === 'warning'
                                ? '#fbbf24'
                                : '#8bd7c8'
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`${advisorPrimaryButtonClasses} text-xs px-3 py-2`}
                          onClick={() => openModal({ tab: 'category', mode: 'edit', targetId: category.id })}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`text-xs px-3 py-2 ${
                            category.enabled ? advisorDangerButtonClasses : advisorGhostButtonClasses
                          } ${category.enabled ? '' : 'text-emerald-300 border-emerald-500/40 hover:border-emerald-300/70'}`}
                          onClick={() => handleToggleCategory(category.id)}
                        >
                          {category.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {orderedCategories.length === 0 && (
                  <p className="text-sm text-slate-400">No categories yet. Use the yellow button to add one.</p>
                )}
              </div>
            </Card>
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
          <div className="bg-[#1b2d36] rounded-full p-1 flex mb-6 border border-white/5">
            {['category', 'goal'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                  modalTab === tab ? 'bg-[#8bd7c8] text-slate-900' : 'text-slate-200'
                }`}
              >
                {tab === 'category' ? 'Category' : 'Goal'}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-[#0f1e26] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200">
            {modalTab === 'category' ? 'Category' : 'Goal'}
          </div>
        )}
        {modalTab === 'category' ? CategoryForm : GoalForm}
      </Modal>
    </div>
  );
}

export default ExpensesPage;
