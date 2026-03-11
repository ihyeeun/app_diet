import { useMemo, useState } from "react";
import type { DayRecordSummary, ViewMode } from "../types/calendar.types";
import {
  buildWeekCalendarDays,
  buildMonthCalendarDays,
  movePrev,
  moveNext,
} from "@/features/calendar/utils/calendar";

type UseCalendarParams = {
  initialDate?: Date;
  initialViewMode?: ViewMode;
  summaries?: DayRecordSummary[];
};

export function useCalendar({
  initialDate = new Date(),
  initialViewMode = "week",
  summaries = [],
}: UseCalendarParams = {}) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewDate, setViewDate] = useState(initialDate);

  const weekDays = useMemo(() => {
    return buildWeekCalendarDays({
      baseDate: viewDate,
      selectedDate,
      summaries,
      weekStartsOn: 1,
    });
  }, [viewDate, selectedDate, summaries]);

  const monthDays = useMemo(() => {
    return buildMonthCalendarDays({
      baseDate: viewDate,
      selectedDate,
      summaries,
      weekStartsOn: 1,
    });
  }, [viewDate, selectedDate, summaries]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "week" ? "month" : "week"));
    setViewDate(selectedDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setViewDate(date);
  };

  const goPrev = () => {
    setViewDate((prev) => movePrev(prev, viewMode));
  };

  const goNext = () => {
    setViewDate((prev) => moveNext(prev, viewMode));
  };

  return {
    viewMode,
    selectedDate,
    viewDate,
    weekDays,
    monthDays,
    toggleViewMode,
    selectDate,
    goPrev,
    goNext,
  };
}
