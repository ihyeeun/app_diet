import { Input } from "@base-ui/react/input";
import styles from "./EditorInput.module.css";

type Props = Omit<React.ComponentProps<"input">, "onChange" | "value" | "min" | "max"> & {
  unit?: string;
  value?: number;
  min?: number;
  max?: number;
  clampOnChange?: boolean;
  normalizeOnBlur?: boolean;
  onChange: (v?: number) => void;
};

function clamp(n: number, min?: number, max?: number) {
  let v = n;
  if (min !== undefined) v = Math.max(min, v);
  if (max !== undefined) v = Math.min(max, v);
  return v;
}

export function EditorInput({
  unit,
  onChange,
  value,
  min,
  max,
  clampOnChange = true,
  normalizeOnBlur = true,
  ...props
}: Props) {
  return (
    <div className={styles.inputBox}>
      <Input
        {...props}
        className={styles.input}
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(e) => {
          const raw = e.target.value;

          if (raw === "") {
            onChange(undefined);
            return;
          }

          const num = Number(raw);
          if (Number.isNaN(num)) return;

          const fixed = clampOnChange ? clamp(num, min, max) : num;

          onChange(fixed);
        }}
        onBlur={() => {
          if (!normalizeOnBlur) return;

          if (value !== undefined) {
            onChange(clamp(value, min, max));
          }
        }}
      />
      {unit && <span className={styles.unit}>{unit}</span>}
    </div>
  );
}
