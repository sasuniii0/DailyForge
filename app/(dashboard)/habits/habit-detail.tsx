import { View, Text, ScrollView, SafeAreaView, StatusBar, Pressable, ActivityIndicator, Dimensions, Modal } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import React, { useState, useEffect } from "react"
import Svg, { Path, Circle, Line, Polyline } from 'react-native-svg'
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, orderBy, limit, addDoc, setDoc } from "firebase/firestore"
import { db, auth } from "../../../service/firebase.config"
import Toast from "react-native-toast-message"

interface Habit {
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

interface CompletionRecord {
    id: string
    date: string
    completed: boolean
    notes?: string
}

const HabitDetail = () => {
    const router = useRouter()
    const { id } = useLocalSearchParams()
    const [habit, setHabit] = useState<Habit | null>(null)
    const [loading, setLoading] = useState(true)
    const [completionHistory, setCompletionHistory] = useState<CompletionRecord[]>([])
    const [showAITips, setShowAITips] = useState(false)
    const [weekData, setWeekData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

    const screenWidth = Dimensions.get('window').width

    useEffect(() => {
        if (id) {
            fetchHabitDetails()
        }
    }, [id])

    const generateWeekDataFromHabit = (habitData: Habit) => {
        // Generate week data based on current streak
        const last7Days = Array(7).fill(0)
        const today = new Date()
        
        // If completed today, mark today
        if (habitData.completedToday) {
            last7Days[6] = 1
        }
        
        // Fill in previous days based on streak
        const streakDays = Math.min(habitData.currentStreak, 6)
        for (let i = 0; i < streakDays; i++) {
            last7Days[6 - i - (habitData.completedToday ? 1 : 0)] = 1
        }
        
        setWeekData(last7Days)
        
        // Generate history records for display
        const mockHistory: CompletionRecord[] = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            mockHistory.push({
                id: `mock-${i}`,
                date: date.toISOString().split('T')[0],
                completed: last7Days[6 - i] === 1
            })
        }
        setCompletionHistory(mockHistory)
    }

    const fetchHabitDetails = async () => {
        try {
            const user = auth.currentUser
            if (!user || !id) {
                router.push("/login")
                return
            }

            // Fetch habit details
            const habitRef = doc(db, "habits", id as string)
            const habitSnap = await getDoc(habitRef)

            if (habitSnap.exists()) {
                const habitData = { id: habitSnap.id, ...habitSnap.data() } as Habit
                setHabit(habitData)

                // Try to fetch completion history
                try {
                    const historyRef = collection(db, "completions")
                    const q = query(
                        historyRef,
                        where("habitId", "==", id),
                        where("userId", "==", user.uid),
                        orderBy("date", "desc"),
                        limit(30)
                    )
                    const historySnap = await getDocs(q)
                    
                    if (!historySnap.empty) {
                        const history: CompletionRecord[] = []
                        historySnap.forEach((doc) => {
                            history.push({ id: doc.id, ...doc.data() } as CompletionRecord)
                        })
                        setCompletionHistory(history)
                        generateWeekData(history)
                    } else {
                        // No history records, generate from habit data
                        console.log("No completion history found, generating from habit data")
                        generateWeekDataFromHabit(habitData)
                    }
                } catch (historyError: any) {
                    // If collection doesn't exist or query fails, generate from habit data
                    console.log("Completion history error (might need Firestore index):", historyError?.message)
                    generateWeekDataFromHabit(habitData)
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Habit not found'
                })
                router.back()
            }
        } catch (error) {
            console.error("Error fetching habit:", error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load habit details'
            })
        } finally {
            setLoading(false)
        }
    }

    const generateWeekData = (history: CompletionRecord[]) => {
        const last7Days = Array(7).fill(0)
        const today = new Date()
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() - (6 - i))
            const dateString = date.toISOString().split('T')[0]
            
            const completed = history.find(h => h.date === dateString && h.completed)
            last7Days[i] = completed ? 1 : 0
        }
        
        setWeekData(last7Days)
    }

    const handleCompleteHabit = async () => {
        if (!habit) return

        try {
            const user = auth.currentUser
            if (!user) return

            const habitRef = doc(db, "habits", habit.id)
            const newCompletedStatus = !habit.completedToday
            const todayDate = new Date().toISOString().split('T')[0]
            
            // Update habit document
            await updateDoc(habitRef, {
                completedToday: newCompletedStatus,
                currentStreak: newCompletedStatus ? habit.currentStreak + 1 : Math.max(0, habit.currentStreak - 1),
                bestStreak: newCompletedStatus && habit.currentStreak + 1 > habit.bestStreak 
                    ? habit.currentStreak + 1 
                    : habit.bestStreak,
                totalCompletions: newCompletedStatus ? increment(1) : increment(-1),
                lastCompletedDate: newCompletedStatus ? new Date().toISOString() : null
            })

            // Try to create/update completion record
            try {
                const completionRef = doc(db, "completions", `${habit.id}_${todayDate}`)
                await setDoc(completionRef, {
                    habitId: habit.id,
                    userId: user.uid,
                    date: todayDate,
                    completed: newCompletedStatus,
                    timestamp: new Date().toISOString()
                }, { merge: true })
            } catch (completionError) {
                console.log("Could not create completion record:", completionError)
                // Continue anyway - main habit is updated
            }
            
            Toast.show({
                type: 'success',
                text1: newCompletedStatus ? '🎉 Completed!' : '↩️ Unchecked',
                text2: newCompletedStatus ? 'Great work!' : 'Marked as incomplete'
            })
            
            // Refresh data
            fetchHabitDetails()
        } catch (error) {
            console.error("Error updating habit:", error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update habit'
            })
        }
    }

    const getCategoryIcon = (category: string) => {
        switch(category?.toLowerCase()) {
            case 'health':
                return <Svg width="24" height="24" viewBox="0 0 24 24"><Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EF4444"/></Svg>
            case 'productivity':
                return <Svg width="24" height="24" viewBox="0 0 24 24"><Path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="#3B82F6"/></Svg>
            case 'learning':
                return <Svg width="24" height="24" viewBox="0 0 24 24"><Path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" fill="#8B5CF6"/></Svg>
            case 'mindfulness':
                return <Svg width="24" height="24" viewBox="0 0 24 24"><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10B981"/></Svg>
            default:
                return <Svg width="24" height="24" viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#F59E0B"/></Svg>
        }
    }

    const getAITips = () => {
        if (!habit) return []

        const tips = []
        
        // Streak-based tips
        if (habit.currentStreak === 0) {
            tips.push({
                icon: "🚀",
                title: "Start Your Journey",
                description: "Every expert was once a beginner. Take the first step today!"
            })
        } else if (habit.currentStreak < 7) {
            tips.push({
                icon: "💪",
                title: "Build Momentum",
                description: "You're doing great! The first week is the hardest. Keep going!"
            })
        } else if (habit.currentStreak >= 7 && habit.currentStreak < 21) {
            tips.push({
                icon: "🔥",
                title: "Habit Formation Phase",
                description: "You're in the critical zone! Studies show 21 days form a habit."
            })
        } else if (habit.currentStreak >= 21) {
            tips.push({
                icon: "⭐",
                title: "Habit Master",
                description: "Amazing! You've formed a solid habit. Now it's part of who you are."
            })
        }

        // Frequency-based tips
        if (habit.frequency === 'daily') {
            tips.push({
                icon: "⏰",
                title: "Consistency is Key",
                description: "Try doing this habit at the same time every day for better results."
            })
        }

        // Category-specific tips
        switch(habit.category?.toLowerCase()) {
            case 'health':
                tips.push({
                    icon: "🏃",
                    title: "Health Tip",
                    description: "Pair this habit with a healthy meal or exercise routine for compound benefits."
                })
                break
            case 'productivity':
                tips.push({
                    icon: "📊",
                    title: "Productivity Boost",
                    description: "Time-block your habit in your calendar to ensure you never miss it."
                })
                break
            case 'learning':
                tips.push({
                    icon: "📚",
                    title: "Learning Strategy",
                    description: "Apply the 80/20 rule: focus on the 20% that gives you 80% of results."
                })
                break
            case 'mindfulness':
                tips.push({
                    icon: "🧘",
                    title: "Mindfulness Practice",
                    description: "Start small and gradually increase. Even 5 minutes daily makes a difference."
                })
                break
        }

        return tips
    }

    const getDayLabel = (index: number) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const today = new Date()
        const day = new Date(today)
        day.setDate(day.getDate() - (6 - index))
        return days[day.getDay()]
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-gray-600 mt-4">Loading habit details...</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (!habit) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" />
                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-gray-600 text-center">Habit not found</Text>
                    <Pressable 
                        onPress={() => router.back()}
                        className="mt-4 bg-orange-500 rounded-full px-6 py-3"
                    >
                        <Text className="text-white font-semibold">Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        )
    }

    const aiTips = getAITips()
    const successRate = completionHistory.length > 0 
        ? Math.round((completionHistory.filter(h => h.completed).length / completionHistory.length) * 100)
        : 0

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View className="bg-white px-6 pt-12 pb-4 shadow-sm">
                <View className="flex-row justify-between items-center">
                    <Pressable 
                        onPress={() => router.back()}
                        className="p-2 active:bg-gray-100 rounded-full"
                    >
                        <Svg width="24" height="24" viewBox="0 0 24 24">
                            <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#1F2937"/>
                        </Svg>
                    </Pressable>

                    <View className="flex-row">
                        <Pressable 
                            onPress={() => router.push({
                                pathname: '/edit-habit/[id]',
                                params: { id: habit.id }
                            } as any)}
                            className="p-2 mr-2 active:bg-gray-100 rounded-full"
                        >
                            <Svg width="24" height="24" viewBox="0 0 24 24">
                                <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#6B7280"/>
                            </Svg>
                        </Pressable>

                        <Pressable 
                            onPress={() => router.push("/settings")}
                            className="p-2 active:bg-gray-100 rounded-full"
                        >
                            <Svg width="24" height="24" viewBox="0 0 24 24">
                                <Path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#6B7280"/>
                            </Svg>
                        </Pressable>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1">
                {/* Habit Info Card */}
                <View className="px-6 py-6">
                    <View className="bg-white rounded-3xl p-6 shadow-sm">
                        <View className="flex-row items-start mb-4">
                            <View className="bg-gray-100 rounded-full p-4 mr-4">
                                {getCategoryIcon(habit.category)}
                            </View>
                            <View className="flex-1">
                                <Text className="text-2xl font-black text-gray-900 mb-2">
                                    {habit.name}
                                </Text>
                                {habit.description && (
                                    <Text className="text-gray-600 text-base leading-6">
                                        {habit.description}
                                    </Text>
                                )}
                                <View className="flex-row items-center mt-3">
                                    <View className="bg-blue-100 rounded-full px-3 py-1 mr-2">
                                        <Text className="text-blue-700 text-xs font-semibold capitalize">
                                            {habit.frequency}
                                        </Text>
                                    </View>
                                    <View className="bg-purple-100 rounded-full px-3 py-1">
                                        <Text className="text-purple-700 text-xs font-semibold capitalize">
                                            {habit.category}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Complete Button */}
                        <Pressable
                            onPress={handleCompleteHabit}
                            className={`${habit.completedToday ? 'bg-green-500' : 'bg-orange-500'} rounded-full py-4 items-center shadow-lg active:opacity-80`}
                        >
                            <View className="flex-row items-center">
                                <Svg width="24" height="24" viewBox="0 0 24 24">
                                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff"/>
                                </Svg>
                                <Text className="text-white font-bold text-lg ml-2">
                                    {habit.completedToday ? 'Completed Today ✓' : 'Mark as Complete'}
                                </Text>
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Stats Grid */}
                <View className="px-6 pb-6">
                    <View className="flex-row gap-3">
                        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                                Current Streak
                            </Text>
                            <Text className="text-3xl font-black text-orange-600">
                                {habit.currentStreak}
                            </Text>
                            <Text className="text-gray-600 text-sm mt-1">🔥 days</Text>
                        </View>

                        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                                Best Streak
                            </Text>
                            <Text className="text-3xl font-black text-blue-600">
                                {habit.bestStreak}
                            </Text>
                            <Text className="text-gray-600 text-sm mt-1">⭐ days</Text>
                        </View>
                    </View>

                    <View className="flex-row gap-3 mt-3">
                        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                                Total Done
                            </Text>
                            <Text className="text-3xl font-black text-green-600">
                                {habit.totalCompletions || habit.currentStreak}
                            </Text>
                            <Text className="text-gray-600 text-sm mt-1">✓ times</Text>
                        </View>

                        <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
                            <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                                Success Rate
                            </Text>
                            <Text className="text-3xl font-black text-purple-600">
                                {successRate}%
                            </Text>
                            <Text className="text-gray-600 text-sm mt-1">📊 rate</Text>
                        </View>
                    </View>
                </View>

                {/* Week Progress Chart */}
                <View className="px-6 pb-6">
                    <View className="bg-white rounded-3xl p-6 shadow-sm">
                        <Text className="text-lg font-bold text-gray-900 mb-4">
                            Last 7 Days
                        </Text>
                        
                        <View className="flex-row justify-between items-end h-40 mb-2">
                            {weekData.map((value, index) => {
                                const height = value > 0 ? 120 : 20
                                const isToday = index === 6
                                
                                return (
                                    <View key={index} className="flex-1 items-center justify-end">
                                        <View 
                                            className={`w-8 rounded-t-lg ${
                                                value > 0 
                                                    ? isToday ? 'bg-orange-500' : 'bg-green-400'
                                                    : 'bg-gray-200'
                                            }`}
                                            style={{ height }}
                                        />
                                    </View>
                                )
                            })}
                        </View>

                        <View className="flex-row justify-between border-t border-gray-200 pt-2">
                            {weekData.map((_, index) => (
                                <View key={index} className="flex-1 items-center">
                                    <Text className="text-xs text-gray-600 font-medium">
                                        {getDayLabel(index)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* AI Tips Section */}
                <View className="px-6 pb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-900">
                            AI Tips & Insights
                        </Text>
                        <Pressable onPress={() => setShowAITips(true)}>
                            <Text className="text-orange-600 font-semibold text-sm">
                                View All
                            </Text>
                        </Pressable>
                    </View>

                    {aiTips.slice(0, 2).map((tip, index) => (
                        <View key={index} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 mb-3 border border-orange-200">
                            <View className="flex-row items-start">
                                <Text className="text-3xl mr-3">{tip.icon}</Text>
                                <View className="flex-1">
                                    <Text className="text-gray-900 font-bold text-base mb-1">
                                        {tip.title}
                                    </Text>
                                    <Text className="text-gray-700 text-sm leading-5">
                                        {tip.description}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Completion History */}
                <View className="px-6 pb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Recent Activity
                    </Text>
                    
                    {completionHistory.length === 0 ? (
                        <View className="bg-white rounded-2xl p-6 items-center shadow-sm">
                            <Text className="text-gray-500 text-center">
                                No activity yet. Start tracking today!
                            </Text>
                        </View>
                    ) : (
                        <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            {completionHistory.slice(0, 10).map((record, index) => (
                                <View 
                                    key={record.id}
                                    className={`flex-row items-center justify-between p-4 ${
                                        index < completionHistory.slice(0, 10).length - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View className={`${record.completed ? 'bg-green-100' : 'bg-gray-100'} rounded-full p-2 mr-3`}>
                                            {record.completed ? (
                                                <Svg width="20" height="20" viewBox="0 0 24 24">
                                                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#10B981"/>
                                                </Svg>
                                            ) : (
                                                <Svg width="20" height="20" viewBox="0 0 24 24">
                                                    <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#6B7280"/>
                                                </Svg>
                                            )}
                                        </View>
                                        <View>
                                            <Text className="text-gray-900 font-semibold">
                                                {new Date(record.date).toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}
                                            </Text>
                                            <Text className="text-gray-500 text-sm">
                                                {record.completed ? 'Completed' : 'Missed'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className={`text-xs font-semibold ${record.completed ? 'text-green-600' : 'text-gray-400'}`}>
                                        {record.completed ? '✓' : '✗'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* AI Tips Modal */}
            <Modal
                visible={showAITips}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAITips(false)}
            >
                <View className="flex-1 bg-black/50">
                    <Pressable 
                        className="flex-1"
                        onPress={() => setShowAITips(false)}
                    />
                    <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900">AI Tips & Insights</Text>
                            <Pressable onPress={() => setShowAITips(false)}>
                                <Svg width="24" height="24" viewBox="0 0 24 24">
                                    <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#6B7280"/>
                                </Svg>
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {aiTips.map((tip, index) => (
                                <View 
                                    key={index}
                                    className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 mb-4 border border-orange-200"
                                >
                                    <View className="flex-row items-start">
                                        <Text className="text-4xl mr-4">{tip.icon}</Text>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-lg mb-2">
                                                {tip.title}
                                            </Text>
                                            <Text className="text-gray-700 text-base leading-6">
                                                {tip.description}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default HabitDetail