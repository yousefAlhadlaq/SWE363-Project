import React from 'react';
import AdminLayout from './AdminLayout';

const statCards = [
  {
    label: 'Total Users',
    value: '12,584',
    delta: '+3.1% this week',
    accent: 'from-emerald-400/30 to-emerald-500/10',
    badge: 'Live'
  },
  {
    label: 'Active Advisors',
    value: '86',
    delta: '12 available now',
    accent: 'from-cyan-400/30 to-cyan-500/10',
    badge: 'Staff'
  },
  {
    label: 'Pending Requests',
    value: '47',
    delta: '8 need review',
    accent: 'from-amber-400/30 to-amber-500/10',
    badge: 'Action'
  },
  {
    label: 'Total Revenue',
    value: '$452k',
    delta: '+18% YoY',
    accent: 'from-indigo-400/30 to-indigo-500/10',
    badge: 'Finance'
  }
];

const usageTrends = [
  { label: 'Active sessions', value: '842', percent: 72 },
  { label: 'Successful logins', value: '1,204', percent: 88 },
  { label: 'Advisory calls', value: '214', percent: 54 }
];

const activityLog = [
  {
    id: 1,
    actor: 'System',
    action: 'Dashboard viewed',
    detail: 'Audit trail recorded',
    time: '2m ago'
  },
  {
    id: 2,
    actor: 'Rayan Khalid',
    action: 'Approved advisor request',
    detail: 'Request #A-910',
    time: '13m ago'
  },
  {
    id: 3,
    actor: 'System',
    action: 'Daily snapshot generated',
    detail: 'Sent to exec mailing list',
    time: '1h ago'
  }
];

function AdminDashboard() {
  return (
    <AdminLayout
      accentLabel="Home"
      title="System Health & Activity"
      description="Monitor live adoption, advisor performance, and compliance tasks across the Guroosh platform."
    >
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
            <div
              className={`mt-4 h-1.5 rounded-full bg-gradient-to-r ${card.accent}`}
            />
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
