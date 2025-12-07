/**
 * Format a number as Saudi Riyals (SAR)
 * @param {number} value - The value to format
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} Formatted currency string
 */
export const formatCurrencySAR = (value = 0, { fractionDigits = 0 } = {}) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

export const formatSignedCurrencySAR = (value, options) => {
  if (!value) {
    return `±${formatCurrencySAR(0, options)}`;
  }
  return `${value > 0 ? '+' : '-'}${formatCurrencySAR(Math.abs(value), options)}`;
};
