import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCalendarHeader } from "../utils/format";
import type { ViewMode } from "../types/calendar.types";

type Props = {
  viewMode: ViewMode;
  viewDate: Date;
  onToggleViewMode: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function CalendarHeader({
  viewMode,
  viewDate,
  onToggleViewMode,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="calendar-header">
      <div className="calendar-header-left">
        <button
          type="button"
          className="calendar-title-button"
          onClick={onToggleViewMode}
          aria-label={viewMode === "week" ? "월 달력 펼치기" : "주 달력 접기"}
        >
          <span className="calendar-title typo-title3">
            {formatCalendarHeader(viewDate, viewMode)}
          </span>
          <ChevronDown
            size={24}
            className={`calendar-title-icon ${viewMode === "month" ? "is-open" : ""}`}
          />
        </button>
      </div>

      {viewMode === "month" && (
        <div className="calendar-header-right">
          <button type="button" className="calendar-nav-button" onClick={onPrev} aria-label="이전">
            <ChevronLeft size={24} />
          </button>
          <button type="button" className="calendar-nav-button" onClick={onNext} aria-label="다음">
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
