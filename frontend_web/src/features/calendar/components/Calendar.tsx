import "@/features/calendar/styles/calendar.css";

import CalendarHeader from "@/features/calendar/components/CalendarHeader";
import MonthlyCalendar from "@/features/calendar/components/MonthlyCalendar";
import WeeklyCalendar from "@/features/calendar/components/WeeklyCalendar";

import { useCalendar } from "../hooks/useCalendar";
import type { DayRecordSummary } from "../types/calendar.types";

type Props = {
  initialDate?: Date;
  summaries?: DayRecordSummary[];
  onSelectDate?: (date: Date) => void;
};

export default function Calendar({ initialDate, summaries = [], onSelectDate }: Props) {
  const {
    viewMode,
    selectedDate,
    viewDate,
    weekDays,
    monthDays,
    toggleViewMode,
    selectDate,
    goPrev,
    goNext,
    goToday,
  } = useCalendar({
    initialDate,
    initialViewMode: "week",
    summaries,
  });

  const handleSelectDateInWeek = (date: Date) => {
    selectDate(date);
    onSelectDate?.(date);
  };

  const handleSelectDateInMonth = (date: Date) => {
    selectDate(date, { switchToWeek: true });
    onSelectDate?.(date);
  };

  const handleGoToday = () => {
    const today = goToday();
    onSelectDate?.(today);
  };

  return (
    <section className="calendar-root">
      <CalendarHeader
        viewMode={viewMode}
        viewDate={viewDate}
        selectedDate={selectedDate}
        onToggleViewMode={toggleViewMode}
        onPrev={goPrev}
        onNext={goNext}
        onToday={handleGoToday}
      />

      <div className="calendar-body">
        {viewMode === "week" ? (
          <WeeklyCalendar
            days={weekDays}
            onSelectDate={handleSelectDateInWeek}
            onSwipePrev={goPrev}
            onSwipeNext={goNext}
          />
        ) : (
          <MonthlyCalendar
            days={monthDays}
            onSelectDate={handleSelectDateInMonth}
            onSwipePrev={goPrev}
            onSwipeNext={goNext}
          />
        )}
      </div>
    </section>
  );
}
