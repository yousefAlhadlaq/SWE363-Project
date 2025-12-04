import { useState, useEffect, useRef } from 'react';
import './StockSearchInput.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CryptoSearchInput = ({ onCryptoSelected, initialValue = '' }) => {
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
        const response = await fetch(`${API_BASE_URL}/crypto/search-crypto?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.success && data.cryptos) {
          setSearchResults(data.cryptos);
          setIsDropdownOpen(data.cryptos.length > 0);
        }
      } catch (error) {
        console.error('Error searching cryptocurrencies:', error);
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

  const handleCryptoSelect = (crypto) => {
    setSearchQuery(crypto.symbol);
    setIsDropdownOpen(false);
    onCryptoSelected(crypto);
  };

  return (
    <div className="stock-search-container">
      <label className="stock-search-label">Search for a cryptocurrency</label>
      <input
        ref={inputRef}
        type="text"
        className="stock-search-input"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder="Enter crypto name or symbol (e.g., Bitcoin, BTC, ETH)..."
        autoComplete="off"
      />

      {isLoading && (
        <div className="stock-search-loading">Searching...</div>
      )}

      {isDropdownOpen && searchResults.length > 0 && (
        <div ref={dropdownRef} className="stock-search-dropdown">
          {searchResults.map((crypto) => (
            <div
              key={crypto.symbol}
              className="stock-search-item"
              onClick={() => handleCryptoSelect(crypto)}
            >
              <div className="stock-symbol">{crypto.symbol}</div>
              <div className="stock-name">{crypto.name}</div>
              <div className="stock-region">{crypto.exchange}</div>
            </div>
          ))}
        </div>
      )}

      {isDropdownOpen && searchQuery && searchResults.length === 0 && !isLoading && (
        <div ref={dropdownRef} className="stock-search-dropdown">
          <div className="stock-search-empty">No cryptocurrencies found</div>
        </div>
      )}
    </div>
  );
};

export default CryptoSearchInput;
