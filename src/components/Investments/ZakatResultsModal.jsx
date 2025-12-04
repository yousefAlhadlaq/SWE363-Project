import { useState } from 'react';
import Modal from '../Shared/Modal';
import Button from '../Shared/Button';

const formatCurrency = (value, options = {}) => {
  const { fractionDigits = 0 } = options;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value).replace('SAR', 'SAR');
};

const ZakatResultsModal = ({ isOpen, onClose, zakatData }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!zakatData) return null;

  // Handle error response from backend
  if (!zakatData.calculation) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Zakat Calculation Error"
        maxWidth="max-w-md"
      >
        <div className="text-center py-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Calculation Failed
          </h3>
          <p className="text-gray-400 mb-6">
            {zakatData.error || 'Unable to calculate Zakat. Please try again.'}
          </p>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  const { calculation } = zakatData;
  const {
    goldNisabValue,
    goldNisabGrams,
    currentGoldPricePerGram,
    zakatRate,
    meetsNisab,
    nisabStatus,
    totalLiquidAssets,
    totalZakatable,
    totalZakat,
    categoryBreakdown
  } = calculation;

  const categories = [
    { key: 'realEstate', label: 'Real Estate', color: 'bg-blue-500', icon: '🏘️' },
    { key: 'stocks', label: 'Stocks', color: 'bg-green-500', icon: '📈' },
    { key: 'crypto', label: 'Crypto', color: 'bg-purple-500', icon: '₿' },
    { key: 'gold', label: 'Gold', color: 'bg-yellow-500', icon: '🪙' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Zakat Calculation Results"
      subtitle="Based on Saudi Arabian Zakat regulations (Hijri Year, 2.5% rate)"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        {/* Nisab Status Banner */}
        <div className={`rounded-lg border p-4 ${meetsNisab
            ? 'bg-teal-500/10 border-teal-500/50'
            : 'bg-amber-500/10 border-amber-500/50'
          }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{meetsNisab ? '✓' : '⚠️'}</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                {meetsNisab ? 'Zakat is Due' : 'Below Nisab Threshold'}
              </h3>
              <p className="text-sm text-gray-300">
                {nisabStatus}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Gold Nisab: {goldNisabGrams}g × {formatCurrency(currentGoldPricePerGram, { fractionDigits: 2 })} = {formatCurrency(goldNisabValue, { fractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Total Zakat Due */}
        <div className="rounded-lg border border-slate-700/60 bg-gradient-to-br from-teal-500/10 to-slate-900/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400">Total Zakat Due</p>
              <p className="text-4xl font-bold text-teal-200 mt-2">
                {formatCurrency(totalZakat, { fractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-400">Zakat Rate</p>
              <p className="text-3xl font-bold text-white mt-2">{(zakatRate * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700/60">
            <div>
              <p className="text-xs text-gray-400">Zakatable Wealth</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(totalZakatable)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Liquid Assets</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(totalLiquidAssets)}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${activeTab === 'summary'
                ? 'border-teal-500 text-teal-200'
                : 'border-transparent text-gray-400 hover:text-white'
              }`}
          >
            Summary by Category
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${activeTab === 'detailed'
                ? 'border-teal-500 text-teal-200'
                : 'border-transparent text-gray-400 hover:text-white'
              }`}
          >
            Detailed Breakdown
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(({ key, label, color, icon }) => {
              const data = categoryBreakdown[key];
              const hasZakat = data.zakat > 0;

              return (
                <div
                  key={key}
                  className="rounded-lg border border-slate-700/60 bg-slate-900/30 p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-xl`}>
                      {icon}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{label}</h4>
                      <p className="text-xs text-gray-400">{data.items.length} item(s)</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Value</span>
                      <span className="text-white font-medium">{formatCurrency(data.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Zakatable</span>
                      <span className="text-white font-medium">{formatCurrency(data.zakatable)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-700/60">
                      <span className="text-gray-300 font-semibold">Zakat Due</span>
                      <span className={`font-bold ${hasZakat ? 'text-teal-200' : 'text-gray-400'}`}>
                        {formatCurrency(data.zakat, { fractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {categories.map(({ key, label, color, icon }) => {
              const data = categoryBreakdown[key];

              if (data.items.length === 0) return null;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-sm`}>
                      {icon}
                    </span>
                    <h4 className="font-semibold text-white">{label}</h4>
                  </div>
                  <div className="space-y-2 pl-8">
                    {data.items.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-slate-700/60 bg-slate-900/20 p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-white">{item.name}</p>
                            <p className="text-xs text-gray-400 mt-1">{item.reason}</p>
                          </div>
                          <span className={`text-sm font-bold ${item.zakat > 0 ? 'text-teal-200' : 'text-gray-400'}`}>
                            {formatCurrency(item.zakat, { fractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">Value:</span>
                            <span className="text-white ml-1">{formatCurrency(item.value)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Zakatable:</span>
                            <span className="text-white ml-1">{formatCurrency(item.zakatable)}</span>
                          </div>
                          {item.weight && (
                            <div>
                              <span className="text-gray-400">Weight:</span>
                              <span className="text-white ml-1">{item.weight}g</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Notes */}
        <div className="rounded-lg bg-slate-900/40 border border-slate-700/40 p-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Note:</strong> This calculation follows Saudi Arabian Zakat regulations.
            Real Estate is calculated as trading property (Urud al-Tijarah).
            Saudi stocks held ≥1 year are exempt (company pays Zakat).
            International stocks and crypto are zakatable at 2.5%.
            Gold below {goldNisabGrams}g Nisab is exempt.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            Print Summary
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ZakatResultsModal;
