import { Progress } from "@base-ui/react/progress";

import styles from "./Progress.module.css";

export type ProgressVariant =
  | "primary-white"
  | "primary-gray"
  | "black-gray"
  | "danger-white";

type ScoreProgressProps = {
  value: number;
  label?: string;
  variant?: ProgressVariant;
};

export default function ScoreProgress({
  value,
  label,
  variant = "primary-white",
}: ScoreProgressProps) {
  return (
    <Progress.Root className={styles.Progress} data-variant={variant} value={value}>
      {label && <Progress.Label className={styles.Label}>{label}</Progress.Label>}
      <Progress.Track className={styles.Track}>
        <Progress.Indicator className={styles.Indicator} />
      </Progress.Track>
    </Progress.Root>
  );
}
