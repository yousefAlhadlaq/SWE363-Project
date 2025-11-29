import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { dashboardService } from '../../services';

const formatSar = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'SAR —';
  }
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 0
  }).format(Number(value));
};

const formatRelativeTime = (value) => {
  if (!value) return 'moments ago';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'moments ago';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResponse, transactionsResponse] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRecentTransactions(8)
      ]);

      if (!overviewResponse?.success) {
        throw new Error(overviewResponse?.error || 'Failed to load overview metrics');
      }

      if (!transactionsResponse?.success) {
        throw new Error(transactionsResponse?.error || 'Failed to load recent activity');
      }

      setOverview(overviewResponse.data || {});
      setRecentTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Admin dashboard fetch error:', err);
      setError(err.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards = useMemo(() => {
    const summary = overview || {};
    return [
      {
        label: 'Net Balance',
        value: formatSar(summary.netBalance),
        delta: `Income ${formatSar(summary.totalIncome)} · Expenses ${formatSar(summary.totalExpenses)}`,
        accent: 'from-emerald-400/30 to-emerald-500/10',
        badge: 'Finance'
      },
      {
        label: 'Investments',
        value: formatSar(summary.totalInvestments),
        delta: 'Total market value being tracked',
        accent: 'from-cyan-400/30 to-cyan-500/10',
        badge: 'Assets'
      },
      {
        label: 'Transactions synced',
        value: `${recentTransactions.length}`,
        delta: 'Last 10 expense entries',
        accent: 'from-amber-400/30 to-amber-500/10',
        badge: 'Activity'
      },
      {
        label: 'Data freshness',
        value: lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—',
        delta: 'Local time of last successful sync',
        accent: 'from-indigo-400/30 to-indigo-500/10',
        badge: loading ? 'Syncing' : 'Live'
      }
    ];
  }, [overview, recentTransactions.length, lastUpdated, loading]);

  const usageTrends = useMemo(() => {
    const summary = overview || {};
    const expensesValue = Number(summary.totalExpenses || 0);
    const netBalance = Number(summary.netBalance || 0);
    const investments = Number(summary.totalInvestments || 0);
    const safePercent = (value, base = 1) => Math.min(Math.round((value / Math.max(base, 1)) * 100), 100);

    return [
      {
        label: 'Monthly expenses',
        value: formatSar(expensesValue),
        percent: safePercent(expensesValue, 10000)
      },
      {
        label: 'Investments under watch',
        value: formatSar(investments),
        percent: safePercent(investments, 50000)
      },
      {
        label: 'Net balance swing',
        value: formatSar(netBalance),
        percent: safePercent(Math.abs(netBalance), expensesValue || 1)
      }
    ];
  }, [overview]);

  const activityLog = useMemo(() => {
    if (!recentTransactions.length) {
      return [
        {
          id: 'placeholder',
          actor: 'System',
          action: 'Awaiting transactions',
          detail: 'Post an expense to populate activity',
          time: '—'
        }
      ];
    }

    return recentTransactions.slice(0, 6).map((transaction) => ({
      id: transaction.id,
      actor: transaction.category || 'Expense',
      action: transaction.title,
      detail: `${formatSar(transaction.amount)}${transaction.merchant ? ` · ${transaction.merchant}` : ''}`,
      time: formatRelativeTime(transaction.date)
    }));
  }, [recentTransactions]);

  return (
    <AdminLayout
      accentLabel="Home"
      title="System Health & Activity"
      description="Monitor live adoption, advisor performance, and compliance tasks across the Guroosh platform."
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-sm">
        {error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <p className="text-slate-400">
            {loading ? 'Syncing latest metrics…' : `Last updated ${lastUpdated ? new Date(lastUpdated).toLocaleString() : '—'}`}
          </p>
        )}
        <button
          type="button"
          onClick={loadDashboard}
          className="px-4 py-2 rounded-full border border-white/20 text-sm text-gray-200 hover:border-white/60 transition"
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh data'}
        </button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => (
          <article
            key={card.label}
            className="rounded-3xl p-5 bg-white/5 border border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-400">
              <span>{card.label}</span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white">
                {card.badge}
              </span>
            </div>
            <p className="text-3xl font-semibold mt-4">{card.value}</p>
            <p className="text-sm text-emerald-200/80 mt-2">{card.delta}</p>
            <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${card.accent}`} />
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white/5 border border-white/5 rounded-3xl p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-gray-400">
                Overview
              </p>
              <h2 className="text-2xl font-semibold">Engagement Pulse</h2>
            </div>
            <button className="px-4 py-2 rounded-full border border-white/20 text-sm text-gray-200 hover:border-white/60 transition">
              Export snapshot
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {usageTrends.map((trend) => (
              <div
                key={trend.label}
                className="rounded-2xl bg-white/10 border border-white/5 p-4 backdrop-blur"
              >
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  {trend.label}
                </p>
                <p className="text-2xl font-semibold mt-2">{trend.value}</p>
                <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <span
                    className="block h-full bg-gradient-to-r from-teal-400 to-cyan-500"
                    style={{ width: `${trend.percent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {trend.percent}% of monthly target
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)] space-y-5">
          <header>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
              Log
            </p>
            <h2 className="text-2xl font-semibold">System Activity</h2>
          </header>
          <div className="space-y-4">
            {activityLog.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/10 border border-white/5"
              >
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>{item.actor}</span>
                  <span>{item.time}</span>
                </div>
                <p className="font-semibold">{item.action}</p>
                <p className="text-sm text-gray-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
