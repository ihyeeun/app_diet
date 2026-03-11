import { Progress } from "@base-ui/react/progress";
import styles from "./Progress.module.css";

export default function ScoreProgress({ value, label }: { value: number; label?: string }) {
  return (
    <Progress.Root className={styles.Progress} value={value}>
      {label && <Progress.Label className={styles.Label}>{label}</Progress.Label>}
      <Progress.Track className={styles.Track}>
        <Progress.Indicator className={styles.Indicator} />
      </Progress.Track>
    </Progress.Root>
  );
}
