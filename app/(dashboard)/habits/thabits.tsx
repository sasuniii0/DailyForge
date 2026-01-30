import { View, Text, ScrollView, SafeAreaView, StatusBar, Pressable, TextInput, Modal, ActivityIndicator, RefreshControl } from "react-native"
import { useRouter } from "expo-router"
import React, { useState, useEffect, useCallback } from "react"
import Svg, { Path, Circle } from 'react-native-svg'
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, increment } from "firebase/firestore"
// Updated to match your detail screen path
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
    totalCompletions?: number
    lastCompletedDate?: string
}

type FilterType = 'all' | 'active' | 'completed' | 'health' | 'productivity' | 'learning' | 'mindfulness'
type SortType = 'name' | 'streak' | 'recent' | 'category'

const Habits = () => {
    const router = useRouter()
    const [habits, setHabits] = useState<Habit[]>([])
    const [filteredHabits, setFilteredHabits] = useState<Habit[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<FilterType>('all')
    const [sortType, setSortType] = useState<SortType>('recent')
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)

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
            applyFiltersAndSort(habitsData, filterType, sortType, searchQuery)
        } catch (error) {
            console.error("Error fetching habits:", error)
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load your forge' })
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchHabits()
    }, [])

    useEffect(() => {
        applyFiltersAndSort(habits, filterType, sortType, searchQuery)
    }, [searchQuery, filterType, sortType, habits])

    const applyFiltersAndSort = (habitsData: Habit[], filter: FilterType, sort: SortType, search: string) => {
        let filtered = [...habitsData]

        if (search) {
            filtered = filtered.filter(habit => 
                habit.name.toLowerCase().includes(search.toLowerCase()) ||
                habit.description?.toLowerCase().includes(search.toLowerCase())
            )
        }

        switch(filter) {
            case 'active': filtered = filtered.filter(h => !h.completedToday); break
            case 'completed': filtered = filtered.filter(h => h.completedToday); break
            case 'health':
            case 'productivity':
            case 'learning':
            case 'mindfulness':
                filtered = filtered.filter(h => h.category.toLowerCase() === filter)
                break
        }

        switch(sort) {
            case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break
            case 'streak': filtered.sort((a, b) => b.currentStreak - a.currentStreak); break
            case 'recent': filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break
            case 'category': filtered.sort((a, b) => a.category.localeCompare(b.category)); break
        }
        setFilteredHabits(filtered)
    }

    const handleCompleteHabit = async (habit: Habit) => {
        try {
            const habitRef = doc(db, "habits", habit.id)
            const newCompletedStatus = !habit.completedToday
            const todayDate = new Date().toISOString().split('T')[0]
            
            // Mirroring the logic from your HabitDetail.tsx
            await updateDoc(habitRef, {
                completedToday: newCompletedStatus,
                currentStreak: newCompletedStatus ? habit.currentStreak + 1 : Math.max(0, habit.currentStreak - 1),
                bestStreak: newCompletedStatus && habit.currentStreak + 1 > habit.bestStreak 
                    ? habit.currentStreak + 1 
                    : habit.bestStreak,
                totalCompletions: newCompletedStatus ? increment(1) : increment(-1),
                lastCompletedDate: newCompletedStatus ? todayDate : (habit.lastCompletedDate || null)
            })
            
            Toast.show({
                type: 'success',
                text1: newCompletedStatus ? '⚒️ Habit Forged!' : '↩️ Undone',
                text2: newCompletedStatus ? 'Keep the fire burning!' : 'Progress reversed'
            })
            
            fetchHabits()
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'The forge failed to update' })
        }
    }

    const handleDeleteHabit = async () => {
        if (!selectedHabit) return
        try {
            await deleteDoc(doc(db, "habits", selectedHabit.id))
            Toast.show({ type: 'success', text1: 'Removed', text2: 'Habit removed from the forge' })
            setShowDeleteModal(false)
            setSelectedHabit(null)
            fetchHabits()
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete' })
        }
    }

    // Helper for Category Icons (Same as your Detail Screen style)
    const getCategoryIcon = (category: string) => {
        const iconProps = { width: "20", height: "20", viewBox: "0 0 24 24" }
        switch(category.toLowerCase()) {
            case 'health': return <Svg {...iconProps}><Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EF4444"/></Svg>
            case 'productivity': return <Svg {...iconProps}><Path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="#3B82F6"/></Svg>
            default: return <Svg {...iconProps}><Circle cx="12" cy="12" r="10" fill="#F59E0B"/></Svg>
        }
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="text-gray-600 mt-4">Stoking the forge...</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            
            {/* Header with Search & Filter */}
            <View className="bg-white px-6 pt-12 pb-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-3xl font-black text-gray-900">Daily Forge</Text>
                    <View className="bg-orange-100 rounded-full px-3 py-1">
                        <Text className="text-orange-700 font-bold text-sm">{filteredHabits.length} Habits</Text>
                    </View>
                </View>

                {/* Search Input */}
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-3">
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search your habits..."
                        className="flex-1 text-gray-900 text-base"
                    />
                </View>

                <View className="flex-row justify-between">
                    <Pressable onPress={() => setShowFilterModal(true)} className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 mr-2">
                        <Text className="text-gray-700 font-semibold text-sm capitalize">{filterType}</Text>
                    </Pressable>
                    <Pressable 
                        onPress={() => {
                            const sorts: SortType[] = ['recent', 'streak', 'name']
                            setSortType(sorts[(sorts.indexOf(sortType) + 1) % sorts.length])
                        }} 
                        className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 ml-2"
                    >
                        <Text className="text-gray-700 font-semibold text-sm capitalize">Sort: {sortType}</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView 
                className="flex-1" 
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchHabits} tintColor="#F97316" />}
            >
                <View className="px-6 py-4">
                    {filteredHabits.map((habit) => (
                        <Pressable
                            key={habit.id}
                            onPress={() => router.push({
                                    pathname: "/habit-detail/[id]",
                                    params: { id: habit.id }
                                }as any)}
                            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row items-start justify-between">
                                <View className="flex-row items-start flex-1">
                                    <View className="bg-gray-50 rounded-full p-3 mr-3">
                                        {getCategoryIcon(habit.category)}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 font-bold text-lg">{habit.name}</Text>
                                        <Text className="text-orange-600 text-sm font-bold">🔥 {habit.currentStreak} Day Streak</Text>
                                        <Text className="text-gray-400 text-xs mt-1">Total Wins: {habit.totalCompletions || 0}</Text>
                                    </View>
                                </View>

                                <Pressable 
                                    onPress={(e) => { e.stopPropagation(); handleCompleteHabit(habit); }}
                                    className={`${habit.completedToday ? 'bg-green-500' : 'bg-orange-500'} rounded-full p-4 shadow-md`}
                                >
                                    <Svg width="24" height="24" viewBox="0 0 24 24">
                                        <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff"/>
                                    </Svg>
                                </Pressable>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            {/* <Pressable 
                onPress={() => router.push("/add-habit")}
                className="absolute bottom-8 right-6 bg-orange-600 rounded-full p-5 shadow-2xl"
            >
                <Svg width="28" height="28" viewBox="0 0 24 24">
                    <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#fff"/>
                </Svg>
            </Pressable> */}

            {/* Reusing your existing Modal structures for Filters and Deletion... */}
        </SafeAreaView>
    )
}

export default Habits