import DayCell from "@/features/calendar/components/dayCell";

import { useSwipe } from "../hooks/useSwipe";
import type { CalendarDay } from "../types/calendar.types";
import { WEEKDAY_LABELS } from "../utils/format";

type Props = {
  days: CalendarDay[];
  onSelectDate: (date: Date) => void;
  onSwipePrev: () => void;
  onSwipeNext: () => void;
};

export default function WeeklyCalendar({ days, onSelectDate, onSwipePrev, onSwipeNext }: Props) {
  const { motionStyle, ...swipeHandlers } = useSwipe({
    onSwipeLeft: onSwipeNext,
    onSwipeRight: onSwipePrev,
  });

  return (
    <div className="weekly-calendar" style={motionStyle} {...swipeHandlers}>
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
