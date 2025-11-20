import React, { useState } from 'react';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';

function IncomeEntry({ categories = [], onAdd, onDelete, entries = [] }) {
  const [income, setIncome] = useState({
    source: '',
    amount: '',
    date: '',
    category: '',
    description: ''
  });

  const [localList, setLocalList] = useState(entries.length ? entries : [
    { id: 1, source: 'Salary', amount: 5000, date: '2024-01-01', category: 'Employment' },
    { id: 2, source: 'Freelance', amount: 1500, date: '2024-01-15', category: 'Business' }
  ]);

  const handleChange = (e) => {
    setIncome({
      ...income,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newIncome = {
      id: Date.now(),
      ...income,
      amount: parseFloat(income.amount)
    };

    if (onAdd) onAdd(newIncome);
    else setLocalList(prev => [newIncome, ...prev]);

    setIncome({ source: '', amount: '', date: '', category: '', description: '' });
  };

  const handleDelete = (id) => {
    if (onDelete) return onDelete(id);
    setLocalList(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Income Entry</h2>
        <p className="text-sm text-slate-400">Dashboard palette applied</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {/* Income Form */}
        <div className="bg-slate-800/80 p-6 rounded-xl shadow-lg border border-slate-700/70 backdrop-blur-sm min-h-[360px]">
          <h3 className="text-xl font-semibold text-white mb-4">Add Income</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Source"
              type="text"
              name="source"
              value={income.source}
              onChange={handleChange}
              required
            />
            <InputField
              label="Amount"
              type="number"
              name="amount"
              value={income.amount}
              onChange={handleChange}
              required
            />
            <InputField
              label="Date"
              type="date"
              name="date"
              value={income.date}
              onChange={handleChange}
              required
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={income.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {(categories.length ? categories : ['Employment','Business','Investment','Other']).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={income.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 rounded-md bg-slate-900/70 border border-slate-700/70 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              />
            </div>
            <Button type="submit" variant="primary">
              Add Income
            </Button>
          </form>
        </div>

        {/* Income List */}
        <div className="bg-slate-800/80 p-6 rounded-xl shadow-lg border border-slate-700/70 backdrop-blur-sm min-h-[360px]">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Income</h3>
          <div className="space-y-3">
            {(entries.length ? entries : localList).map((item) => (
              <div key={item.id} className="p-4 border border-slate-700/70 rounded-lg bg-slate-900/60">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-white">{item.source}</h4>
                    <p className="text-sm text-slate-400">{item.category}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-lg font-bold text-teal-300">SAR {Number(item.amount).toLocaleString()}</p>
                    <div className="mt-1">
                      <Button onClick={() => handleDelete(item.id)} variant="danger">Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomeEntry;
