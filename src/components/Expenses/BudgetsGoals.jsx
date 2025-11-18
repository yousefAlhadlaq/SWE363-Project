import React, { useState } from 'react';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';

function BudgetsGoals({ budgets = [], onAddBudget, expenses = [] }) {
  const [budget, setBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  const handleChange = (e) => {
    setBudget({
      ...budget,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newBudget = {
      id: Date.now(),
      ...budget,
      amount: parseFloat(budget.amount),
      spent: 0
    };
    if (onAddBudget) onAddBudget(newBudget);
    setBudget({ category: '', amount: '', period: 'monthly' });
  };

  const getProgressPercentage = (spent, amount) => {
    if (!amount || amount === 0) return 0;
    return Math.min((spent / amount) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const computeSpentForCategory = (category) => {
    return expenses.filter(e => e.category === category).reduce((s, x) => s + Number(x.amount || 0), 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Budgets & Goals</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Budget Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Set Budget</h3>
          <form onSubmit={handleSubmit}>
            <InputField
              label="Category"
              type="text"
              name="category"
              value={budget.category}
              onChange={handleChange}
              required
            />
            <InputField
              label="Budget Amount"
              type="number"
              name="amount"
              value={budget.amount}
              onChange={handleChange}
              required
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <select
                name="period"
                value={budget.period}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <Button type="submit" variant="primary">
              Set Budget
            </Button>
          </form>
        </div>

        {/* Budget Progress */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Budget Progress</h3>
          <div className="space-y-4">
            {(budgets || []).map((item) => {
              const spent = computeSpentForCategory(item.category);
              const percentage = getProgressPercentage(spent, item.amount);
              return (
                <div key={item.id} className="p-4 border border-gray-200 rounded">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-semibold">{item.category}</h4>
                    <span className="text-sm text-gray-600">
                      ${spent} / ${item.amount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${getProgressColor(percentage)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% used</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetsGoals;
