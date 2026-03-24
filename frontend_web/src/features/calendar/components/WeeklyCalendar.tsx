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

export default function WeeklyCalendar({ days, onSelectDate, onSwipePrev, onSwipeNext }: Props) {
  const swipeHandlers = useSwipe({
    onSwipeLeft: onSwipeNext,
    onSwipeRight: onSwipePrev,
  });

  return (
    <div className="weekly-calendar" {...swipeHandlers}>
      {days.map((day, index) => (
        <DayCell
          key={day.date.toISOString()}
          day={day}
          weekdayLabel={WEEKDAY_LABELS[index]}
          onSelect={onSelectDate}
          variant="week"
        />
      ))}
    </div>
  );
}
