import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';

const categoryColors = {
  Stock: '#2dd4bf',
  'Real Estate': '#34d399',
  Crypto: '#fb923c',
  Gold: '#facc15',
};

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `SAR ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `SAR ${(value / 1000).toFixed(1)}K`;
  }
  return `SAR ${value.toFixed(0)}`;
};

const formatTooltipCurrency = (value) => {
  return value.toLocaleString('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Generate realistic time-series data with smooth trends and variations
 */
const generateTimeSeriesData = (rangeKey, currentValue, purchaseValue, purchaseDate) => {
  const now = new Date();
  const purchase = purchaseDate ? new Date(purchaseDate) : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  let dataPoints = [];
  let startValue = purchaseValue > 0 ? purchaseValue : currentValue * 0.85;
  let endValue = currentValue;

  // Generate smooth progression with realistic market-like variations
  const generateSmoothValue = (progress, startVal, endVal, volatility = 0.02) => {
    // Base progression using sigmoid curve for smooth acceleration/deceleration
    const smoothProgress = 1 / (1 + Math.exp(-10 * (progress - 0.5)));
    const baseValue = startVal + (endVal - startVal) * smoothProgress;

    // Add cyclical patterns (market cycles)
    const cycle1 = Math.sin(progress * Math.PI * 4) * volatility * baseValue;
    const cycle2 = Math.sin(progress * Math.PI * 8) * volatility * 0.5 * baseValue;

    // Add random noise
    const noise = (Math.random() - 0.5) * volatility * baseValue;

    return Math.max(0, baseValue + cycle1 + cycle2 + noise);
  };

  switch (rangeKey) {
    case 'day': {
      // Last 24 hours - hourly data points
      const hoursBack = 24;
      for (let i = hoursBack; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const progress = (hoursBack - i) / hoursBack;
        const value = generateSmoothValue(progress, startValue, endValue, 0.015);
        dataPoints.push({
          x: timestamp.getTime(),
          y: value
        });
      }
      break;
    }

    case 'threeDays': {
      // Last 3 days - 4-hour intervals
      const hours = 3 * 24;
      const interval = 4;
      for (let i = hours; i >= 0; i -= interval) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const progress = (hours - i) / hours;
        const value = generateSmoothValue(progress, startValue, endValue, 0.018);
        dataPoints.push({
          x: timestamp.getTime(),
          y: value
        });
      }
      break;
    }

    case 'week': {
      // Last 7 days - daily data points
      const days = 7;
      for (let i = days; i >= 0; i--) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - i);
        timestamp.setHours(12, 0, 0, 0);
        const progress = (days - i) / days;
        const value = generateSmoothValue(progress, startValue, endValue, 0.020);
        dataPoints.push({
          x: timestamp.getTime(),
          y: value
        });
      }
      break;
    }

    case 'month': {
      // Last 30 days - daily data points
      const days = 30;
      for (let i = days; i >= 0; i--) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - i);
        timestamp.setHours(12, 0, 0, 0);
        const progress = (days - i) / days;
        const value = generateSmoothValue(progress, startValue, endValue, 0.025);
        dataPoints.push({
          x: timestamp.getTime(),
          y: value
        });
      }
      break;
    }

    case 'year': {
      // Last 12 months - weekly data points
      const weeks = 52;
      for (let i = weeks; i >= 0; i--) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - i * 7);
        timestamp.setHours(12, 0, 0, 0);
        const progress = (weeks - i) / weeks;
        const value = generateSmoothValue(progress, startValue, endValue, 0.030);
        dataPoints.push({
          x: timestamp.getTime(),
          y: value
        });
      }
      break;
    }

    case 'fiveYears': {
      // Last 5 years - monthly data points
      const months = 60;
      for (let i = months; i >= 0; i--) {
        const timestamp = new Date(now);
        timestamp.setMonth(now.getMonth() - i);
        timestamp.setDate(1);
        timestamp.setHours(12, 0, 0, 0);
        const progress = (months - i) / months;
        const value = generateSmoothValue(progress, startValue, endValue, 0.035);
        dataPoints.push({
          x: timestamp.getTime(),
          y: value
        });
      }
      break;
    }

    case 'allTime': {
      // From purchase date to now - adaptive sampling
      const daysDiff = Math.max(1, Math.floor((now - purchase) / (1000 * 60 * 60 * 24)));
      const totalPoints = Math.min(100, Math.max(20, daysDiff));

      for (let i = 0; i <= totalPoints; i++) {
        const progress = i / totalPoints;
        const timestamp = new Date(purchase.getTime() + (now.getTime() - purchase.getTime()) * progress);
        const value = generateSmoothValue(progress, startValue, endValue, 0.040);
        dataPoints.push({
          x: timestamp.getTime(),
          y: value
        });
      }
      break;
    }

    default:
      dataPoints = [
        { x: purchase.getTime(), y: startValue },
        { x: now.getTime(), y: endValue }
      ];
  }

  return dataPoints;
};

/**
 * Professional Investment Chart Component
 * Mimics TradingView/Yahoo Finance style charts
 */
const ProfessionalInvestmentChart = ({
  investments = [],
  selectedRange = 'month',
  filteredCategory = null,
  onFilterCategory,
}) => {
  // Calculate totals and prepare series data
  const chartData = useMemo(() => {
    if (!investments.length) {
      return { series: [], totalValue: 0, purchaseValue: 0 };
    }

    const now = new Date();
    let totalCurrentValue = 0;
    let totalPurchaseValue = 0;
    let earliestPurchaseDate = now;

    // Calculate totals
    investments.forEach((inv) => {
      const currentValue = inv.currentPrice * (inv.amountOwned || 1);
      const purchaseValue = inv.buyPrice * (inv.amountOwned || 1);

      totalCurrentValue += currentValue;
      totalPurchaseValue += purchaseValue;

      if (inv.purchaseDate) {
        const purchaseDate = new Date(inv.purchaseDate);
        if (purchaseDate < earliestPurchaseDate) {
          earliestPurchaseDate = purchaseDate;
        }
      }
    });

    // If filtering by category, show only that category
    if (filteredCategory) {
      const categoryInvestments = investments.filter(inv => inv.category === filteredCategory);

      let categoryCurrent = 0;
      let categoryPurchase = 0;
      let categoryEarliestDate = now;

      categoryInvestments.forEach((inv) => {
        categoryCurrent += inv.currentPrice * (inv.amountOwned || 1);
        categoryPurchase += inv.buyPrice * (inv.amountOwned || 1);

        if (inv.purchaseDate) {
          const purchaseDate = new Date(inv.purchaseDate);
          if (purchaseDate < categoryEarliestDate) {
            categoryEarliestDate = purchaseDate;
          }
        }
      });

      const data = generateTimeSeriesData(
        selectedRange,
        categoryCurrent,
        categoryPurchase,
        categoryEarliestDate
      );

      return {
        series: [{
          name: filteredCategory,
          data,
          color: categoryColors[filteredCategory] || '#2dd4bf'
        }],
        totalValue: categoryCurrent,
        purchaseValue: categoryPurchase
      };
    }

    // Show total portfolio
    const totalData = generateTimeSeriesData(
      selectedRange,
      totalCurrentValue,
      totalPurchaseValue,
      earliestPurchaseDate
    );

    return {
      series: [{
        name: 'Total Portfolio',
        data: totalData,
        color: '#94a3b8'
      }],
      totalValue: totalCurrentValue,
      purchaseValue: totalPurchaseValue
    };
  }, [investments, selectedRange, filteredCategory]);

  // ApexCharts configuration
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'area',
      height: 350,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      lineCap: 'round'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    grid: {
      show: true,
      borderColor: 'rgba(255, 255, 255, 0.05)',
      strokeDashArray: 3,
      position: 'back',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
          fontFamily: 'inherit'
        },
        datetimeUTC: false,
        format: selectedRange === 'day' ? 'HH:mm' :
          selectedRange === 'threeDays' || selectedRange === 'week' ? 'MMM dd' :
            selectedRange === 'month' ? 'MMM dd' :
              selectedRange === 'year' ? 'MMM yyyy' :
                'yyyy'
      },
      axisBorder: {
        show: true,
        color: 'rgba(255, 255, 255, 0.08)',
        height: 1
      },
      axisTicks: {
        show: true,
        color: 'rgba(255, 255, 255, 0.2)',
        height: 6
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '11px',
          fontFamily: 'inherit'
        },
        formatter: (value) => formatCurrency(value)
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const timestamp = w.config.series[seriesIndex].data[dataPointIndex].x;
        const value = series[seriesIndex][dataPointIndex];
        const seriesName = w.config.series[seriesIndex].name;
        const color = w.config.series[seriesIndex].color;

        const date = new Date(timestamp);
        let dateStr = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        if (selectedRange === 'day') {
          dateStr = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          });
        }

        return `
          <div style="
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          ">
            <div style="
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;
            ">
              <div style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${color};
                box-shadow: 0 0 8px ${color};
              "></div>
              <span style="
                color: #e2e8f0;
                font-size: 13px;
                font-weight: 600;
              ">${seriesName}</span>
            </div>
            <div style="
              color: #cbd5e1;
              font-size: 11px;
              margin-bottom: 6px;
            ">${dateStr}</div>
            <div style="
              color: #5eead4;
              font-size: 18px;
              font-weight: 700;
              letter-spacing: -0.5px;
            ">${formatTooltipCurrency(value)}</div>
          </div>
        `;
      }
    },
    legend: {
      show: false
    },
    colors: chartData.series.map(s => s.color),
    markers: {
      size: 0,
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeColors: '#0f172a',
      fillOpacity: 1,
      hover: {
        size: 6,
        sizeOffset: 3
      }
    },
    theme: {
      mode: 'dark'
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        }
      }
    }]
  }), [chartData.series, selectedRange]);

  if (!investments.length) {
    return (
      <div className="h-[350px] bg-slate-900/40 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-semibold mb-1">No investment data available</p>
          <p className="text-sm">Add investments to visualize your portfolio performance</p>
        </div>
      </div>
    );
  }

  // Category options for filtering
  const categoryOptions = [
    { value: 'Stock', label: 'Stocks' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Crypto', label: 'Crypto' },
    { value: 'Gold', label: 'Gold' },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Chart
            options={chartOptions}
            series={chartData.series}
            type="area"
            height={350}
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap lg:flex-col gap-2 lg:w-44">
          <button
            type="button"
            onClick={() => onFilterCategory && onFilterCategory(null)}
            className={`w-full px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 justify-center transition ${!filteredCategory
                ? 'bg-teal-500/10 text-teal-200 border-teal-400/60'
                : 'text-gray-400 border-slate-700/70 hover:text-white hover:border-teal-500/40'
              }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: '#94a3b8' }}
            />
            All Assets
          </button>

          {categoryOptions.map(({ value, label }) => {
            const isActive = filteredCategory === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onFilterCategory && onFilterCategory(value)}
                className={`w-full px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 justify-center transition ${isActive
                    ? 'bg-teal-500/10 text-teal-200 border-teal-400/60'
                    : 'text-gray-400 border-slate-700/70 hover:text-white hover:border-teal-500/40'
                  }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryColors[value] }}
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalInvestmentChart;
