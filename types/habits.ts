export interface Habit {
    id: string
    name: string
    description?: string
    frequency: 'daily' | 'weekly' | 'monthly'
    currentStreak: number
    bestStreak: number
    completedToday: boolean
    category: string
    targetGoal?: number
    color?: string
    createdAt: string
    reminderTime?: string
    totalCompletions?: number
    lastCompletedDate?: string
    userId?: string
}

// Helper type for creating new habits
export type CreateHabitInput = Omit<
  Habit, 
  'id' | 'createdAt' | 'currentStreak' | 'bestStreak' | 'completedToday' | 'totalCompletions' | 'userId' | 'lastCompletedDate'
>;

// Type for heatmap visualization
export interface HeatmapData {
  date: string; // Format: "YYYY-MM-DD"
  count: number; // Number of habits completed on this date
}