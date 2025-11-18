import React from 'react';
import ExpenseEntry from './ExpenseEntry';
import IncomeEntry from './IncomeEntry';
import CategoryManager from './CategoryManager';
import BudgetsGoals from './BudgetsGoals';
import useLocalStorage from '../../hooks/useLocalStorage';
import Sidebar from '../Shared/Sidebar';
import Card from '../Shared/Card';

function ExpensesPage() {
  const [categories, setCategories] = useLocalStorage('qu_categories', [
    'Food',
    'Housing',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Other'
  ]);

  const [expenses, setExpenses] = useLocalStorage('qu_expenses', []);
  const [incomes, setIncomes] = useLocalStorage('qu_incomes', []);
  const [budgets, setBudgets] = useLocalStorage('qu_budgets', []);

  // Expenses handlers
  const addExpense = (entry) => {
    const newEntry = { id: Date.now(), ...entry, amount: parseFloat(entry.amount) };
    setExpenses(prev => [newEntry, ...prev]);
  };

  const deleteExpense = (id) => setExpenses(prev => prev.filter(e => e.id !== id));

  const addIncome = (entry) => {
    const newEntry = { id: Date.now(), ...entry, amount: parseFloat(entry.amount) };
    setIncomes(prev => [newEntry, ...prev]);
  };

  const deleteIncome = (id) => setIncomes(prev => prev.filter(i => i.id !== id));

  const addCategory = (name) => {
    if (!name || !name.trim()) return;
    if (categories.includes(name.trim())) return;
    setCategories(prev => [...prev, name.trim()]);
  };

  const deleteCategory = (name) => {
    // Remove category and leave entries intact (they will show previous category string)
    setCategories(prev => prev.filter(c => c !== name));
  };

  const addBudget = (budget) => {
    const newBudget = { id: Date.now(), ...budget, amount: parseFloat(budget.amount), spent: 0 };
    setBudgets(prev => [newBudget, ...prev]);
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Expenses & Income</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <ExpenseEntry
              categories={categories}
              onAdd={addExpense}
              onDelete={deleteExpense}
              entries={expenses}
            />
          </Card>

          <Card>
            <IncomeEntry
              categories={['Employment', 'Business', 'Investment', 'Other']}
              onAdd={addIncome}
              onDelete={deleteIncome}
              entries={incomes}
            />
          </Card>

          <Card>
            <CategoryManager
              categories={categories}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
            />
          </Card>

          <Card>
            <BudgetsGoals budgets={budgets} onAddBudget={addBudget} expenses={expenses} />
          </Card>
        </div>
      </main>
    </div>
  );
}

export default ExpensesPage;
