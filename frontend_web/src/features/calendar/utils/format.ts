import { format } from "date-fns";
import { ko } from "date-fns/locale";

import type { ViewMode } from "../types/calendar.types";

export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function formatCalendarHeader(date: Date, _viewMode: ViewMode) {
  return format(date, "M월 d일", { locale: ko });
}

export function formatDayNumber(date: Date) {
  return format(date, "d", { locale: ko });
}
