import { View, Text, ScrollView, SafeAreaView, StatusBar, Pressable, RefreshControl, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import React, { useState, useEffect } from "react"
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore"
import { db, auth } from "../../service/firebase.config"
import Toast from "react-native-toast-message"

interface Habit {
    id: string
    name: string
    frequency: 'daily' | 'weekly' | 'monthly'
    currentStreak: number
    bestStreak: number
    completedToday: boolean
    category: string
    targetGoal?: number
    color?: string
}

const Home = () => {
    const router = useRouter()
    const [habits, setHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [stats, setStats] = useState({
        totalHabits: 0,
        completedToday: 0,
        activeStreak: 0,
        totalCompletions: 0
    })

    // Fetch habits from Firebase
    const fetchHabits = async () => {
        try {
            const user = auth.currentUser
            if (!user) {
                router.push("/login")
                return
            }

            const habitsRef = collection(db, "habits")
            const q = query(habitsRef, where("userId", "==", user.uid))
            const querySnapshot = await getDocs(q)
            
            const habitsData: Habit[] = []
            querySnapshot.forEach((doc) => {
                habitsData.push({ id: doc.id, ...doc.data() } as Habit)
            })

            setHabits(habitsData)
            
            // Calculate stats
            const completedCount = habitsData.filter(h => h.completedToday).length
            const avgStreak = habitsData.length > 0 
                ? Math.round(habitsData.reduce((sum, h) => sum + h.currentStreak, 0) / habitsData.length)
                : 0
            
            setStats({
                totalHabits: habitsData.length,
                completedToday: completedCount,
                activeStreak: avgStreak,
                totalCompletions: habitsData.reduce((sum, h) => sum + (h.currentStreak || 0), 0)
            })
        } catch (error) {
            console.error("Error fetching habits:", error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load habits'
            })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchHabits()
    }, [])

    const onRefresh = () => {
        setRefreshing(true)
        fetchHabits()
    }

    // Mark habit as complete
    const handleCompleteHabit = async (habitId: string) => {
        try {
            const habitRef = doc(db, "habits", habitId)
            await updateDoc(habitRef, {
                completedToday: true,
                currentStreak: increment(1),
                lastCompletedDate: new Date().toISOString()
            })
            
            Toast.show({
                type: 'success',
                text1: '🎉 Great job!',
                text2: 'Habit completed for today'
            })
            
            fetchHabits() // Refresh data
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update habit'
            })
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good Morning"
        if (hour < 18) return "Good Afternoon"
        return "Good Evening"
    }

    const getCategoryIcon = (category: string) => {
        switch(category.toLowerCase()) {
            case 'health':
                return <Svg width="20" height="20" viewBox="0 0 24 24"><Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EF4444"/></Svg>
            case 'productivity':
                return <Svg width="20" height="20" viewBox="0 0 24 24"><Path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="#3B82F6"/></Svg>
            case 'learning':
                return <Svg width="20" height="20" viewBox="0 0 24 24"><Path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" fill="#8B5CF6"/></Svg>
            case 'mindfulness':
                return <Svg width="20" height="20" viewBox="0 0 24 24"><Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#10B981"/></Svg>
            default:
                return <Svg width="20" height="20" viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#F59E0B"/></Svg>
        }
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-gray-600 mt-4">Loading your habits...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            
            <ScrollView 
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />
                }
            >
                {/* Header */}
                <View className="bg-white px-6 pt-12 pb-6 shadow-sm">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                            <Text className="text-gray-600 text-sm mb-1">{getGreeting()}</Text>
                            <Text className="text-3xl font-black text-gray-900">Your Forge</Text>
                        </View>
                        <Pressable 
                            onPress={() => router.push("/settings")}
                            className="bg-gray-100 rounded-full p-3 active:bg-gray-200"
                        >
                            <Svg width="24" height="24" viewBox="0 0 24 24">
                                <Path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="#6B7280"/>
                            </Svg>
                        </Pressable>
                    </View>

                    {/* Quick Stats */}
                    <View className="flex-row justify-between mt-4">
                        <View className="bg-orange-50 rounded-2xl px-4 py-3 flex-1 mr-2">
                            <Text className="text-orange-600 text-xs font-semibold uppercase tracking-wide">Today</Text>
                            <Text className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.completedToday}/{stats.totalHabits}
                            </Text>
                        </View>
                        <View className="bg-blue-50 rounded-2xl px-4 py-3 flex-1 mx-1">
                            <Text className="text-blue-600 text-xs font-semibold uppercase tracking-wide">Streak</Text>
                            <Text className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.activeStreak} 🔥
                            </Text>
                        </View>
                        <View className="bg-purple-50 rounded-2xl px-4 py-3 flex-1 ml-2">
                            <Text className="text-purple-600 text-xs font-semibold uppercase tracking-wide">Total</Text>
                            <Text className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.totalCompletions}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Progress Ring Section */}
                <View className="px-6 py-6">
                    <View className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-6 shadow-lg">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-white text-lg font-bold mb-2">
                                    Daily Progress
                                </Text>
                                <Text className="text-orange-100 text-sm">
                                    {stats.completedToday === stats.totalHabits 
                                        ? "Perfect! All habits completed 🎉" 
                                        : `${stats.totalHabits - stats.completedToday} habits remaining`}
                                </Text>
                                <View className="mt-4">
                                    <Text className="text-white text-4xl font-black">
                                        {stats.totalHabits > 0 
                                            ? Math.round((stats.completedToday / stats.totalHabits) * 100)
                                            : 0}%
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-white bg-opacity-20 rounded-full p-4">
                                <Svg width="60" height="60" viewBox="0 0 60 60">
                                    <Circle
                                        cx="30"
                                        cy="30"
                                        r="25"
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth="6"
                                        fill="none"
                                    />
                                    <Circle
                                        cx="30"
                                        cy="30"
                                        r="25"
                                        stroke="#fff"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${(stats.completedToday / stats.totalHabits) * 157} 157`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 30 30)"
                                    />
                                </Svg>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Today's Habits */}
                <View className="px-6 pb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">Today's Habits</Text>
                        <Pressable onPress={() => router.push("/habits")}>
                            <Text className="text-orange-600 font-semibold text-sm">View All</Text>
                        </Pressable>
                    </View>

                    {habits.length === 0 ? (
                        <View className="bg-white rounded-3xl p-8 items-center shadow-sm">
                            <Svg width="80" height="80" viewBox="0 0 24 24">
                                <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#D1D5DB"/>
                            </Svg>
                            <Text className="text-gray-600 text-center mt-4 mb-2 font-semibold">
                                No habits yet
                            </Text>
                            <Text className="text-gray-500 text-center text-sm mb-4">
                                Start building better habits today
                            </Text>
                            <Pressable 
                                onPress={() => router.push("/add-habit")}
                                className="bg-orange-500 rounded-full px-6 py-3 active:bg-orange-600"
                            >
                                <Text className="text-white font-semibold">Create Your First Habit</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            {habits.map((habit) => (
                                <Pressable
                                    key={habit.id}
                                    onPress={() => router.push({
                                        pathname: '/habit-detail/[id]',
                                        params: { id: habit.id }
                                    } as any)}
                                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm active:bg-gray-50"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1">
                                            <View className="bg-gray-100 rounded-full p-3 mr-3">
                                                {getCategoryIcon(habit.category)}
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-gray-900 font-semibold text-base mb-1">
                                                    {habit.name}
                                                </Text>
                                                <View className="flex-row items-center">
                                                    <Text className="text-gray-500 text-xs mr-2">
                                                        🔥 {habit.currentStreak} day streak
                                                    </Text>
                                                    <Text className="text-gray-400 text-xs">
                                                        • Best: {habit.bestStreak}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        {habit.completedToday ? (
                                            <View className="bg-green-100 rounded-full p-3">
                                                <Svg width="24" height="24" viewBox="0 0 24 24">
                                                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#10B981"/>
                                                </Svg>
                                            </View>
                                        ) : (
                                            <Pressable 
                                                onPress={() => handleCompleteHabit(habit.id)}
                                                className="bg-orange-500 rounded-full p-3 active:bg-orange-600"
                                            >
                                                <Svg width="24" height="24" viewBox="0 0 24 24">
                                                    <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff"/>
                                                </Svg>
                                            </Pressable>
                                        )}
                                    </View>
                                </Pressable>
                            ))}
                        </>
                    )}
                </View>

                {/* Quick Actions */}
                {habits.length > 0 && (
                    <View className="px-6 pb-8">
                        <Text className="text-xl font-bold text-gray-900 mb-4">Quick Actions</Text>
                        <View className="flex-row justify-between">
                            <Pressable 
                                onPress={() => router.push("/add-habit")}
                                className="bg-orange-500 rounded-2xl p-4 flex-1 mr-2 items-center shadow-sm active:bg-orange-600"
                            >
                                <Svg width="32" height="32" viewBox="0 0 24 24">
                                    <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#fff"/>
                                </Svg>
                                <Text className="text-white font-semibold mt-2">New Habit</Text>
                            </Pressable>
                            
                            <Pressable 
                                onPress={() => router.push("/progress")}
                                className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex-1 ml-2 items-center shadow-sm active:bg-gray-50"
                            >
                                <Svg width="32" height="32" viewBox="0 0 24 24">
                                    <Path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" fill="#F97316"/>
                                </Svg>
                                <Text className="text-gray-700 font-semibold mt-2">Progress</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <Pressable 
                onPress={() => router.push("/add-habit")}
                className="absolute bottom-8 right-6 bg-orange-500 rounded-full p-5 shadow-2xl active:bg-orange-600"
                style={{ elevation: 8 }}
            >
                <Svg width="28" height="28" viewBox="0 0 24 24">
                    <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#fff"/>
                </Svg>
            </Pressable>
        </SafeAreaView>
    )
}

export default Home