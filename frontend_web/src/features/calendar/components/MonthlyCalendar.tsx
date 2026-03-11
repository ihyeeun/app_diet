import type { CalendarDay } from "../types/calendar.types";
import { WEEKDAY_LABELS } from "../utils/format";
import { useSwipe } from "../hooks/useSwipe";
import DayCell from "@/features/calendar/components/dayCell";

type Props = {
  days: CalendarDay[];
  onSelectDate: (date: Date) => void;
  onSwipePrev: () => void;
  onSwipeNext: () => void;
};

export default function MonthlyCalendar({ days, onSelectDate, onSwipePrev, onSwipeNext }: Props) {
  const swipeHandlers = useSwipe({
    onSwipeLeft: onSwipeNext,
    onSwipeRight: onSwipePrev,
  });

  return (
    <div className="monthly-calendar" {...swipeHandlers}>
      <div className="monthly-calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="monthly-calendar-weekday">
            {label}
          </div>
        ))}
      </div>

      <div className="monthly-calendar-grid">
        {days.map((day) => (
          <DayCell key={day.date.toISOString()} day={day} onSelect={onSelectDate} compact />
        ))}
      </div>
    </div>
  );
}
