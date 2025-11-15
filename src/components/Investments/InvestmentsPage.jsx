import React, { useMemo, useState } from 'react';
import Sidebar from '../Shared/Sidebar';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';

const categoryOptions = [
  { value: 'Stock', label: 'Stocks' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Crypto', label: 'Crypto' },
  { value: 'Gold', label: 'Gold' },
];

const getCategoryLabel = (value) =>
  categoryOptions.find((option) => option.value === value)?.label || value;

const categoryColors = {
  Stock: 'from-teal-400 to-teal-600',
  'Real Estate': 'from-emerald-400 to-emerald-600',
  Crypto: 'from-orange-400 to-pink-500',
  Gold: 'from-yellow-400 to-yellow-600',
};

const defaultUnitLabels = {
  Stock: 'shares',
  Gold: 'oz',
  Crypto: 'coins',
};

const getDefaultUnitLabel = (category) => defaultUnitLabels[category] || 'units';

const formatCurrency = (value = 0, { fractionDigits = 0 } = {}) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

const formatSignedCurrency = (value, options) => {
  if (!value) {
    return `±${formatCurrency(0, options)}`;
  }
  return `${value > 0 ? '+' : '-'}${formatCurrency(Math.abs(value), options)}`;
};

const initialInvestments = [
  {
    id: 1,
    name: 'S&P 500 ETF',
    category: 'Stock',
    amountOwned: 50,
    unitLabel: 'shares',
    buyPrice: 420,
    currentPrice: 465,
    amount: 50 * 465,
  },
  {
    id: 2,
    name: 'Downtown Duplex',
    category: 'Real Estate',
    areaSqm: 320,
    buyPrice: 720000,
    currentPrice: 860000,
    amount: 860000,
  },
  {
    id: 3,
    name: 'Bluechip Crypto Fund',
    category: 'Crypto',
    amountOwned: 2.4,
    unitLabel: 'BTC',
    buyPrice: 27000,
    currentPrice: 32800,
    amount: 2.4 * 32800,
  },
  {
    id: 4,
    name: '24K Gold Bars',
    category: 'Gold',
    amountOwned: 12,
    unitLabel: 'oz',
    buyPrice: 1850,
    currentPrice: 1985,
    amount: 12 * 1985,
  },
];

const initialFormState = {
  name: '',
  category: categoryOptions[0].value,
  amountOwned: '',
  buyPrice: '',
  currentPrice: '',
  areaSqm: '',
};

const getCurrentValue = (investment) => {
  if (!investment) return 0;
  if (investment.category === 'Real Estate') {
    return investment.currentPrice ?? investment.amount ?? 0;
  }
  if (
    typeof investment.currentPrice === 'number' &&
    typeof investment.amountOwned === 'number'
  ) {
    return investment.currentPrice * investment.amountOwned;
  }
  if (typeof investment.amount === 'number') {
    return investment.amount;
  }
  if (typeof investment.currentPrice === 'number') {
    return investment.currentPrice;
  }
  return 0;
};

const getPurchaseValue = (investment) => {
  if (!investment) return 0;
  if (investment.category === 'Real Estate') {
    return investment.buyPrice ?? investment.amount ?? 0;
  }
  if (
    typeof investment.buyPrice === 'number' &&
    typeof investment.amountOwned === 'number'
  ) {
    return investment.buyPrice * investment.amountOwned;
  }
  if (typeof investment.buyPrice === 'number') {
    return investment.buyPrice;
  }
  if (typeof investment.amount === 'number') {
    return investment.amount;
  }
  return 0;
};

const getPerformanceDelta = (investment) => {
  const current = getCurrentValue(investment);
  const purchase = getPurchaseValue(investment);
  const diff = current - purchase;
  const pct = purchase ? (diff / purchase) * 100 : 0;
  return { current, purchase, diff, pct };
};

const getPricePerSquareMeter = (investment) => {
  if (investment?.category !== 'Real Estate') return null;
  if (!investment.areaSqm || !investment.currentPrice) return null;
  if (investment.areaSqm === 0) return null;
  return investment.currentPrice / investment.areaSqm;
};

const formatHoldingsAmount = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  const hasFraction = Math.abs(value % 1) > 0;
  return value.toLocaleString('en-US', {
    maximumFractionDigits: hasFraction ? 4 : 0,
  });
};

const timeRangeOptions = [
  { key: 'day', label: 'Day' },
  { key: 'threeDays', label: '3 Days' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
  { key: 'fiveYears', label: '5 Years' },
  { key: 'allTime', label: 'All Time' },
];

const timeSeriesData = {
  day: [
    { label: '9 AM', value: 96250 },
    { label: '11 AM', value: 96900 },
    { label: '1 PM', value: 97550 },
    { label: '3 PM', value: 98200 },
    { label: '5 PM', value: 98100 },
  ],
  threeDays: [
    { label: 'Day 1', value: 94800 },
    { label: 'Day 2', value: 95850 },
    { label: 'Day 3', value: 98100 },
  ],
  week: [
    { label: 'Mon', value: 93200 },
    { label: 'Tue', value: 94050 },
    { label: 'Wed', value: 95125 },
    { label: 'Thu', value: 96780 },
    { label: 'Fri', value: 97500 },
    { label: 'Sat', value: 98100 },
    { label: 'Sun', value: 98440 },
  ],
  month: [
    { label: 'Week 1', value: 89400 },
    { label: 'Week 2', value: 91550 },
    { label: 'Week 3', value: 94100 },
    { label: 'Week 4', value: 97200 },
    { label: 'Week 5', value: 98100 },
  ],
  year: [
    { label: 'Jan', value: 82500 },
    { label: 'Mar', value: 84250 },
    { label: 'May', value: 87500 },
    { label: 'Jul', value: 90150 },
    { label: 'Sep', value: 93500 },
    { label: 'Nov', value: 96850 },
    { label: 'Dec', value: 98100 },
  ],
  fiveYears: [
    { label: '2019', value: 56200 },
    { label: '2020', value: 60400 },
    { label: '2021', value: 71200 },
    { label: '2022', value: 78100 },
    { label: '2023', value: 84250 },
    { label: '2024', value: 98100 },
  ],
  allTime: [
    { label: '2016', value: 42000 },
    { label: '2017', value: 48500 },
    { label: '2018', value: 51200 },
    { label: '2019', value: 56200 },
    { label: '2020', value: 60400 },
    { label: '2021', value: 71200 },
    { label: '2022', value: 78100 },
    { label: '2023', value: 84250 },
    { label: '2024', value: 98100 },
  ],
};

const InvestmentChart = ({ distribution, total, onSelectCategory }) => (
  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50 h-full">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm uppercase tracking-widest text-gray-400">Portfolio Mix</p>
        <h2 className="text-xl font-semibold text-white">Investment Allocation</h2>
        <p className="text-xs text-gray-500">Select a category to inspect its holdings.</p>
      </div>
      <p className="text-sm text-gray-400">
        Total · <span className="text-teal-300">{formatCurrency(total)}</span>
      </p>
    </div>

    <div className="space-y-3">
      {categoryOptions.map(({ value, label }) => {
        const amount = distribution[value] || 0;
        const percentage = total ? Math.round((amount / total) * 100) : 0;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelectCategory(value)}
            className="w-full text-left group rounded-lg border border-slate-700/40 hover:border-teal-500/50 bg-slate-900/20 hover:bg-slate-900/40 transition-colors px-4 py-3"
          >
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-gray-300">{label}</span>
              <span className="text-white font-medium">
                {formatCurrency(amount)}{' '}
                <span className="text-gray-400 font-normal">({percentage}%)</span>
              </span>
            </div>
            <div className="h-3 bg-slate-700/70 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${categoryColors[value] || 'from-teal-500 to-blue-500'}`}
                style={{ width: `${percentage || (total ? 2 : 0)}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const InvestmentTrendChart = ({ data }) => {
  if (!data || !data.length) {
    return (
      <div className="h-56 bg-slate-900/40 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-gray-500">
        No performance data available.
      </div>
    );
  }

  const width = 500;
  const height = 190;
  const paddingX = 22;
  const paddingY = 18;

  const values = data.map((point) => point.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || maxValue * 0.05 || 1;

  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const coordinates = data.map((point, index) => {
    const x =
      data.length === 1
        ? paddingX + usableWidth / 2
        : paddingX + (index / (data.length - 1)) * usableWidth;
    const y =
      height -
      paddingY -
      ((point.value - minValue) / range) * usableHeight;
    return { ...point, x, y };
  });

  const linePath = coordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L ${coordinates[coordinates.length - 1].x.toFixed(
    2
  )} ${height - paddingY} L ${coordinates[0].x.toFixed(2)} ${height - paddingY} Z`;

  const gridLines = Array.from({ length: 4 }, (_, index) => ({
    y: paddingY + (index / 3) * usableHeight,
  }));

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44"
        role="img"
        aria-label="Investment performance chart"
      >
        <defs>
          <linearGradient id="trendLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="trendFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(45,212,191,0.35)" />
            <stop offset="100%" stopColor="rgba(15,118,110,0)" />
          </linearGradient>
        </defs>

        {gridLines.map((line, index) => (
          <line
            // eslint-disable-next-line react/no-array-index-key
            key={`grid-${index}`}
            x1={paddingX}
            x2={width - paddingX}
            y1={line.y}
            y2={line.y}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#trendFill)" opacity={0.75} />
        <path
          d={linePath}
          fill="none"
          stroke="url(#trendLine)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {coordinates.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r={5} fill="#0f172a" stroke="#5eead4" strokeWidth="2" />
            <circle cx={point.x} cy={point.y} r={2} fill="#5eead4" />
          </g>
        ))}
      </svg>
      <div className="flex justify-between text-xs text-gray-400 px-1 mt-2">
        {data.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
};

function DashboardPage() {
  const [investments, setInvestments] = useState(initialInvestments);
  const [selectedRange, setSelectedRange] = useState('month');
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });

  const totalValue = useMemo(
    () => investments.reduce((sum, investment) => sum + getCurrentValue(investment), 0),
    [investments]
  );

  const distribution = useMemo(() => {
    const base = categoryOptions.reduce(
      (acc, { value }) => ({ ...acc, [value]: 0 }),
      {}
    );

    return investments.reduce((acc, investment) => {
      const current = getCurrentValue(investment);
      acc[investment.category] = (acc[investment.category] || 0) + current;
      return acc;
    }, base);
  }, [investments]);

  const leadingCategory = useMemo(() => {
    const entries = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
    return entries[0];
  }, [distribution]);

  const trendData = useMemo(() => timeSeriesData[selectedRange] || [], [selectedRange]);

  const trendStats = useMemo(() => {
    if (!trendData.length) {
      return { latest: 0, changeAbs: 0, changePct: 0 };
    }
    const first = trendData[0].value;
    const last = trendData[trendData.length - 1].value;
    const changeAbs = last - first;
    const changePct = first ? (changeAbs / first) * 100 : 0;
    return { latest: last, changeAbs, changePct };
  }, [trendData]);
  const isRealEstateSelected = form.category === 'Real Estate';
  const selectedUnitLabel = getDefaultUnitLabel(form.category);

  const categoryInvestments = useMemo(() => {
    if (!categoryModal.category) return [];
    return investments.filter((investment) => investment.category === categoryModal.category);
  }, [categoryModal.category, investments]);

  const categoryTotals = useMemo(() => {
    if (!categoryModal.category || !categoryInvestments.length) {
      return { current: 0, purchase: 0, diff: 0, pct: 0 };
    }
    const purchase = categoryInvestments.reduce((sum, investment) => sum + getPurchaseValue(investment), 0);
    const current = categoryInvestments.reduce((sum, investment) => sum + getCurrentValue(investment), 0);
    const diff = current - purchase;
    const pct = purchase ? (diff / purchase) * 100 : 0;
    return { current, purchase, diff, pct };
  }, [categoryInvestments, categoryModal.category]);

  const handleOpenCategoryModal = (category) => {
    setCategoryModal({ open: true, category });
  };

  const handleCloseCategoryModal = () => {
    setCategoryModal({ open: false, category: null });
  };

  const activeCategoryLabel = categoryModal.category ? getCategoryLabel(categoryModal.category) : 'Category';

  const handleFormChange = (field, sanitizeNumber = false) => (event) => {
    const inputValue = event.target.value;
    const value = sanitizeNumber ? inputValue.replace(/[^0-9.]/g, '') : inputValue;
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      category: value,
      amountOwned: '',
      areaSqm: '',
      buyPrice: '',
      currentPrice: '',
    }));
    setErrors({});
  };

  const handleAddInvestment = (event) => {
    event.preventDefault();
    const validationErrors = {};
    const trimmedName = form.name.trim();
    const isRealEstate = form.category === 'Real Estate';

    if (!trimmedName) {
      validationErrors.name = 'Name is required';
    }

    const amountOwnedValue = parseFloat(form.amountOwned);
    const areaValue = parseFloat(form.areaSqm);
    const buyPriceValue = parseFloat(form.buyPrice);
    const currentPriceValue = parseFloat(form.currentPrice);

    if (isRealEstate) {
      if (!areaValue || areaValue <= 0) {
        validationErrors.areaSqm = 'Area is required';
      }
      if (!buyPriceValue || buyPriceValue <= 0) {
        validationErrors.buyPrice = 'Enter purchase price';
      }
      if (!currentPriceValue || currentPriceValue <= 0) {
        validationErrors.currentPrice = "Enter today's price";
      }
    } else {
      if (!amountOwnedValue || amountOwnedValue <= 0) {
        validationErrors.amountOwned = 'Enter the amount owned';
      }
      if (!buyPriceValue || buyPriceValue <= 0) {
        validationErrors.buyPrice = 'Enter purchase price';
      }
      if (!currentPriceValue || currentPriceValue <= 0) {
        validationErrors.currentPrice = "Enter today's price";
      }
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    let newInvestment;

    if (isRealEstate) {
      newInvestment = {
        id: Date.now(),
        name: trimmedName,
        category: 'Real Estate',
        areaSqm: areaValue,
        buyPrice: buyPriceValue,
        currentPrice: currentPriceValue,
        amount: currentPriceValue,
      };
    } else {
      const unitLabel = getDefaultUnitLabel(form.category);
      newInvestment = {
        id: Date.now(),
        name: trimmedName,
        category: form.category,
        amountOwned: amountOwnedValue,
        unitLabel,
        buyPrice: buyPriceValue,
        currentPrice: currentPriceValue,
        amount: currentPriceValue * amountOwnedValue,
      };
    }

    setInvestments((prev) => [...prev, newInvestment]);
    setForm((prev) => ({
      ...initialFormState,
      category: prev.category,
    }));
    setErrors({});
    setShowAddModal(false);
  };

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-800 via-teal-900 to-slate-800">
        <Sidebar />

        <div className="flex-1 px-4 py-6 overflow-auto">
          <div className="w-full max-w-4xl mx-auto space-y-4">
          <header>
            <p className="text-sm uppercase tracking-[0.35em] text-teal-200/80">
              Portfolio
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Investment Overview
                </h1>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Portfolio Value
                </p>
                <p className="text-2xl font-semibold text-teal-300">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          </header>


          <section className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-gray-400">
                  Performance
                </p>
                <h2 className="text-xl font-semibold text-white">Portfolio over time</h2>
                <p className="text-sm text-gray-400">
                  Visualize your investment growth across any period.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {timeRangeOptions.map((option) => {
                  const isActive = option.key === selectedRange;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setSelectedRange(option.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        isActive
                          ? 'bg-teal-500/20 text-teal-300 border-teal-400/40 shadow-[0_0_25px_rgba(94,234,212,0.3)]'
                          : 'text-gray-400 border-slate-700/70 hover:text-white hover:border-teal-500/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2">
              <InvestmentTrendChart data={trendData} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-5 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Latest value</p>
                <p className="text-2xl font-semibold text-white mt-1">
                  {formatCurrency(trendStats.latest)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400">Change</p>
                <p
                  className={`text-lg font-semibold ${
                    trendStats.changeAbs >= 0 ? 'text-teal-300' : 'text-rose-400'
                  }`}
                >
                  {formatSignedCurrency(trendStats.changeAbs)}{' '}
                  <span className="text-sm text-gray-400">
                    ({trendStats.changePct >= 0 ? '+' : ''}
                    {trendStats.changePct.toFixed(2)}%)
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
            <div className="lg:col-span-2">
              <InvestmentChart
                distribution={distribution}
                total={totalValue}
                onSelectCategory={handleOpenCategoryModal}
              />
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3.5 border border-slate-700/50 flex flex-col gap-1.5">
              <p className="text-sm uppercase tracking-widest text-gray-400 mb-1">
                Add Investment
              </p>
              <h2 className="text-xl font-semibold text-white">
                Track a new asset
              </h2>
              <p className="text-sm text-gray-400 flex-1">
                Capture stocks, property, crypto, or gold in a single, streamlined flow.
              </p>
              <Button variant="primary" className="mt-auto" onClick={() => setShowAddModal(true)}>
                Add investment
              </Button>
            </div>
          </section>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add investment"
      subtitle="Track a new asset across stocks, property, crypto, or gold."
      maxWidth="max-w-3xl"
    >
      <form className="space-y-4" onSubmit={handleAddInvestment}>
        <InputField
          label="Investment name"
          name="name"
          value={form.name}
          onChange={handleFormChange('name')}
          placeholder="e.g., Tech Growth ETF"
          error={errors.name}
        />

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Type
          </label>
          <select
            value={form.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {categoryOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {isRealEstateSelected ? (
          <>
            <InputField
              label="Area (m²)"
              type="number"
              name="areaSqm"
              value={form.areaSqm}
              onChange={handleFormChange('areaSqm', true)}
              placeholder="e.g., 320"
              error={errors.areaSqm}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Purchase price"
                type="number"
                name="buyPrice"
                value={form.buyPrice}
                onChange={handleFormChange('buyPrice', true)}
                placeholder="e.g., 720000"
                error={errors.buyPrice}
              />
              <InputField
                label="Today's price"
                type="number"
                name="currentPrice"
                value={form.currentPrice}
                onChange={handleFormChange('currentPrice', true)}
                placeholder="e.g., 860000"
                error={errors.currentPrice}
              />
            </div>
          </>
        ) : (
          <>
            <InputField
              label={`Amount (${selectedUnitLabel})`}
              type="number"
              name="amountOwned"
              value={form.amountOwned}
              onChange={handleFormChange('amountOwned', true)}
              placeholder={`Number of ${selectedUnitLabel}`}
              error={errors.amountOwned}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Purchase price / unit"
                type="number"
                name="buyPrice"
                value={form.buyPrice}
                onChange={handleFormChange('buyPrice', true)}
                placeholder="e.g., 420"
                error={errors.buyPrice}
              />
              <InputField
                label="Today's price / unit"
                type="number"
                name="currentPrice"
                value={form.currentPrice}
                onChange={handleFormChange('currentPrice', true)}
                placeholder="e.g., 465"
                error={errors.currentPrice}
              />
            </div>
          </>
        )}

        {errors.general && (
          <p className="text-sm text-red-400">{errors.general}</p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            className="px-6"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="px-6">
            Save investment
          </Button>
        </div>
      </form>
      </Modal>

      <Modal
        isOpen={categoryModal.open}
        onClose={handleCloseCategoryModal}
        title={`${activeCategoryLabel} holdings`}
      subtitle="Detailed breakdown of every asset inside this category."
      maxWidth="max-w-4xl"
    >
      {categoryInvestments.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-slate-700/60 p-4 bg-slate-900/40">
              <p className="text-xs uppercase tracking-widest text-gray-400">Current value</p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatCurrency(categoryTotals.current)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/60 p-4 bg-slate-900/40">
              <p className="text-xs uppercase tracking-widest text-gray-400">Invested</p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatCurrency(categoryTotals.purchase)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-700/60 p-4 bg-slate-900/40">
              <p className="text-xs uppercase tracking-widest text-gray-400">Performance</p>
              <p
                className={`text-lg font-semibold ${
                  categoryTotals.diff >= 0 ? 'text-teal-300' : 'text-rose-400'
                } mt-1`}
              >
                {formatSignedCurrency(categoryTotals.diff)} ({categoryTotals.pct >= 0 ? '+' : ''}
                {categoryTotals.pct.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-auto pr-1">
            {categoryInvestments.map((investment) => {
              const { current, diff, pct } = getPerformanceDelta(investment);
              const isRealEstate = investment.category === 'Real Estate';
              const pricePerSqm = getPricePerSquareMeter(investment);
              const unitLabel = investment.unitLabel || getDefaultUnitLabel(investment.category);
              const amountOwnedValue =
                typeof investment.amountOwned === 'number' && !Number.isNaN(investment.amountOwned)
                  ? formatHoldingsAmount(investment.amountOwned)
                  : null;

              return (
                <div
                  key={investment.id}
                  className="rounded-lg border border-slate-700/70 bg-slate-900/30 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{investment.name}</p>
                      <p className="text-xs text-gray-400">{investment.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-gray-500">Value</p>
                      <p className="text-base font-semibold text-teal-200">
                        {formatCurrency(current)}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          diff >= 0 ? 'text-teal-300' : 'text-rose-400'
                        }`}
                      >
                        {formatSignedCurrency(diff)} ({diff >= 0 ? '+' : ''}
                        {pct.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    {isRealEstate ? (
                      <>
                        <p>Area: {investment.areaSqm ? `${formatHoldingsAmount(investment.areaSqm)} m²` : 'Not specified'}</p>
                        <p>Purchased at: {formatCurrency(investment.buyPrice)}</p>
                        <p>Today: {formatCurrency(investment.currentPrice)}</p>
                        {pricePerSqm && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(pricePerSqm, { fractionDigits: 0 })} per m²
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p>
                          Holdings: {amountOwnedValue ?? '—'} {unitLabel}
                        </p>
                        <p>Purchased @ {formatCurrency(investment.buyPrice, { fractionDigits: 2 })} / unit</p>
                        <p>Today @ {formatCurrency(investment.currentPrice, { fractionDigits: 2 })} / unit</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400">No holdings recorded for this category yet.</p>
      )}
      </Modal>
    </>
  );
}

export default DashboardPage;
