import { format, isToday } from "date-fns";
import { ko } from "date-fns/locale";

import type { ViewMode } from "../types/calendar.types";

export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function formatCalendarHeader(date: Date, viewMode: ViewMode) {
  if (viewMode === "week") {
    return isToday(date) ? "오늘" : format(date, "M월 d일", { locale: ko });
  }

  return format(date, "yyyy년 M월", { locale: ko });
}

export function formatDayNumber(date: Date) {
  return format(date, "d", { locale: ko });
}
