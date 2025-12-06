import React, { useMemo, useState, useEffect } from 'react';
import Sidebar from '../Shared/Sidebar';
import InputField from '../Shared/InputField';
import Button from '../Shared/Button';
import Modal from '../Shared/Modal';
import investmentService from '../../services/investmentService';
import zakatService from '../../services/zakatService';
import StockSearchInput from './StockSearchInput';
import CryptoSearchInput from './CryptoSearchInput';
import MapSelector from './MapSelector';
import FloatingActionButton from '../Shared/FloatingActionButton';
import ProfessionalInvestmentChart from './ProfessionalInvestmentChart';
import ZakatResultsModal from './ZakatResultsModal';

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

const categoryLineColors = {
  Stock: '#2dd4bf',
  'Real Estate': '#34d399',
  Crypto: '#fb923c',
  Gold: '#facc15',
};

const defaultUnitLabels = {
  Stock: 'shares',
  Gold: 'grams',
  Crypto: 'coins',
};

const getDefaultUnitLabel = (category) => defaultUnitLabels[category] || 'units';

// USD to SAR conversion rate (fixed rate: 1 USD = 3.75 SAR)
const USD_TO_SAR = 3.75;

const formatCurrency = (value = 0, { fractionDigits = 0 } = {}) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString('en-SA', {
    style: 'currency',
    currency: 'SAR',
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

const formatDate = (value) => {
  if (!value) return 'Not provided';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not provided';
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const isValidDate = (value) => {
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const earliest = new Date('1900-01-01');
  return parsed <= now && parsed >= earliest;
};

const initialInvestments = [
  {
    id: 1,
    name: 'S&P 500 ETF',
    category: 'Stock',
    purchaseDate: '2024-01-15',
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
    purchaseDate: '2023-08-10',
    areaSqm: 320,
    buyPrice: 720000,
    currentPrice: 860000,
    amount: 860000,
  },
  {
    id: 3,
    name: 'Bluechip Crypto Fund',
    category: 'Crypto',
    purchaseDate: '2024-03-01',
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
    purchaseDate: '2024-05-20',
    amountOwned: 373.24, // ~12 oz converted to grams
    unitLabel: 'grams',
    buyPrice: 59.49,
    currentPrice: 63.82,
    amount: 373.24 * 63.82,
  },
];

const initialFormState = {
  name: '',
  category: categoryOptions[0].value,
  purchaseDate: '',
  amountOwned: '',
  buyPrice: '',
  currentPrice: '',
  areaSqm: '',
  location: '',
  latitude: null,
  longitude: null,
  propertyType: 'Villa',
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

const formatTimeLabel = (date) =>
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const formatDayLabel = (date) =>
  date.toLocaleDateString('en-US', { weekday: 'short' });
const formatMonthLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'short' });
const formatDayMonthLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const getDynamicRangeLabels = (rangeKey) => {
  const now = new Date();

  switch (rangeKey) {
    case 'day': {
      const points = 5;
      const spanMinutes = 8 * 60; // last 8 hours
      const step = spanMinutes / (points - 1 || 1);
      return Array.from({ length: points }, (_, idx) => {
        const date = new Date(now.getTime() - (points - 1 - idx) * step * 60 * 1000);
        return formatTimeLabel(date);
      });
    }
    case 'threeDays': {
      return [2, 1, 0].map((offset) => {
        const date = new Date(now);
        date.setDate(now.getDate() - offset);
        return formatDayLabel(date);
      });
    }
    case 'week': {
      return Array.from({ length: 7 }, (_, idx) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - idx));
        return formatDayLabel(date);
      });
    }
    case 'month': {
      // last 5 weeks (approx, 7-day steps)
      return Array.from({ length: 5 }, (_, idx) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (4 - idx) * 7);
        return formatDayMonthLabel(date);
      });
    }
    case 'year': {
      return Array.from({ length: 7 }, (_, idx) => {
        const date = new Date(now);
        date.setMonth(now.getMonth() - (6 - idx));
        return formatMonthLabel(date);
      });
    }
    case 'fiveYears': {
      const year = now.getFullYear();
      return Array.from({ length: 6 }, (_, idx) => `${year - (5 - idx)}`);
    }
    case 'allTime': {
      const year = now.getFullYear();
      return Array.from({ length: 9 }, (_, idx) => `${year - (8 - idx)}`);
    }
    default:
      return ['Start', 'Now'];
  }
};

const buildTrendSeries = (rangeKey, currentTotal, purchaseTotal, customLabels) => {
  const labels = customLabels && customLabels.length ? customLabels : getDynamicRangeLabels(rangeKey);

  if (!labels.length) return [];

  const startValue = purchaseTotal > 0 ? purchaseTotal : currentTotal * 0.9;
  const endValue = currentTotal;

  if (labels.length === 1) {
    return [{ label: labels[0], value: endValue }];
  }

  const step = (endValue - startValue) / (labels.length - 1 || 1);

  return labels.map((label, idx) => ({
    label,
    value: Number((startValue + step * idx).toFixed(2)),
  }));
};

const InvestmentChart = ({
  distribution,
  total,
  onSelectCategory,
  onFilterCategory,
  filteredCategory
}) => (
  <div className="bg-white dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-3 border border-slate-200 dark:border-slate-700/50 h-full shadow-lg dark:shadow-xl transition-colors">
    <div className="flex items-start justify-between gap-3 mb-3">
      <p className="text-xs text-slate-500 dark:text-gray-400 text-right">
        Total · <span className="text-teal-600 dark:text-teal-300 font-semibold">{formatCurrency(total)}</span>
      </p>
    </div>

    <div className="space-y-2.5">
      {categoryOptions.map(({ value, label }) => {
        const amount = distribution[value] || 0;
        const percentage = total ? Math.round((amount / total) * 100) : 0;
        const isFocused = filteredCategory === value;

        return (
          <div
            key={value}
            className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/40 px-3 py-2.5 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onSelectCategory(value)}
                className="text-left flex-1"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-gray-200">{label}</span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    {formatCurrency(amount)}{' '}
                    <span className="text-slate-500 dark:text-gray-400 font-normal text-xs">({percentage}%)</span>
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => onFilterCategory(value)}
                className={`text-xs px-2 py-1 rounded-full border transition ${isFocused
                  ? 'bg-teal-500/20 text-teal-200 border-teal-400/60'
                  : 'text-gray-400 border-slate-600 hover:text-white hover:border-teal-400/50'
                  }`}
              >
                {isFocused ? 'Focused' : 'Focus'}
              </button>
            </div>
            <div className="h-2.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${categoryColors[value] || 'from-teal-500 to-blue-500'}`}
                style={{ width: `${percentage || (total ? 2 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const InvestmentTrendChart = ({
  labels,
  totalSeries,
  categorySeries,
  filteredCategory,
  onFilterCategory
}) => {
  if (!totalSeries.length) {
    return (
      <div className="h-60 bg-slate-100 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-gray-500">
        No performance data available.
      </div>
    );
  }

  const width = 1000;
  const height = 240;
  const labelSpace = 50; // reserve space for y-axis labels
  const paddingX = 26 + labelSpace;
  const paddingY = 18;

  const selectedSeries =
    filteredCategory && categorySeries.find((series) => series.key === filteredCategory);
  const mainSeries = selectedSeries ? selectedSeries.data : (totalSeries.length ? totalSeries : []);
  const pointsCount = mainSeries.length || 1;

  const allValues = selectedSeries
    ? selectedSeries.data.map((point) => point.value)
    : [
      ...totalSeries.map((point) => point.value),
      ...categorySeries.flatMap((series) => series.data.map((point) => point.value)),
    ];
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || maxValue * 0.05 || 1;

  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  const getCoordinates = (points) =>
    points.map((point, index) => {
      const x =
        pointsCount === 1
          ? paddingX + usableWidth / 2
          : paddingX + (index / (pointsCount - 1)) * usableWidth;
      const y =
        height -
        paddingY -
        ((point.value - minValue) / range) * usableHeight;
      return { ...point, x, y };
    });

  const seriesPaths = categorySeries.map((series) => {
    const coordinates = getCoordinates(series.data);
    const linePath = coordinates
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');
    return { ...series, coordinates, linePath };
  });

  const gridLines = Array.from({ length: 4 }, (_, index) => ({
    y: paddingY + (index / 3) * usableHeight,
    value: maxValue - (index / 3) * range
  }));

  const totalCoordinates = getCoordinates(totalSeries);
  const axisCoordinates = getCoordinates(mainSeries);
  const totalLinePath = totalCoordinates
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
  const totalAreaPath = `${totalLinePath} L ${totalCoordinates[totalCoordinates.length - 1]?.x.toFixed(
    2
  )} ${height - paddingY} L ${totalCoordinates[0]?.x.toFixed(2)} ${height - paddingY} Z`;

  const seriesToRender = selectedSeries ? [selectedSeries] : categorySeries;
  const showTotalSeries = !selectedSeries;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48"
          role="img"
          aria-label="Investment performance chart"
        >

          {gridLines.map((line, index) => (
            <g key={`grid-${index}`}>
              <line
                x1={paddingX}
                x2={width - paddingX}
                y1={line.y}
                y2={line.y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text
                x={paddingX - 12}
                y={line.y + 4}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="end"
              >
                {formatCurrency(line.value, { fractionDigits: 0 })}
              </text>
            </g>
          ))}

          <line
            x1={paddingX}
            x2={width - paddingX}
            y1={height - paddingY}
            y2={height - paddingY}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.2"
          />
          {totalCoordinates.map((point) => (
            <g key={`x-label-${point.label}`}>
              <line
                x1={point.x}
                x2={point.x}
                y1={height - paddingY}
                y2={height - paddingY + 6}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={height - paddingY + 18}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="middle"
              >
                {point.label}
              </text>
            </g>
          ))}

          <defs>
            <linearGradient id="portfolioLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5f5" />
            </linearGradient>
            <linearGradient id="portfolioFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(148,163,184,0.35)" />
              <stop offset="100%" stopColor="rgba(15,23,42,0)" />
            </linearGradient>
          </defs>

          {showTotalSeries && (
            <>
              <path d={totalAreaPath} fill="url(#portfolioFill)" opacity={0.5} />
              <path
                d={totalLinePath}
                fill="none"
                stroke="url(#portfolioLine)"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              {totalCoordinates.map((point, index) => (
                <circle
                  key={`total-${point.label}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r={3}
                  fill="#cbd5f5"
                  opacity={0.85}
                />
              ))}
            </>
          )}

          {seriesPaths
            .filter((series) => seriesToRender.some((s) => s.key === series.key))
            .map((series) => {
              const isFocused = filteredCategory === series.key;
              const strokeWidth = isFocused ? 3.5 : filteredCategory ? 1.8 : 2.3;
              const opacity = selectedSeries ? 1 : isFocused ? 1 : filteredCategory ? 0.2 : 0.7;
              return (
                <g key={series.key}>
                  <path
                    d={series.linePath}
                    fill="none"
                    stroke={series.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    opacity={opacity}
                  />
                  {series.coordinates.map((point, idx) => (
                    <circle
                      key={`${series.key}-${point.label}-${idx}`}
                      cx={point.x}
                      cy={point.y}
                      r={isFocused ? 3 : 1.8}
                      fill={series.color}
                      opacity={opacity}
                    />
                  ))}
                </g>
              );
            })}

          {/* X-axis baseline and labels aligned to visible series */}
          <line
            x1={paddingX}
            x2={width - paddingX}
            y1={height - paddingY}
            y2={height - paddingY}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.2"
          />
          {axisCoordinates.map((point) => (
            <g key={`x-label-${point.label}`}>
              <line
                x1={point.x}
                x2={point.x}
                y1={height - paddingY}
                y2={height - paddingY + 6}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={height - paddingY + 18}
                fill="#94a3b8"
                fontSize="11"
                textAnchor="middle"
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex flex-wrap lg:flex-col gap-2 lg:w-44">
        {categorySeries.map((series) => {
          const isActive = filteredCategory === series.key;
          return (
            <button
              key={series.key}
              type="button"
              onClick={() => onFilterCategory(series.key)}
              className={`w-full px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 justify-center transition ${isActive
                ? 'bg-teal-500/10 text-teal-200 border-teal-400/60'
                : 'text-gray-400 border-slate-700/70 hover:text-white hover:border-teal-500/40'
                }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              {series.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

function InvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('month');
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showZakahModal, setShowZakahModal] = useState(false);
  const [zakatResults, setZakatResults] = useState(null);
  const [loadingZakat, setLoadingZakat] = useState(false);
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });
  const [filteredCategory, setFilteredCategory] = useState(null);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [zakahSelections, setZakahSelections] = useState(() =>
    categoryOptions.reduce((acc, { value }) => ({ ...acc, [value]: true }), {})
  );
  const [selectedStock, setSelectedStock] = useState(null);
  const [loadingStockQuote, setLoadingStockQuote] = useState(false);
  const [loadingHistoricalPrice, setLoadingHistoricalPrice] = useState(false);

  // Fetch investments from backend
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        const response = await investmentService.getAllInvestments();

        if (response.success && response.investments) {
          // Transform backend data to frontend format
          let transformedInvestments = response.investments.map((inv) => ({
            id: inv._id,
            name: inv.name,
            category: inv.category,
            purchaseDate: inv.purchaseDate ? new Date(inv.purchaseDate).toISOString().split('T')[0] : '',
            amountOwned: inv.amountOwned,
            unitLabel: inv.unitLabel || getDefaultUnitLabel(inv.category),
            buyPrice: inv.buyPrice,
            currentPrice: inv.currentPrice,
            amount: inv.currentPrice * (inv.amountOwned || 1),
            notes: inv.notes,
            areaSqm: inv.areaSqm,
            symbol: inv.symbol, // For stocks/crypto
          }));

          // Fetch live gold price and update gold investments
          const goldInvestments = transformedInvestments.filter(inv => inv.category === 'Gold');
          if (goldInvestments.length > 0) {
            try {
              const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
              const goldPriceResponse = await fetch(`${API_BASE_URL}/external/gold/price`);
              const goldPriceData = await goldPriceResponse.json();

              if (goldPriceData.success && goldPriceData.price) {
                // Gold price is per gram in SAR
                const liveGoldPrice = goldPriceData.price;
                console.log(`🥇 Live gold price: ${liveGoldPrice} SAR/gram`);

                // Update gold investments with live price
                transformedInvestments = transformedInvestments.map(inv => {
                  if (inv.category === 'Gold') {
                    return {
                      ...inv,
                      currentPrice: liveGoldPrice,
                      amount: liveGoldPrice * (inv.amountOwned || 1),
                    };
                  }
                  return inv;
                });
              }
            } catch (goldError) {
              console.warn('Could not fetch live gold price, using stored values:', goldError);
            }
          }

          setInvestments(transformedInvestments);
        }
      } catch (error) {
        console.error('Failed to fetch investments:', error);
        // Keep empty array on error
        setInvestments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, []);

  // Fetch cities for Real Estate dropdown
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const response = await fetch(`${API_BASE_URL}/cities`);
        const data = await response.json();

        if (data.success && data.cities) {
          setCities(data.cities);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  const totalValue = useMemo(
    () => investments.reduce((sum, investment) => sum + getCurrentValue(investment), 0),
    [investments]
  );
  const totalPurchaseValue = useMemo(
    () => investments.reduce((sum, investment) => sum + getPurchaseValue(investment), 0),
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

  const baseTrendData = useMemo(
    () => buildTrendSeries(selectedRange, totalValue, totalPurchaseValue),
    [selectedRange, totalValue, totalPurchaseValue]
  );

  const categoryTotalsForSeries = useMemo(() => {
    return categoryOptions.reduce((acc, { value }) => {
      const categoryInvestments = investments.filter((inv) => inv.category === value);
      const purchase = categoryInvestments.reduce((sum, inv) => sum + getPurchaseValue(inv), 0);
      const current = categoryInvestments.reduce((sum, inv) => sum + getCurrentValue(inv), 0);
      acc[value] = { current, purchase };
      return acc;
    }, {});
  }, [investments]);

  const categorySeries = useMemo(() => {
    const labels = getDynamicRangeLabels(selectedRange);
    return categoryOptions.map(({ value, label }) => {
      const { current = 0, purchase = 0 } = categoryTotalsForSeries[value] || {};
      const data = buildTrendSeries(selectedRange, current, purchase, labels);
      return {
        key: value,
        label,
        color: categoryLineColors[value] || '#2dd4bf',
        data,
      };
    });
  }, [selectedRange, categoryTotalsForSeries]);

  const trendStatsData = filteredCategory
    ? categorySeries.find((series) => series.key === filteredCategory)?.data || []
    : baseTrendData;

  const trendStats = useMemo(() => {
    if (!trendStatsData.length) {
      return { latest: 0, changeAbs: 0, changePct: 0 };
    }
    const first = trendStatsData[0].value;
    const last = trendStatsData[trendStatsData.length - 1].value;
    const changeAbs = last - first;
    const changePct = first ? (changeAbs / first) * 100 : 0;
    return { latest: last, changeAbs, changePct };
  }, [trendStatsData]);
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
  const filteredCategoryLabel = filteredCategory ? getCategoryLabel(filteredCategory) : 'All categories';

  const handleFilterCategory = (category) => {
    setFilteredCategory((prev) => (prev === category ? null : category));
  };

  const handleToggleZakahCategory = (category) => {
    setZakahSelections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSelectAllZakah = () => {
    setZakahSelections(categoryOptions.reduce((acc, { value }) => ({ ...acc, [value]: true }), {}));
  };

  const handleCalculateZakat = async () => {
    try {
      setLoadingZakat(true);
      const result = await zakatService.calculateZakat();

      if (result.success) {
        setZakatResults(result);
        // Close the old simple modal and open the detailed results modal
        setShowZakahModal(false);
      } else {
        alert(result.error || 'Failed to calculate Zakat');
      }
    } catch (error) {
      console.error('Error calculating Zakat:', error);
      alert(error.message || 'Failed to calculate Zakat. Please try again.');
    } finally {
      setLoadingZakat(false);
    }
  };

  const zakahBase = useMemo(
    () =>
      categoryOptions.reduce(
        (sum, { value }) => (zakahSelections[value] ? sum + (distribution[value] || 0) : sum),
        0
      ),
    [zakahSelections, distribution]
  );
  const zakahAmount = zakahBase * 0.025;

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
      location: '',
      propertyType: 'Villa',
    }));
    setErrors({});
    setSelectedStock(null);
  };

  const handleStockSelected = async (stock) => {
    setSelectedStock(stock);
    setForm((prev) => ({
      ...prev,
      name: `${stock.name} (${stock.symbol})`,
    }));

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    // Fetch current stock quote
    try {
      setLoadingStockQuote(true);
      const response = await fetch(`${API_BASE_URL}/stocks/quote/${stock.symbol}`);
      const data = await response.json();

      if (data.success && data.quote) {
        // Set current price from API
        const price = data.quote.price.toString();
        setForm((prev) => ({
          ...prev,
          currentPrice: price,
        }));
      }
    } catch (error) {
      console.error('Error fetching stock quote:', error);
    } finally {
      setLoadingStockQuote(false);
    }

    // If purchase date is already set, fetch historical price
    if (form.purchaseDate && isValidDate(form.purchaseDate)) {
      try {
        setLoadingHistoricalPrice(true);
        const response = await fetch(
          `${API_BASE_URL}/stocks/historical/${stock.symbol}/${form.purchaseDate}`
        );
        const data = await response.json();

        if (data.success && data.historical) {
          // Use adjusted close to account for stock splits
          setForm((prev) => ({
            ...prev,
            buyPrice: data.historical.adjustedClose.toString(),
          }));
          setErrors((prev) => ({ ...prev, buyPrice: '', purchaseDate: '' }));
        } else {
          setErrors((prev) => ({
            ...prev,
            purchaseDate: data.error || 'No historical data available for this date',
          }));
          setForm((prev) => ({ ...prev, buyPrice: '' }));
        }
      } catch (error) {
        console.error('Error fetching historical price:', error);
        setErrors((prev) => ({
          ...prev,
          purchaseDate: 'Could not fetch historical price for this date',
        }));
        setForm((prev) => ({ ...prev, buyPrice: '' }));
      } finally {
        setLoadingHistoricalPrice(false);
      }
    }
  };

  const handleCryptoSelected = async (crypto) => {
    setSelectedStock(crypto); // Reuse selectedStock state for crypto as well
    setForm((prev) => ({
      ...prev,
      name: `${crypto.name} (${crypto.symbol})`,
    }));

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    // Fetch current crypto quote
    try {
      setLoadingStockQuote(true);
      const response = await fetch(`${API_BASE_URL}/crypto/quote/${crypto.symbol}`);
      const data = await response.json();

      if (data.success && data.quote) {
        // Set current price from API
        const price = data.quote.price.toString();
        setForm((prev) => ({
          ...prev,
          currentPrice: price,
        }));
      }
    } catch (error) {
      console.error('Error fetching crypto quote:', error);
    } finally {
      setLoadingStockQuote(false);
    }

    // If purchase date is already set, fetch historical price
    if (form.purchaseDate && isValidDate(form.purchaseDate)) {
      try {
        setLoadingHistoricalPrice(true);
        const response = await fetch(
          `${API_BASE_URL}/crypto/historical/${crypto.symbol}/${form.purchaseDate}`
        );
        const data = await response.json();

        if (data.success && data.historical) {
          // Use adjusted close
          setForm((prev) => ({
            ...prev,
            buyPrice: data.historical.adjustedClose.toString(),
          }));
          setErrors((prev) => ({ ...prev, buyPrice: '', purchaseDate: '' }));
        } else {
          setErrors((prev) => ({
            ...prev,
            purchaseDate: data.error || 'No historical data available for this date',
          }));
          setForm((prev) => ({ ...prev, buyPrice: '' }));
        }
      } catch (error) {
        console.error('Error fetching historical crypto price:', error);
        setErrors((prev) => ({
          ...prev,
          purchaseDate: 'Could not fetch historical price for this date',
        }));
        setForm((prev) => ({ ...prev, buyPrice: '' }));
      } finally {
        setLoadingHistoricalPrice(false);
      }
    }
  };

  const handlePurchaseDateChange = async (event) => {
    const purchaseDate = event.target.value;
    setForm((prev) => ({ ...prev, purchaseDate }));

    if (errors.purchaseDate) {
      setErrors((prev) => ({ ...prev, purchaseDate: '' }));
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    // If stock is selected and date is valid, fetch historical price
    if (selectedStock && purchaseDate && form.category === 'Stock' && isValidDate(purchaseDate)) {
      try {
        setLoadingHistoricalPrice(true);
        const response = await fetch(
          `${API_BASE_URL}/stocks/historical/${selectedStock.symbol}/${purchaseDate}`
        );
        const data = await response.json();

        if (data.success && data.historical) {
          // Use adjusted close to account for stock splits
          setForm((prev) => ({
            ...prev,
            buyPrice: data.historical.adjustedClose.toString(),
          }));
          // Clear any previous errors
          setErrors((prev) => ({ ...prev, buyPrice: '', purchaseDate: '' }));
        } else {
          // Handle case where no data is available for this date
          setErrors((prev) => ({
            ...prev,
            purchaseDate: data.error || 'No historical data available for this date',
          }));
          setForm((prev) => ({ ...prev, buyPrice: '' }));
        }
      } catch (error) {
        console.error('Error fetching historical price:', error);
        setErrors((prev) => ({
          ...prev,
          purchaseDate: 'Could not fetch historical price for this date',
        }));
        setForm((prev) => ({ ...prev, buyPrice: '' }));
      } finally {
        setLoadingHistoricalPrice(false);
      }
    }

    // If crypto is selected and date is valid, fetch historical price
    if (selectedStock && purchaseDate && form.category === 'Crypto' && isValidDate(purchaseDate)) {
      try {
        setLoadingHistoricalPrice(true);
        const response = await fetch(
          `${API_BASE_URL}/crypto/historical/${selectedStock.symbol}/${purchaseDate}`
        );
        const data = await response.json();

        if (data.success && data.historical) {
          // Use adjusted close
          setForm((prev) => ({
            ...prev,
            buyPrice: data.historical.adjustedClose.toString(),
          }));
          // Clear any previous errors
          setErrors((prev) => ({ ...prev, buyPrice: '', purchaseDate: '' }));
        } else {
          // Handle case where no data is available for this date
          setErrors((prev) => ({
            ...prev,
            purchaseDate: data.error || 'No historical data available for this date',
          }));
          setForm((prev) => ({ ...prev, buyPrice: '' }));
        }
      } catch (error) {
        console.error('Error fetching historical crypto price:', error);
        setErrors((prev) => ({
          ...prev,
          purchaseDate: 'Could not fetch historical price for this date',
        }));
        setForm((prev) => ({ ...prev, buyPrice: '' }));
      } finally {
        setLoadingHistoricalPrice(false);
      }
    }

    // If Gold is selected and date is valid, fetch gold prices
    if (purchaseDate && form.category === 'Gold' && isValidDate(purchaseDate)) {
      try {
        setLoadingHistoricalPrice(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/gold/prices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ purchaseDate }),
        });
        const data = await response.json();

        if (data.success && data.prices) {
          setForm((prev) => ({
            ...prev,
            buyPrice: data.prices.purchasePrice.toString(),
            currentPrice: data.prices.currentPrice.toString(),
          }));
          setErrors((prev) => ({ ...prev, buyPrice: '', currentPrice: '', purchaseDate: '' }));
        } else {
          setErrors((prev) => ({
            ...prev,
            purchaseDate: data.error || 'Could not fetch gold prices for this date',
          }));
          setForm((prev) => ({ ...prev, buyPrice: '', currentPrice: '' }));
        }
      } catch (error) {
        console.error('Error fetching gold prices:', error);
        setErrors((prev) => ({
          ...prev,
          purchaseDate: 'Could not fetch gold prices for this date',
        }));
        setForm((prev) => ({ ...prev, buyPrice: '', currentPrice: '' }));
      } finally {
        setLoadingHistoricalPrice(false);
      }
    }
  };

  const handleAddInvestment = async (event) => {
    event.preventDefault();
    const validationErrors = {};
    const trimmedName = form.name.trim();
    const isRealEstate = form.category === 'Real Estate';
    const hasPurchaseDate = isValidDate(form.purchaseDate);

    if (!trimmedName) {
      validationErrors.name = 'Name is required';
    }
    if (!hasPurchaseDate) {
      validationErrors.purchaseDate = 'Enter a valid purchase date (not in the future)';
    }

    const amountOwnedValue = parseFloat(form.amountOwned);
    const areaValue = parseFloat(form.areaSqm);
    const buyPriceValue = parseFloat(form.buyPrice);
    const currentPriceValue = parseFloat(form.currentPrice);

    if (isRealEstate) {
      if (!form.latitude || !form.longitude) {
        validationErrors.location = 'Please select a location on the map';
      }
      if (!areaValue || areaValue <= 0) {
        validationErrors.areaSqm = 'Area is required';
      }
      if (!form.propertyType) {
        validationErrors.propertyType = 'Property type is required';
      }
      // Purchase price is mandatory for Real Estate
      if (!buyPriceValue || buyPriceValue <= 0) {
        validationErrors.buyPrice = 'Purchase price is required';
      }
    } else {
      if (!amountOwnedValue || amountOwnedValue <= 0) {
        validationErrors.amountOwned = 'Enter the amount owned';
      }
      if (!buyPriceValue || buyPriceValue <= 0) {
        if (form.category === 'Stock') {
          validationErrors.purchaseDate = 'Select a valid purchase date to fetch historical price';
        } else if (form.category === 'Crypto') {
          validationErrors.purchaseDate = 'Select a purchase date to fetch crypto prices';
        } else if (form.category === 'Gold') {
          validationErrors.purchaseDate = 'Select a purchase date to fetch gold prices';
        } else {
          validationErrors.buyPrice = 'Enter purchase price';
        }
      }
      if (!currentPriceValue || currentPriceValue <= 0) {
        if (form.category === 'Gold') {
          validationErrors.purchaseDate =
            validationErrors.purchaseDate || 'Select a purchase date to fetch gold prices';
        } else if (form.category === 'Stock') {
          validationErrors.currentPrice = 'Search for a stock to fetch current price';
        } else if (form.category === 'Crypto') {
          validationErrors.currentPrice = 'Search for a crypto to fetch current price';
        } else {
          validationErrors.currentPrice = "Enter today's price";
        }
      }
    }

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    // Prepare data for backend API
    const investmentData = {
      name: trimmedName,
      category: form.category,
      purchaseDate: form.purchaseDate,
      notes: form.notes || '',
    };

    if (isRealEstate) {
      // Call Groq API via backend to get valuation
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const token = localStorage.getItem('token');

        const estimateResponse = await fetch(`${API_BASE_URL}/real-estate/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude: form.latitude,
            longitude: form.longitude,
            propertyType: form.propertyType,
            area: areaValue,
          }),
        });

        const estimateData = await estimateResponse.json();

        if (!estimateData.success) {
          throw new Error(estimateData.error || 'Failed to get property valuation');
        }

        const estimatedValue = estimateData.estimate.value;

        investmentData.latitude = form.latitude;
        investmentData.longitude = form.longitude;
        investmentData.areaSqm = areaValue;
        investmentData.propertyType = form.propertyType;
        investmentData.amountOwned = 1; // Backend requires this field

        // Store user's purchase price if provided; otherwise leave null
        investmentData.buyPrice = buyPriceValue || null;
        // Store Groq estimate as today's market value
        investmentData.currentPrice = estimatedValue;
      } catch (error) {
        console.error('Error fetching real estate valuation:', error);
        setErrors({ general: error.message || 'Failed to get property valuation. Please try again.' });
        return;
      }
    } else {
      investmentData.amountOwned = amountOwnedValue;
      investmentData.buyPrice = buyPriceValue;
      investmentData.currentPrice = currentPriceValue;

      // Store symbol for stocks/crypto to enable historical data fetching
      if ((form.category === 'Stock' || form.category === 'Crypto') && selectedStock) {
        investmentData.symbol = selectedStock.symbol;
      }
    }

    try {
      // Save to backend
      const response = await investmentService.createInvestment(investmentData);

      if (response.success && response.investment) {
        // Transform and add to local state
        const inv = response.investment;
        const transformedInvestment = {
          id: inv._id,
          name: inv.name,
          category: inv.category,
          purchaseDate: inv.purchaseDate ? new Date(inv.purchaseDate).toISOString().split('T')[0] : '',
          amountOwned: inv.amountOwned,
          unitLabel: getDefaultUnitLabel(inv.category),
          buyPrice: inv.buyPrice,
          currentPrice: inv.currentPrice,
          amount: inv.currentPrice * (inv.amountOwned || 1),
          notes: inv.notes,
          areaSqm: inv.areaSqm,
          symbol: inv.symbol, // For stocks/crypto
        };

        setInvestments((prev) => [...prev, transformedInvestment]);
        setForm((prev) => ({
          ...initialFormState,
          category: prev.category,
        }));
        setErrors({});
        setShowAddModal(false);
      } else {
        setErrors({ general: response.error || 'Failed to create investment' });
      }
    } catch (error) {
      console.error('Error creating investment:', error);
      setErrors({ general: error.message || 'Failed to create investment. Please try again.' });
    }
  };

  // Show full-page spinner while initial data is loading
  if (loading) {
    return (
      <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100 pt-20">
        <Sidebar />
        <div className="flex-1 ml-64 px-5 py-6">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-teal-500/20 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-teal-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 w-12 h-12 bg-teal-500/10 rounded-full animate-pulse"></div>
              </div>
              <p className="text-gray-400 text-sm animate-pulse">Loading investments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-page text-slate-900 dark:text-slate-100 pt-20">
        <Sidebar />

        <div className="flex-1 ml-64 px-5 py-6">
          <div className="w-full max-w-5xl space-y-5">
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


            <section className="bg-white dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-lg dark:shadow-xl transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-gray-400">
                    Performance
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Portfolio over time</h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
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
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${isActive
                          ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-400/40 shadow-[0_0_25px_rgba(94,234,212,0.3)]'
                          : 'text-slate-500 dark:text-gray-400 border-slate-300 dark:border-slate-700/70 hover:text-slate-900 dark:hover:text-white hover:border-teal-500/40'
                          }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 space-y-3">
                <ProfessionalInvestmentChart
                  investments={investments}
                  selectedRange={selectedRange}
                  filteredCategory={filteredCategory}
                  onFilterCategory={handleFilterCategory}
                />
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-gray-400">Latest value</p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
                      {formatCurrency(trendStats.latest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-gray-400">Change</p>
                    <p
                      className={`text-lg font-semibold ${trendStats.changeAbs >= 0 ? 'text-teal-300' : 'text-rose-400'
                        }`}
                    >
                      {formatSignedCurrency(trendStats.changeAbs)}{' '}
                      <span className="text-sm text-gray-400">
                        ({trendStats.changePct >= 0 ? '+' : ''}
                        {trendStats.changePct.toFixed(2)}%)
                      </span>
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 ml-auto">
                    Viewing · <span className="text-teal-200">{filteredCategoryLabel}</span>
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-lg dark:shadow-xl transition-colors">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-gray-400">Investment Allocation</p>
                </div>
              </div>
              <InvestmentChart
                distribution={distribution}
                total={totalValue}
                onSelectCategory={handleOpenCategoryModal}
                onFilterCategory={handleFilterCategory}
                filteredCategory={filteredCategory}
              />
            </section>

            <section className="bg-white dark:bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-lg dark:shadow-xl transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-gray-400">Zakah Calculator</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Calculate Zakat based on Saudi Arabian regulations (2.5% rate, Nisab threshold)</p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  className="px-4"
                  onClick={handleCalculateZakat}
                  disabled={loadingZakat || investments.length === 0}
                >
                  {loadingZakat ? 'Calculating...' : 'Calculate Zakah'}
                </Button>
              </div>
            </section>

          </div>
        </div>
      </div>
      <FloatingActionButton onClick={() => setShowAddModal(true)} />

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add investment"
        subtitle="Track a new asset across stocks, property, crypto, or gold."
        maxWidth="max-w-3xl"
      >
        <form className="space-y-4" onSubmit={handleAddInvestment}>
          {/* Type selector - FIRST FIELD */}
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

          {/* Category-specific name/search fields */}
          {form.category === 'Stock' ? (
            <div className="space-y-4">
              <StockSearchInput
                onStockSelected={handleStockSelected}
                initialValue={selectedStock ? selectedStock.symbol : ''}
              />
              {selectedStock && (
                <InputField
                  label="Investment name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange('name')}
                  placeholder="e.g., Tech Growth ETF"
                  error={errors.name}
                />
              )}
              {loadingStockQuote && (
                <p className="text-sm text-teal-300">Fetching current stock price...</p>
              )}
            </div>
          ) : form.category === 'Crypto' ? (
            <div className="space-y-4">
              <CryptoSearchInput
                onCryptoSelected={handleCryptoSelected}
                initialValue={selectedStock ? selectedStock.symbol : ''}
              />
              {selectedStock && (
                <InputField
                  label="Investment name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange('name')}
                  placeholder="e.g., Bitcoin Portfolio"
                  error={errors.name}
                />
              )}
              {loadingStockQuote && (
                <p className="text-sm text-teal-300">Fetching current crypto price...</p>
              )}
            </div>
          ) : (
            <InputField
              label="Investment name"
              name="name"
              value={form.name}
              onChange={handleFormChange('name')}
              placeholder="e.g., Tech Growth ETF"
              error={errors.name}
            />
          )}

          <InputField
            label="Purchase date"
            type="date"
            name="purchaseDate"
            value={form.purchaseDate}
            onChange={
              form.category === 'Stock' || form.category === 'Gold' || form.category === 'Crypto'
                ? handlePurchaseDateChange
                : handleFormChange('purchaseDate')
            }
            placeholder="Select purchase date"
            error={errors.purchaseDate}
          />
          {loadingHistoricalPrice && (
            <p className="text-sm text-teal-300">
              {form.category === 'Gold'
                ? `Fetching gold prices for ${form.purchaseDate}...`
                : form.category === 'Crypto'
                  ? `Fetching historical crypto price for ${form.purchaseDate}...`
                  : `Fetching historical stock price for ${form.purchaseDate}...`}
            </p>
          )}
          {form.category === 'Gold' && (
            <p className="text-xs text-gray-400">
              Gold prices are auto-fetched after you pick a purchase date.
            </p>
          )}
          {form.category === 'Crypto' && (
            <p className="text-xs text-gray-400">
              Crypto prices are auto-fetched after you pick a purchase date.
            </p>
          )}

          {isRealEstateSelected ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Property Location on Map <span className="text-red-400">*</span>
                </label>
                <MapSelector
                  onLocationSelect={(position) => {
                    setForm((prev) => ({
                      ...prev,
                      latitude: position.lat,
                      longitude: position.lng,
                    }));
                    if (errors.location) {
                      setErrors((prev) => ({ ...prev, location: '' }));
                    }
                  }}
                  initialPosition={
                    form.latitude && form.longitude
                      ? { lat: form.latitude, lng: form.longitude }
                      : null
                  }
                />
                {errors.location && (
                  <p className="text-sm text-red-400 mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Property Type
                </label>
                <select
                  value={form.propertyType}
                  onChange={handleFormChange('propertyType')}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Land">Land</option>
                </select>
              </div>

              <InputField
                label="Area (m²)"
                type="number"
                name="areaSqm"
                value={form.areaSqm}
                onChange={handleFormChange('areaSqm', true)}
                placeholder="e.g., 320"
                error={errors.areaSqm}
              />

              <InputField
                label="Purchase price (optional)"
                type="number"
                name="buyPrice"
                value={form.buyPrice}
                onChange={handleFormChange('buyPrice', true)}
                placeholder="e.g., 720000 - Leave blank to use estimated value"
                error={errors.buyPrice}
              />
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

              {form.category === 'Stock' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Purchase price / unit (from API)
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-700/30 border border-slate-600 rounded-md text-white">
                    {form.buyPrice ? `$${parseFloat(form.buyPrice).toFixed(2)}` : 'Select purchase date to fetch price'}
                  </div>
                  {form.buyPrice && (
                    <p className="text-xs text-gray-400 mt-1">
                      Historical price automatically fetched from Yahoo Finance (adjusted for splits)
                    </p>
                  )}
                </div>
              ) : form.category === 'Crypto' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Purchase price / unit (from API)
                  </label>
                  <div className="w-full px-3 py-2 bg-slate-700/30 border border-slate-600 rounded-md text-white">
                    {form.buyPrice ? `$${parseFloat(form.buyPrice).toFixed(2)}` : 'Select purchase date to fetch price'}
                  </div>
                  {form.buyPrice && (
                    <p className="text-xs text-gray-400 mt-1">
                      Historical price automatically fetched from Yahoo Finance
                    </p>
                  )}
                </div>
              ) : form.category === 'Gold' ? null : (
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
              )}
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
        isOpen={showZakahModal}
        onClose={() => setShowZakahModal(false)}
        title="Calculate zakah"
        subtitle="Select which categories should be included (2.5% of selected assets)."
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-300">
              Currently selected categories contribute{' '}
              <span className="text-teal-200 font-semibold">
                {formatCurrency(zakahBase)}
              </span>{' '}
              to zakatable wealth.
            </p>
            <button
              type="button"
              onClick={handleSelectAllZakah}
              className="text-xs px-3 py-1 rounded-full border border-slate-600 text-gray-300 hover:text-white hover:border-teal-400/60 transition"
            >
              Select all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryOptions.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 rounded-lg border border-slate-700/60 bg-slate-900/30 px-4 py-3 text-sm text-gray-200 cursor-pointer hover:border-teal-500/50 transition"
              >
                <input
                  type="checkbox"
                  checked={zakahSelections[value]}
                  onChange={() => handleToggleZakahCategory(value)}
                  className="h-4 w-4 rounded border-slate-600 text-teal-500 focus:ring-teal-400"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Zakah due</p>
              <p className="text-2xl font-semibold text-teal-200 mt-1">
                {formatCurrency(zakahAmount, { fractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 text-right">Rate</p>
              <p className="text-lg font-semibold text-white mt-1 text-right">2.5%</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowZakahModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setShowZakahModal(false)}>
              Done
            </Button>
          </div>
        </div>
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
                  className={`text-lg font-semibold ${categoryTotals.diff >= 0 ? 'text-teal-300' : 'text-rose-400'
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
                          className={`text-xs font-semibold ${diff >= 0 ? 'text-teal-300' : 'text-rose-400'
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
                          <p>Purchased on: {formatDate(investment.purchaseDate)}</p>
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
                          <p>Purchased on: {formatDate(investment.purchaseDate)}</p>
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

      <ZakatResultsModal
        isOpen={!!zakatResults}
        onClose={() => setZakatResults(null)}
        zakatData={zakatResults}
      />
    </>
  );
}

export default InvestmentsPage;
