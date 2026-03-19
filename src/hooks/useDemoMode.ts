import { useEffect, useState } from 'react';
import { isDemoModeActive, onDemoModeChange, setDemoMode } from '../lib/demoUtils';

/**
 * Standardized hook to access Demo Mode state across the application.
 */
export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(isDemoModeActive());

  useEffect(() => {
    const sync = () => {
      setIsDemoMode(isDemoModeActive());
    };

    const offDemoMode = onDemoModeChange(setIsDemoMode);
    window.addEventListener('storage', sync);

    return () => {
      offDemoMode();
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleDemo = (active: boolean) => {
    setDemoMode(active);
    setIsDemoMode(active);
  };

  return { isDemoMode, toggleDemo };
};
