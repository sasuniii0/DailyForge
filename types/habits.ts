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
}