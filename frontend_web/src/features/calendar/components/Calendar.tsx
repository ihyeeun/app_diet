import "@/features/calendar/styles/calendar.css";
import type { DayRecordSummary } from "../types/calendar.types";
import { useCalendar } from "../hooks/useCalendar";
import CalendarHeader from "@/features/calendar/components/CalendarHeader";
import MonthlyCalendar from "@/features/calendar/components/MonthlyCalendar";
import WeeklyCalendar from "@/features/calendar/components/WeeklyCalendar";

type Props = {
  initialDate?: Date;
  summaries?: DayRecordSummary[];
};

export default function Calendar({ initialDate, summaries = [] }: Props) {
  const { viewMode, viewDate, weekDays, monthDays, toggleViewMode, selectDate, goPrev, goNext } =
    useCalendar({
      initialDate,
      initialViewMode: "week",
      summaries,
    });

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
            onSelectDate={selectDate}
            onSwipePrev={goPrev}
            onSwipeNext={goNext}
          />
        ) : (
          <MonthlyCalendar
            days={monthDays}
            onSelectDate={selectDate}
            onSwipePrev={goPrev}
            onSwipeNext={goNext}
          />
        )}
      </div>
    </section>
  );
}
