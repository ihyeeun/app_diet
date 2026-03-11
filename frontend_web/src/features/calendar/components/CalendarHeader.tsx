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
          <span className="calendar-title">{formatCalendarHeader(viewDate, viewMode)}</span>
          <ChevronDown
            size={18}
            className={`calendar-title-icon ${viewMode === "month" ? "is-open" : ""}`}
          />
        </button>
      </div>

      {/* <div className="calendar-header-right">
        <button
          type="button"
          className="calendar-nav-button"
          onClick={onPrev}
          aria-label="이전 보기"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          className="calendar-nav-button"
          onClick={onNext}
          aria-label="다음 보기"
        >
          <ChevronRight size={18} />
        </button>
      </div> */}
    </div>
  );
}
