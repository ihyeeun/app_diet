export const queryKeys = {
  dayMeals: (date: string) => ["day-meals", date] as const,
} as const;
