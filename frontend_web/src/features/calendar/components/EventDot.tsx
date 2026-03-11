import type { DayRecordSummary } from "../types/calendar.types";

type Props = {
  summary?: DayRecordSummary;
};

export default function EventDots({ summary }: Props) {
  if (!summary) return <div className="calendar-dots calendar-dots--empty" />;

  const dots: string[] = [];

  if ((summary.mealCount ?? 0) > 0) dots.push("meal");
  if (summary.hasExercise) dots.push("exercise");
  if (summary.hasWeight) dots.push("weight");

  return (
    <div className="calendar-dots" aria-hidden="true">
      {dots.slice(0, 3).map((dot) => (
        <span key={dot} className={`calendar-dot calendar-dot--${dot}`} />
      ))}
    </div>
  );
}
