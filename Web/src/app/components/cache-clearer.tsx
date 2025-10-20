'use client';

import { useEffect } from 'react';

/**
 * Clears wallet connection cache on mount
 * Forces fresh wallet connection every time
 */
export function CacheClearer() {
  useEffect(() => {
    // Clear wagmi storage
    if (typeof window !== 'undefined') {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('wagmi') || key?.startsWith('connectkit') || key?.includes('wallet')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🧹 Cleared:', key);
      });
      
      if (keysToRemove.length > 0) {
        console.log('✅ Cache cleared - fresh wallet connection required');
      }
    }
  }, []);

  return null;
}
