import { useRef } from "react";

type UseSwipeParams = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
};

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 40 }: UseSwipeParams) {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold;

    if (!isHorizontalSwipe) {
      startXRef.current = null;
      startYRef.current = null;
      return;
    }

    if (deltaX < 0) onSwipeLeft?.();
    if (deltaX > 0) onSwipeRight?.();

    startXRef.current = null;
    startYRef.current = null;
  };

  return {
    onTouchStart,
    onTouchEnd,
  };
}
