import Picker from "react-mobile-picker";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import "./WheelPicker.css";

type Props = {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  suffix?: string;
  height?: number | string;
  itemHeight?: number;
  highlightHeight?: number;
};

const getToneClassName = (distance: number) => {
  if (distance === 0) return "wheelPicker__item--active";
  if (distance === 1) return "wheelPicker__item--near";
  if (distance === 2) return "wheelPicker__item--mid";
  if (distance === 3) return "wheelPicker__item--far";
  return "wheelPicker__item--farthest";
};

export default function WheelPicker({
  value,
  options,
  onChange,
  suffix,
  height = 180,
  itemHeight = 44,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(typeof height === "number" ? height : 180);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const el = wrapperRef.current;

    const updateHeight = () => {
      setMeasuredHeight(el.clientHeight || 180);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, [height]);

  const preventBackgroundScroll = (event: TouchEvent<HTMLDivElement>) => {
    if (event.cancelable) event.preventDefault();
  };

  const selectedIndex = options.indexOf(value);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <div ref={wrapperRef} className="wheelPicker" onTouchMoveCapture={preventBackgroundScroll}>
      <Picker
        value={{ col: value }}
        onChange={(val) => onChange(val.col)}
        height={measuredHeight}
        itemHeight={itemHeight}
        wheelMode="natural"
      >
        <Picker.Column name="col">
          {options.map((opt, index) => {
            const toneClassName = getToneClassName(Math.abs(index - currentIndex));

            return (
              <Picker.Item key={opt} value={opt}>
                <div className={`wheelPicker__item ${toneClassName}`}>
                  {opt} {suffix ?? ""}
                </div>
              </Picker.Item>
            );
          })}
        </Picker.Column>
      </Picker>

      <div className="wheelPicker__highlight" />
    </div>
  );
}
