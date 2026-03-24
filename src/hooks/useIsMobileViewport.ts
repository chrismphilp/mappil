import { useState, useEffect } from 'react';

export function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 639px)').matches || window.matchMedia('(pointer: coarse)').matches;
  });
  
  const [isCoarsePointer, setIsCoarsePointer] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const widthMediaQuery = window.matchMedia('(max-width: 639px)');
    const pointerMediaQuery = window.matchMedia('(pointer: coarse)');

    const handleWidthChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches || pointerMediaQuery.matches);
    };

    const handlePointerChange = (e: MediaQueryListEvent) => {
      setIsMobile(widthMediaQuery.matches || e.matches);
      setIsCoarsePointer(e.matches);
    };

    // Modern browsers support addEventListener on MediaQueryList
    if (widthMediaQuery.addEventListener) {
      widthMediaQuery.addEventListener('change', handleWidthChange);
      pointerMediaQuery.addEventListener('change', handlePointerChange);
    } else {
      // Fallback for older browsers
      widthMediaQuery.addListener(handleWidthChange);
      pointerMediaQuery.addListener(handlePointerChange);
    }

    return () => {
      if (widthMediaQuery.removeEventListener) {
        widthMediaQuery.removeEventListener('change', handleWidthChange);
        pointerMediaQuery.removeEventListener('change', handlePointerChange);
      } else {
        widthMediaQuery.removeListener(handleWidthChange);
        pointerMediaQuery.removeListener(handlePointerChange);
      }
    };
  }, []);

  return { isMobile, isCoarsePointer };
}
