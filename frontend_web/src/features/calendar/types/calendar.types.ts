export type ViewMode = "week" | "month";

export type CalendarEventType = "meal" | "exercise" | "weight" | "schedule";

export type DayRecordSummary = {
  date: string; // yyyy-MM-dd
  mealCount?: number;
  hasExercise?: boolean;
  hasWeight?: boolean;
  eventCount?: number;
};

export type CalendarDay = {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  summary?: DayRecordSummary;
};
