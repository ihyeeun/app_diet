import { type CSSProperties, type TouchEvent, useRef, useState } from "react";

type UseSwipeParams = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
};

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 40 }: UseSwipeParams) {
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    setIsAnimating(false);
  };

  const onTouchMove = (e: TouchEvent<HTMLElement>) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;

    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    const clampedOffset = Math.max(-64, Math.min(64, deltaX * 0.35));
    setOffsetX(clampedOffset);
  };

  const onTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startXRef.current;
    const deltaY = touch.clientY - startYRef.current;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold;

    setIsAnimating(true);

    if (!isHorizontalSwipe) {
      setOffsetX(0);
      startXRef.current = null;
      startYRef.current = null;
      return;
    }

    if (deltaX < 0) onSwipeLeft?.();
    if (deltaX > 0) onSwipeRight?.();

    setOffsetX(0);
    startXRef.current = null;
    startYRef.current = null;
  };

  const motionStyle: CSSProperties = {
    opacity: 1 - Math.min(Math.abs(offsetX) / 320, 0.15),
    transform: `translate3d(${offsetX}px, 0, 0)`,
    transition: isAnimating
      ? "transform 180ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease"
      : "none",
  };

  return {
    motionStyle,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
}
