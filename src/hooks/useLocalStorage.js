import { useState, useEffect } from 'react';

const readValue = (key, initialValue) => {
  if (typeof window === 'undefined') {
    return initialValue;
  }
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initialValue;
  } catch (error) {
    return initialValue;
  }
};

export default function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => readValue(key, initialValue));

  // When the key changes (e.g., switching users), load the new value
  useEffect(() => {
    setState(readValue(key, initialValue));
  }, [key, initialValue]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      // ignore write errors (e.g., private mode)
    }
  }, [key, state]);

  return [state, setState];
}
