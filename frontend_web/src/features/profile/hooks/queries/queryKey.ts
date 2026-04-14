export const queryKeys = {
  profile: ["profile"] as const,
  userGoalSnapshot: (date: string) => ["profile", "goal-snapshot", date] as const,
} as const;
