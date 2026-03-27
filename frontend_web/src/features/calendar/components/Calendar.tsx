import "@/features/calendar/styles/calendar.css";
import type { DayRecordSummary } from "../types/calendar.types";
import { useCalendar } from "../hooks/useCalendar";
import CalendarHeader from "@/features/calendar/components/CalendarHeader";
import MonthlyCalendar from "@/features/calendar/components/MonthlyCalendar";
import WeeklyCalendar from "@/features/calendar/components/WeeklyCalendar";

type Props = {
  initialDate?: Date;
  summaries?: DayRecordSummary[];
  onSelectDate?: (date: Date) => void;
};

export default function Calendar({ initialDate, summaries = [], onSelectDate }: Props) {
  const { viewMode, viewDate, weekDays, monthDays, toggleViewMode, selectDate, goPrev, goNext } =
    useCalendar({
      initialDate,
      initialViewMode: "week",
      summaries,
    });

  const handleSelectDate = (date: Date) => {
    selectDate(date);
    onSelectDate?.(date);
  };

  return (
    <section className="calendar-root">
      <CalendarHeader
        viewMode={viewMode}
        viewDate={viewDate}
        onToggleViewMode={toggleViewMode}
        onPrev={goPrev}
        onNext={goNext}
      />

      <div className="calendar-body">
        {viewMode === "week" ? (
          <WeeklyCalendar
            days={weekDays}
            onSelectDate={handleSelectDate}
            onSwipePrev={goPrev}
            onSwipeNext={goNext}
          />
        ) : (
          <MonthlyCalendar
            days={monthDays}
            onSelectDate={handleSelectDate}
            onSwipePrev={goPrev}
            onSwipeNext={goNext}
          />
        )}
      </div>
    </section>
  );
}
