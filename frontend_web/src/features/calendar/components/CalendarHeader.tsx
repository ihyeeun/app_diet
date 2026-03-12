import { ChevronDown } from "lucide-react";
import { formatCalendarHeader } from "../utils/format";
import type { ViewMode } from "../types/calendar.types";

type Props = {
  viewMode: ViewMode;
  viewDate: Date;
  onToggleViewMode: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function CalendarHeader({ viewMode, viewDate, onToggleViewMode }: Props) {
  return (
    <div className="calendar-header">
      <div className="calendar-header-left">
        <button
          type="button"
          className="calendar-title-button"
          onClick={onToggleViewMode}
          aria-label={viewMode === "week" ? "월 달력 펼치기" : "주 달력 접기"}
        >
          <span className="calendar-title typo-title3-semibold">
            {formatCalendarHeader(viewDate, viewMode)}
          </span>
          <ChevronDown
            size={24}
            className={`calendar-title-icon ${viewMode === "month" ? "is-open" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
