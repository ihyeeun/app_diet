export const queryKeys = {
  dayMeals: {
    all: ["day-meals"] as const,
    byDate: (date: string) => ["day-meals", date] as const,
  },
  bodyStats: (date: string) => ["bodyLog", date] as const,
} as const;
