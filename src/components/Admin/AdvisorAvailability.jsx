import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import advisorService from '../../services/advisorService';

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

function AdvisorAvailability() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAdvisors = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await advisorService.getAllAdvisors();
        const payload = response?.advisors || response?.data || [];
        if (isMounted) {
          setAdvisors(Array.isArray(payload) ? payload : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || err.message || 'Failed to load advisors');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAdvisors();
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedAdvisors = useMemo(() => {
    return advisors.map((advisor) => {
      const profile = advisor.advisorProfile || {};
      const statusValue = profile.availability === 'unavailable' ? 'offline' : profile.availability;
      return {
        id: advisor._id || advisor.id,
        name: advisor.fullName || advisor.name || 'Advisor',
        specialty: profile.specializations?.[0] || 'Financial Advisor',
        status: statusValue && statusTokens[statusValue] ? statusValue : 'offline',
        sessions: profile.totalReviews ?? 0,
        rating: typeof profile.rating === 'number' ? profile.rating : 0
      };
    });
  }, [advisors]);

  const renderContent = () => {
    if (loading) {
      return <p className="text-sm text-gray-400">Loading advisors…</p>;
    }

    if (error) {
      return <p className="text-sm text-red-300">{error}</p>;
    }

    if (!normalizedAdvisors.length) {
      return <p className="text-sm text-gray-400">No advisors found.</p>;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {normalizedAdvisors.map((advisor) => (
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
                  {advisor.sessions ?? 0}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Rating
                </p>
                <p className="text-xl font-semibold text-white">
                  * {advisor.rating ? advisor.rating.toFixed(1) : '0.0'}
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
    );
  };

  return (
    <AdminLayout
      accentLabel="Advisors"
      title="Advisor Availability"
      description="Monitor advisor load and service coverage. Advisors update their own status from their workspace."
    >
      {renderContent()}
    </AdminLayout>
  );
}

export default AdvisorAvailability;
