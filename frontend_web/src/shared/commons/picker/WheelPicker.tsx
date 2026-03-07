import Picker from "react-mobile-picker";
import type { TouchEvent } from "react";
import "./WheelPicker.css";

type Props = {
  value: string; // 선택 값 (Picker는 string이 편함)
  options: string[]; // 표시할 리스트
  onChange: (v: string) => void; // 변경
  suffix?: string; // "년" 같은 단위
  height?: number; // picker 높이
  itemHeight?: number; // 한 칸 높이
};

export default function WheelPicker({
  value,
  options,
  onChange,
  suffix,
  height = 180,
  itemHeight = 44,
}: Props) {
  const preventBackgroundScroll = (event: TouchEvent<HTMLDivElement>) => {
    if (event.cancelable) event.preventDefault();
  };

  return (
    <div
      className="wheelPicker"
      style={{ height }}
      onTouchMoveCapture={preventBackgroundScroll}
    >
      <Picker
        value={{ col: value }}
        onChange={(val) => onChange(val.col)}
        height={height}
        itemHeight={itemHeight}
      >
        <Picker.Column name="col">
          {options.map((opt) => (
            <Picker.Item key={opt} value={opt}>
              <div className="wheelPicker__item">
                {opt}
                {suffix ?? ""}
              </div>
            </Picker.Item>
          ))}
        </Picker.Column>
      </Picker>

      {/* 가운데 선택 라인 */}
      <div className="wheelPicker__highlight" />
    </div>
  );
}
