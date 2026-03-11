import { formatDayNumber } from "../utils/format";
import type { CalendarDay } from "../types/calendar.types";

type Props = {
  day: CalendarDay;
  weekdayLabel?: string;
  onSelect: (date: Date) => void;
  compact?: boolean;
};

export default function DayCell({ day, weekdayLabel, onSelect, compact = false }: Props) {
  const classNames = [
    "calendar-day-cell",
    day.isSelected ? "is-selected" : "",
    day.isToday ? "is-today" : "",
    !day.isCurrentMonth ? "is-outside" : "",
    compact ? "is-compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classNames}
      onClick={() => onSelect(day.date)}
      aria-pressed={day.isSelected}
    >
      {weekdayLabel && (
        <div className="calendar-day-weekday-container">
          <span className="calendar-day-weekday">{weekdayLabel}</span>
        </div>
      )}
      <div className="calendar-day-number-container">
        <span className="calendar-day-number">{formatDayNumber(day.date)}</span>
      </div>
      {/* <EventDots summary={day.summary} /> */}
    </button>
  );
}
