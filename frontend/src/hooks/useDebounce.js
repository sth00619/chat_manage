// frontend/src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    console.log(`🕐 Debounce: "${value}" -> waiting ${delay}ms`);
    
    const handler = setTimeout(() => {
      console.log(`✨ Debounce completed: "${value}"`);
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}