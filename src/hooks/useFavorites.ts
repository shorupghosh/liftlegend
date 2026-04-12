import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useFavorites() {
  const { gymId } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!gymId) return;
    const stored = localStorage.getItem(`liftlegend_favorites_${gymId}`);
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch (e) {
        setFavorites(new Set());
      }
    } else {
      setFavorites(new Set());
    }
  }, [gymId]);

  const toggleFavorite = useCallback((memberId: string) => {
    if (!gymId) return;
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      localStorage.setItem(`liftlegend_favorites_${gymId}`, JSON.stringify(Array.from(next)));
      return next;
    });
  }, [gymId]);

  const isFavorite = useCallback((memberId: string) => {
    return favorites.has(memberId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
