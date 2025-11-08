import React from 'react';
import AdminLayout from './AdminLayout';

const statusTokens = {
  available: {
    label: 'Available',
    chip: 'bg-emerald-400/10 text-emerald-100 border border-emerald-400/40'
  },
  busy: {
    label: 'Busy',
    chip: 'bg-amber-400/10 text-amber-100 border border-amber-400/40'
  },
  offline: {
    label: 'Offline',
    chip: 'bg-slate-500/10 text-slate-200 border border-slate-300/20'
  }
};

const advisors = [
  {
    id: 1,
    name: 'Ahmed Al-Saud',
    specialty: 'Investment',
    status: 'available',
    sessions: 45,
    rating: 4.8
  },
  {
    id: 2,
    name: 'Fatima Hassan',
    specialty: 'Zakah & Islamic Finance',
    status: 'available',
    sessions: 62,
    rating: 4.9
  },
  {
    id: 3,
    name: 'Omar Ibrahim',
    specialty: 'Budgeting & Savings',
    status: 'busy',
    sessions: 38,
    rating: 4.7
  },
  {
    id: 4,
    name: 'Sara Abdullah',
    specialty: 'Debt Management',
    status: 'offline',
    sessions: 29,
    rating: 4.6
  }
];

function AdvisorAvailability() {
  return (
    <AdminLayout
      accentLabel="Advisors"
      title="Advisor Availability"
      description="Monitor advisor load and service coverage. Advisors update their own status from their workspace."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {advisors.map((advisor) => (
          <article
            key={advisor.id}
            className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-[0_12px_45px_rgba(1,6,12,0.75)] flex flex-col gap-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
                  Advisor
                </p>
                <h3 className="text-2xl font-semibold text-white">
                  {advisor.name}
                </h3>
                <p className="text-sm text-gray-400">{advisor.specialty}</p>
              </div>
              <span
                className={`px-4 py-1 rounded-full text-xs font-semibold ${statusTokens[advisor.status].chip}`}
              >
                {statusTokens[advisor.status].label}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Sessions
                </p>
                <p className="text-xl font-semibold text-white">
                  {advisor.sessions}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Rating
                </p>
                <p className="text-xl font-semibold text-white">
                  * {advisor.rating.toFixed(1)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Status
                </p>
                <p className="text-lg font-semibold text-white capitalize">
                  {advisor.status}
                </p>
              </div>
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
              Availability is self-managed by advisors.
            </p>
          </article>
        ))}
      </div>
    </AdminLayout>
  );
}

export default AdvisorAvailability;
