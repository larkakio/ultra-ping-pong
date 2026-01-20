import { useState, useEffect } from 'react';

interface ResponsiveSize {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  isMobile: boolean;
}

export function useResponsiveSize(): ResponsiveSize {
  const [size, setSize] = useState<ResponsiveSize>(() => {
    if (typeof window === 'undefined') {
      return {
        canvasWidth: 600,
        canvasHeight: 900,
        scale: 1,
        isMobile: false,
      };
    }

    const isMobile = window.innerWidth < 768;
    
    // Full screen approach - use viewport dimensions
    const baseWidth = 600;
    const baseHeight = 900;
    const aspectRatio = baseWidth / baseHeight; // 2:3 (portrait)
    
    // Use full viewport - no padding for true fullscreen
    const maxHeight = window.innerHeight;
    const maxWidth = window.innerWidth;
    
    // Calculate dimensions: prioritize height (fill screen vertically)
    let canvasHeight = maxHeight;
    let canvasWidth = canvasHeight * aspectRatio;
    
    // If width exceeds available space, scale down
    if (canvasWidth > maxWidth) {
      canvasWidth = maxWidth;
      canvasHeight = canvasWidth / aspectRatio;
    }
    
    const scale = canvasWidth / baseWidth;
    
    return {
      canvasWidth,
      canvasHeight,
      scale,
      isMobile,
    };
  });

  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      
      const baseWidth = 600;
      const baseHeight = 900;
      const aspectRatio = baseWidth / baseHeight;
      
      // Use full viewport - no padding for true fullscreen
      const maxHeight = window.innerHeight;
      const maxWidth = window.innerWidth;
      
      // Calculate dimensions: prioritize height (fill screen vertically)
      let canvasHeight = maxHeight;
      let canvasWidth = canvasHeight * aspectRatio;
      
      // If width exceeds available space, scale down
      if (canvasWidth > maxWidth) {
        canvasWidth = maxWidth;
        canvasHeight = canvasWidth / aspectRatio;
      }
      
      const scale = canvasWidth / baseWidth;
      
      setSize({
        canvasWidth,
        canvasHeight,
        scale,
        isMobile,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
}