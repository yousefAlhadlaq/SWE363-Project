import { useState, useEffect, useRef } from 'react';
import './StockSearchInput.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StockSearchInput = ({ onStockSelected, initialValue = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/stocks/search-stocks?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.success && data.stocks) {
          setSearchResults(data.stocks);
          setIsDropdownOpen(data.stocks.length > 0);
        }
      } catch (error) {
        console.error('Error searching stocks:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStockSelect = (stock) => {
    setSearchQuery(stock.symbol);
    setIsDropdownOpen(false);
    onStockSelected(stock);
  };

  return (
    <div className="stock-search-container">
      <label className="stock-search-label">Search for a stock</label>
      <input
        ref={inputRef}
        type="text"
        className="stock-search-input"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Enter stock symbol or company name..."
        autoComplete="off"
      />

      {isLoading && (
        <div className="stock-search-loading">Searching...</div>
      )}

      {isDropdownOpen && searchResults.length > 0 && (
        <div ref={dropdownRef} className="stock-search-dropdown">
          {searchResults.map((stock) => (
            <div
              key={stock.symbol}
              className="stock-search-item"
              onClick={() => handleStockSelect(stock)}
            >
              <div className="stock-symbol">{stock.symbol}</div>
              <div className="stock-name">{stock.name}</div>
              <div className="stock-region">{stock.region}</div>
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && searchQuery && searchResults.length === 0 && !isLoading && (
        <div ref={dropdownRef} className="stock-search-dropdown">
          <div className="stock-search-empty">No stocks found</div>
        </div>
      )}
    </div>
  );
};

export default StockSearchInput;
