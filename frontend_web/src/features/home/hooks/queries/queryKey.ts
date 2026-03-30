export const queryKeys = {
  dayMeals: (date: string) => ["day-meals", date] as const,
  bodyStats: (date: string) => ["bodyLog", date] as const,
} as const;
