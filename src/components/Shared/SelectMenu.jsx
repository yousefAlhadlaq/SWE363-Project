import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';
import { Building2 } from 'lucide-react';

// Format currency helper - defined outside component to prevent recreation
const formatCurrency = (amount = 0) =>
  `SR ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Extract account metadata helper
const extractAccountMeta = (option) => {
  const bankName = option.bank || option.label || option.name || 'Account';
  const accountName = option.accountName || option.name || option.label || 'Account';
  const balanceValue = option.balance ?? option.currentBalance ?? option.amount ?? 0;
  const balanceLabel = formatCurrency(balanceValue);
  const isPlaceholder = option.isPlaceholder || option.value === '';

  return { bankName, accountName, balanceLabel, isPlaceholder };
};

// Memoized account option component
const AccountOption = memo(function AccountOption({ option, isSelected, onSelect, disabled }) {
  const { bankName, accountName, balanceLabel, isPlaceholder } = extractAccountMeta(option);

  const handleClick = useCallback(() => {
    if (!option.disabled && !disabled) {
      onSelect(option);
    }
  }, [option, disabled, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        flex w-full items-center gap-3 rounded-md px-3 py-2.5 sm:py-2 text-left transition min-h-[44px] sm:min-h-0
        ${option.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-700/50 cursor-pointer active:bg-slate-700/70'}
        ${isSelected ? 'bg-slate-700/60 border border-teal-500/40' : 'border border-transparent'}
      `}
      disabled={option.disabled}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-teal-300 flex-shrink-0">
        <Building2 className="h-5 w-5" />
        {option.logo && (
          <img
            src={option.logo}
            alt={`${bankName} logo`}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
            className="absolute h-full w-full rounded-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div className={`text-sm ${isPlaceholder ? 'text-gray-400' : 'text-white'} leading-tight truncate`}>
          {isPlaceholder ? option.label : `${bankName} — ${accountName}`}
        </div>
        {!isPlaceholder && (
          <div className="ml-auto text-sm font-semibold text-teal-300 whitespace-nowrap flex-shrink-0">
            {balanceLabel}
          </div>
        )}
      </div>
    </button>
  );
});

AccountOption.displayName = 'AccountOption';

// Memoized account preview component
const AccountPreview = memo(function AccountPreview({ option }) {
  const { bankName, accountName, balanceLabel, isPlaceholder } = extractAccountMeta(option);

  return (
    <div className="flex flex-1 items-center gap-3 min-w-0">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-teal-300 flex-shrink-0">
        <Building2 className="h-5 w-5" />
        {option.logo && (
          <img
            src={option.logo}
            alt={`${bankName} logo`}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
            className="absolute h-full w-full rounded-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div className={`text-sm ${isPlaceholder ? 'text-gray-400' : 'text-white'} leading-tight truncate`}>
          {isPlaceholder ? option.label : `${bankName} — ${accountName}`}
        </div>
        {!isPlaceholder && (
          <div className="ml-auto text-sm font-semibold text-teal-300 whitespace-nowrap flex-shrink-0">
            {balanceLabel}
          </div>
        )}
      </div>
    </div>
  );
});

AccountPreview.displayName = 'AccountPreview';

const SelectMenu = memo(function SelectMenu({ 
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}) {
  const dropdownRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const formattedOptions = useMemo(() => [
    { value: '', label: placeholder, disabled: true, isPlaceholder: true },
    ...options
  ], [options, placeholder]);

  const isAccountDropdown = useMemo(
    () =>
      options.some(
        (option) =>
          option?.isAccountOption ||
          typeof option?.balance !== 'undefined' ||
          option?.bank ||
          option?.accountName ||
          option?.logo
      ),
    [options]
  );

  const selectedOption = useMemo(() =>
    formattedOptions.find((option) => `${option.value}` === `${value}`) ||
    formattedOptions[0],
    [formattedOptions, value]
  );

  // Memoized handlers
  const handleOutsideClick = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }, []);

  const emitChange = useCallback((nextValue) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: nextValue,
        },
      });
    }
  }, [onChange, name]);

  const handleSelectOption = useCallback((option) => {
    if (option.disabled || disabled) return;
    emitChange(option.value);
    setIsOpen(false);
  }, [disabled, emitChange]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, [handleToggle]);

  useEffect(() => {
    if (!isAccountDropdown) return undefined;

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isAccountDropdown, handleOutsideClick]);

  useEffect(() => {
    setIsOpen(false);
  }, [value]);

  if (isAccountDropdown) {
    return (
      <div className="mb-4" ref={dropdownRef}>
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-gray-400 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        {/* Hidden native select to keep form semantics */}
        <select
          name={name}
          value={value}
          required={required}
          onChange={onChange}
          className="absolute h-0 w-0 opacity-0 pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {formattedOptions.map((option, index) => (
            <option
              key={`hidden-${index}`}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div
          className={`
            w-full rounded-lg border ${error ? 'border-red-500' : 'border-slate-600'}
            bg-slate-700/50 transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${className}
          `}
        >
          <button
            type="button"
            id={name}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className="flex w-full items-center justify-between px-3 sm:px-4 py-3 text-left min-h-[52px]"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            disabled={disabled}
            {...props}
          >
            <AccountPreview option={selectedOption} />
            <svg
              className={`w-5 h-5 text-gray-400 shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isOpen && (
            <div
              className="z-20 mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 shadow-xl"
              role="listbox"
            >
              <div className="max-h-60 overflow-auto py-1 overscroll-contain">
                {formattedOptions.map((option) => (
                  <AccountOption
                    key={`${option.value}-${option.label}`}
                    option={option}
                    isSelected={`${option.value}` === `${selectedOption?.value}`}
                    onSelect={handleSelectOption}
                    disabled={disabled}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Standard select for non-account dropdowns
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-400 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3 sm:px-4 py-3 min-h-[48px]
            bg-slate-700/50 
            border ${error ? 'border-red-500' : 'border-slate-600'} 
            rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            appearance-none
            cursor-pointer
            ${!value ? 'text-gray-400' : 'text-white'} 
            ${className}
          `}
          {...props}
        >
          {formattedOptions.map((option, index) => (
            <option 
              key={index} 
              value={option.value}
              disabled={option.disabled}
              className={option.disabled ? 'text-gray-500' : 'text-white bg-slate-700'}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg 
            className="w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

SelectMenu.displayName = 'SelectMenu';

export default SelectMenu;
