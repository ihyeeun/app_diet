import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import type { ViewMode } from "../types/calendar.types";
import { formatCalendarHeader } from "../utils/format";

type Props = {
  viewMode: ViewMode;
  viewDate: Date;
  selectedDate: Date;
  onToggleViewMode: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function CalendarHeader({
  viewMode,
  viewDate,
  selectedDate,
  onToggleViewMode,
  onPrev,
  onNext,
  onToday,
}: Props) {
  const weekTitle = formatCalendarHeader(selectedDate, "week");
  const monthTitle = formatCalendarHeader(viewDate, "month");

  return (
    <div className="calendar-header">
      <div className="calendar-header-top">
        <div className="calendar-header-left">
          <button
            type="button"
            className="calendar-title-button"
            onClick={onToggleViewMode}
            aria-label={viewMode === "week" ? "월 달력 펼치기" : "주 달력 접기"}
          >
            <span className="calendar-title typo-title3">
              {viewMode === "week" ? weekTitle : "월간"}
            </span>
            <ChevronDown
              size={24}
              className={`calendar-title-icon ${viewMode === "month" ? "is-open" : ""}`}
            />
          </button>
        </div>

        {viewMode === "month" && (
          <div className="calendar-header-right">
            <button
              type="button"
              className="typo-label3 calendar-text-white"
              onClick={onToday}
              aria-label="오늘 날짜로 이동"
            >
              오늘
            </button>
          </div>
        )}
      </div>

      {viewMode === "month" && (
        <div className="calendar-month-title">
          <button type="button" className="calendar-nav-button" onClick={onPrev} aria-label="이전">
            <ChevronLeft size={24} />
          </button>
          <p className="typo-title3 calendar-text-white">{monthTitle}</p>
          <button type="button" className="calendar-nav-button" onClick={onNext} aria-label="다음">
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
