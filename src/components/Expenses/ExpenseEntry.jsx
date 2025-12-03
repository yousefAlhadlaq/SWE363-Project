import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PlusCircle, RefreshCw, Wallet } from 'lucide-react';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import { accountService, budgetService, categoryService, expenseService } from '../../services';

const colorPalette = ['#22d3ee', '#0ea5e9', '#14b8a6', '#2dd4bf', '#34d399', '#67e8f9'];

const currencyFormatter = new Intl.NumberFormat('en-SA', {
  style: 'currency',
  currency: 'SAR',
  maximumFractionDigits: 0
});

const mapId = (value) => (typeof value === 'object' && value !== null ? value._id || value.id : value);

function ExpenseEntry({ onDataRefresh }) {
  const today = new Date().toISOString().split('T')[0];
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', date: today, categoryId: '', accountId: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [syncState, setSyncState] = useState({ status: 'loading', error: null });
  const [showAccountField, setShowAccountField] = useState(false);
  const [showCategoryField, setShowCategoryField] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const broadcastUpdate = useCallback((name) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(name));
    }
  }, []);

  const normalizeCategories = useCallback((fetched = []) => (
    fetched.map((category, index) => ({
      id: mapId(category),
      name: category.name,
      color: category.color || colorPalette[index % colorPalette.length],
      icon: category.icon || '💸',
      enabled: category.enabled !== false && category.isActive !== false,
      type: category.type || 'expense'
    }))
  ), []);

  const fetchCategories = useCallback(async () => {
    const response = await categoryService.getCategories();
    const normalized = normalizeCategories(response?.data || response?.categories || []);
    setCategories(normalized);
    return normalized;
  }, [normalizeCategories]);

  const fetchAccounts = useCallback(async () => {
    const response = await accountService.getAccounts();
    const list = Array.isArray(response?.data) ? response.data : response?.accounts || [];
    const mapped = list.map((account) => ({
      id: mapId(account),
      name: account.name,
      status: account.status,
      type: account.type,
      isPrimary: account.isPrimary
    }));
    setAccounts(mapped);
    return mapped;
  }, []);

  const fetchExpenses = useCallback(async () => {
    const response = await expenseService.getExpenses();
    const list = Array.isArray(response?.data) ? response.data : [];
    setExpenses(list);
    return list;
  }, []);

  const fetchBudgets = useCallback(async () => {
    const response = await budgetService.getBudgets();
    const list = Array.isArray(response?.data) ? response.data : [];
    setBudgets(list);
    return list;
  }, []);

  const notifyParent = useCallback(() => {
    if (typeof onDataRefresh === 'function') {
      onDataRefresh();
    }
  }, [onDataRefresh]);

  const refreshAll = useCallback(async () => {
    setSyncState({ status: 'loading', error: null });
    try {
      await Promise.all([fetchCategories(), fetchAccounts(), fetchExpenses(), fetchBudgets()]);
      setSyncState({ status: 'success', error: null });
    } catch (error) {
      console.error('Expense entry sync error:', error);
      setSyncState({ status: 'error', error: error.message || 'Failed to sync data' });
    }
  }, [fetchAccounts, fetchBudgets, fetchCategories, fetchExpenses]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const activeCategories = useMemo(
    () => categories.filter((category) => category.enabled && category.type !== 'income'),
    [categories]
  );

  useEffect(() => {
    if (!activeCategories.length) return;
    setForm((prev) => ({
      ...prev,
      categoryId: activeCategories.find((category) => category.id === prev.categoryId)?.id || activeCategories[0].id
    }));
  }, [activeCategories]);

  useEffect(() => {
    if (!accounts.length) {
      setShowAccountField(true);
      return;
    }
    setForm((prev) => ({
      ...prev,
      accountId: accounts.find((account) => account.id === prev.accountId)?.id || accounts[0].id
    }));
  }, [accounts]);

  const validateForm = () => {
    const nextErrors = {};
    if (!form.title.trim()) {
      nextErrors.title = 'Title is required';
    }
    const amount = Number(form.amount);
    if (!amount || amount <= 0) {
      nextErrors.amount = 'Amount must be positive';
    }
    if (!form.categoryId) {
      nextErrors.categoryId = 'Choose a category';
    }
    if (!form.accountId) {
      nextErrors.accountId = 'Create an account before saving';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const budgetLookup = useMemo(() => {
    const map = {};
    budgets.forEach((budget) => {
      map[budget._id || budget.id] = budget;
    });
    return map;
  }, [budgets]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        amount: Number(form.amount),
        date: form.date,
        categoryId: form.categoryId,
        accountId: form.accountId,
        description: form.notes
      };
      const response = await expenseService.createExpense(payload);
      const [updatedExpenses, updatedBudgets, updatedAccounts] = await Promise.all([
        fetchExpenses(),
        fetchBudgets(),
        fetchAccounts()
      ]);
      setExpenses(updatedExpenses);
      setBudgets(updatedBudgets);
      setAccounts(updatedAccounts);

      let message = response?.message || 'Expense saved successfully';
      if (Array.isArray(response?.budgets) && response.budgets.length) {
        const alerts = response.budgets
          .filter((entry) => entry.state && entry.state !== 'ok')
          .map((entry) => {
            const context = budgetLookup[entry.budgetId] || updatedBudgets.find((budget) => mapId(budget) === entry.budgetId);
            const categoryName = context?.categoryId?.name || 'Budget';
            return `${categoryName} is ${entry.state} (${entry.percentage}% used)`;
          });
        if (alerts.length) {
          message = `${message}. ${alerts.join(' · ')}`;
        }
      }

      setFeedback({ ok: true, message });
      setForm((prev) => ({ ...prev, title: '', amount: '', date: today, notes: '' }));
      notifyParent();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('expenses:updated'));
      }
    } catch (error) {
      console.error('Save expense error:', error);
      setFeedback({ ok: false, message: error.message || 'Failed to save expense' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      setFeedback({ ok: false, message: 'Account name is required' });
      return;
    }
    setCreatingAccount(true);
    try {
      await accountService.createAccount({ name: newAccountName.trim(), type: 'cash' });
      await fetchAccounts();
      broadcastUpdate('accounts:updated');
      setFeedback({ ok: true, message: 'Account created successfully' });
      setNewAccountName('');
      setShowAccountField(false);
      notifyParent();
    } catch (error) {
      console.error('Create account error:', error);
      setFeedback({ ok: false, message: error.message || 'Failed to create account' });
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setFeedback({ ok: false, message: 'Category name is required' });
      return;
    }
    setCreatingCategory(true);
    try {
      const color = colorPalette[categories.length % colorPalette.length];
      await categoryService.createCategory({
        name: newCategoryName.trim(),
        type: 'expense',
        color,
        icon: '🧾'
      });
      await fetchCategories();
      broadcastUpdate('categories:updated');
      setFeedback({ ok: true, message: 'Category created successfully' });
      setNewCategoryName('');
      setShowCategoryField(false);
      notifyParent();
    } catch (error) {
      console.error('Create category error:', error);
      setFeedback({ ok: false, message: error.message || 'Failed to create category' });
    } finally {
      setCreatingCategory(false);
    }
  };

  const recentExpenses = useMemo(() => (
    expenses.slice(0, 8).map((expense) => ({
      id: expense._id || expense.id,
      title: expense.title,
      amount: expense.amount,
      date: expense.date ? expense.date.split('T')[0] : today,
      categoryName: expense.categoryId?.name || 'Expense'
    }))
  ), [expenses, today]);

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Manual Expense Entry</h2>
          <p className="text-sm text-slate-400">Attach expenses to real accounts and tracked categories.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {syncState.status === 'loading' && <span>Syncing...</span>}
          {syncState.status === 'error' && <span className="text-red-300">{syncState.error}</span>}
          {syncState.status === 'success' && <span>Up to date</span>}
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
            disabled={syncState.status === 'loading'}
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Expense title"
            name="title"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            placeholder="e.g., Client dinner"
            required
            error={errors.title}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Amount"
              type="number"
              name="amount"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              min="0"
              step="0.01"
              required
              error={errors.amount}
            />
            <InputField
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Account</label>
              {accounts.length > 0 ? (
                <select
                  value={form.accountId}
                  onChange={(event) => setForm({ ...form, accountId: event.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} {account.isPrimary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-300">Create an account to store expenses</p>
              )}
              {errors.accountId && <p className="text-xs text-red-400 mt-1">{errors.accountId}</p>}
              <button
                type="button"
                onClick={() => setShowAccountField((prev) => !prev)}
                className="mt-2 flex items-center gap-1 text-xs text-emerald-300"
              >
                <Wallet className="w-3 h-3" />
                {showAccountField ? 'Cancel account' : 'Add new account'}
              </button>
              {showAccountField && (
                <div className="mt-2 flex gap-2">
                  <input
                    value={newAccountName}
                    onChange={(event) => setNewAccountName(event.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="Account name"
                  />
                  <Button onClick={handleCreateAccount} variant="primary" type="button" disabled={creatingAccount}>
                    {creatingAccount ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Category</label>
              {activeCategories.length > 0 ? (
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                >
                  {activeCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-300">Enable at least one category</p>
              )}
              {errors.categoryId && <p className="text-xs text-red-400 mt-1">{errors.categoryId}</p>}
              <button
                type="button"
                onClick={() => setShowCategoryField((prev) => !prev)}
                className="mt-2 flex items-center gap-1 text-xs text-emerald-300"
              >
                <PlusCircle className="w-3 h-3" />
                {showCategoryField ? 'Cancel quick add' : 'Quick add category'}
              </button>
              {showCategoryField && (
                <div className="mt-2 flex gap-2">
                  <input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="Category name"
                  />
                  <Button onClick={handleCreateCategory} variant="primary" type="button" disabled={creatingCategory}>
                    {creatingCategory ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <InputField
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            placeholder="Optional details"
          />

          <Button type="submit" variant="primary" fullWidth disabled={submitting || syncState.status === 'loading'}>
            {submitting ? 'Saving…' : 'Save expense'}
          </Button>
          {feedback && (
            <p className={`text-sm ${feedback.ok ? 'text-emerald-300' : 'text-red-400'}`}>
              {feedback.message}
            </p>
          )}
        </form>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Recent expenses</h3>
              <p className="text-sm text-slate-400">Latest entries pulled from the backend</p>
            </div>
            <span className="text-xs text-slate-500">last {recentExpenses.length || 0} items</span>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
            {recentExpenses.length === 0 && (
              <p className="text-sm text-slate-400">No expenses logged yet. Submit your first entry.</p>
            )}
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between bg-slate-800/60 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-medium">{expense.title}</p>
                  <p className="text-xs text-slate-400">
                    {expense.categoryName} · {expense.date}
                  </p>
                </div>
                <p className="font-semibold text-rose-300">{currencyFormatter.format(expense.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseEntry;
