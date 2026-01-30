import { View, Text, ScrollView, SafeAreaView, StatusBar, Pressable, TextInput, Modal, ActivityIndicator, RefreshControl } from "react-native"
import { useRouter } from "expo-router"
import React, { useState, useEffect } from "react"
import Svg, { Path, Circle } from 'react-native-svg'
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
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
            applyFiltersAndSort(habitsData, filterType, sortType, searchQuery)
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

    useEffect(() => {
        applyFiltersAndSort(habits, filterType, sortType, searchQuery)
    }, [searchQuery, filterType, sortType, habits])

    const onRefresh = () => {
        setRefreshing(true)
        fetchHabits()
    }

    // Apply filters and sorting
    const applyFiltersAndSort = (habitsData: Habit[], filter: FilterType, sort: SortType, search: string) => {
        let filtered = [...habitsData]

        // Apply search
        if (search) {
            filtered = filtered.filter(habit => 
                habit.name.toLowerCase().includes(search.toLowerCase()) ||
                habit.description?.toLowerCase().includes(search.toLowerCase())
            )
        }

        // Apply filter
        switch(filter) {
            case 'active':
                filtered = filtered.filter(h => !h.completedToday)
                break
            case 'completed':
                filtered = filtered.filter(h => h.completedToday)
                break
            case 'health':
            case 'productivity':
            case 'learning':
            case 'mindfulness':
                filtered = filtered.filter(h => h.category.toLowerCase() === filter)
                break
        }

        // Apply sort
        switch(sort) {
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name))
                break
            case 'streak':
                filtered.sort((a, b) => b.currentStreak - a.currentStreak)
                break
            case 'recent':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                break
            case 'category':
                filtered.sort((a, b) => a.category.localeCompare(b.category))
                break
        }

        setFilteredHabits(filtered)
    }

    // Delete habit
    const handleDeleteHabit = async () => {
        if (!selectedHabit) return

        try {
            await deleteDoc(doc(db, "habits", selectedHabit.id))
            Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${selectedHabit.name} has been removed`
            })
            setShowDeleteModal(false)
            setSelectedHabit(null)
            fetchHabits()
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete habit'
            })
        }
    }

    // Mark habit as complete
    const handleCompleteHabit = async (habit: Habit) => {
        try {
            const habitRef = doc(db, "habits", habit.id)
            const newCompletedStatus = !habit.completedToday
            
            await updateDoc(habitRef, {
                completedToday: newCompletedStatus,
                currentStreak: newCompletedStatus ? habit.currentStreak + 1 : Math.max(0, habit.currentStreak - 1),
                bestStreak: newCompletedStatus && habit.currentStreak + 1 > habit.bestStreak 
                    ? habit.currentStreak + 1 
                    : habit.bestStreak,
                lastCompletedDate: newCompletedStatus ? new Date().toISOString() : null
            })
            
            Toast.show({
                type: 'success',
                text1: newCompletedStatus ? '✅ Completed!' : '↩️ Unchecked',
                text2: newCompletedStatus ? 'Great work!' : 'Marked as incomplete'
            })
            
            fetchHabits()
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update habit'
            })
        }
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

    const getFrequencyBadge = (frequency: string) => {
        const colors = {
            daily: 'bg-blue-100 text-blue-700',
            weekly: 'bg-purple-100 text-purple-700',
            monthly: 'bg-pink-100 text-pink-700'
        }
        return colors[frequency as keyof typeof colors] || colors.daily
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="text-gray-600 mt-4">Loading habits...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View className="bg-white px-6 pt-12 pb-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                        <Pressable 
                            onPress={() => router.back()}
                            className="mr-3 p-2 active:bg-gray-100 rounded-full"
                        >
                            <Svg width="24" height="24" viewBox="0 0 24 24">
                                <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#1F2937"/>
                            </Svg>
                        </Pressable>
                        <Text className="text-3xl font-black text-gray-900">All Habits</Text>
                    </View>
                    <View className="bg-orange-100 rounded-full px-3 py-1">
                        <Text className="text-orange-700 font-bold text-sm">{filteredHabits.length}</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-3">
                    <Svg width="20" height="20" viewBox="0 0 24 24">
                        <Path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#6B7280"/>
                    </Svg>
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search habits..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-gray-900 text-base"
                    />
                    {searchQuery ? (
                        <Pressable onPress={() => setSearchQuery("")}>
                            <Svg width="20" height="20" viewBox="0 0 24 24">
                                <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#6B7280"/>
                            </Svg>
                        </Pressable>
                    ) : null}
                </View>

                {/* Filter and Sort */}
                <View className="flex-row justify-between">
                    <Pressable 
                        onPress={() => setShowFilterModal(true)}
                        className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 mr-2 active:bg-gray-200"
                    >
                        <Svg width="18" height="18" viewBox="0 0 24 24">
                            <Path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="#4B5563"/>
                        </Svg>
                        <Text className="text-gray-700 font-semibold text-sm ml-2 capitalize">
                            {filterType === 'all' ? 'Filter' : filterType}
                        </Text>
                    </Pressable>

                    <Pressable 
                        onPress={() => {
                            const sorts: SortType[] = ['recent', 'name', 'streak', 'category']
                            const currentIndex = sorts.indexOf(sortType)
                            const nextSort = sorts[(currentIndex + 1) % sorts.length]
                            setSortType(nextSort)
                        }}
                        className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 flex-1 ml-2 active:bg-gray-200"
                    >
                        <Svg width="18" height="18" viewBox="0 0 24 24">
                            <Path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" fill="#4B5563"/>
                        </Svg>
                        <Text className="text-gray-700 font-semibold text-sm ml-2 capitalize">
                            {sortType === 'recent' ? 'Recent' : sortType}
                        </Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView 
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />
                }
            >
                <View className="px-6 py-4">
                    {filteredHabits.length === 0 ? (
                        <View className="bg-white rounded-3xl p-8 items-center shadow-sm mt-8">
                            <Svg width="80" height="80" viewBox="0 0 24 24">
                                <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#D1D5DB"/>
                            </Svg>
                            <Text className="text-gray-600 text-center mt-4 mb-2 font-semibold">
                                {searchQuery ? 'No habits found' : 'No habits yet'}
                            </Text>
                            <Text className="text-gray-500 text-center text-sm">
                                {searchQuery 
                                    ? 'Try adjusting your search or filters' 
                                    : 'Create your first habit to get started'}
                            </Text>
                        </View>
                    ) : (
                        filteredHabits.map((habit) => (
                            <Pressable
                                key={habit.id}
                                onPress={() => router.push({
                                    pathname: '/habit-detail/[id]',
                                    params: { id: habit.id }
                                } as any)}
                                className="bg-white rounded-2xl p-4 mb-3 shadow-sm active:bg-gray-50"
                            >
                                <View className="flex-row items-start justify-between mb-3">
                                    <View className="flex-row items-start flex-1">
                                        <View className="bg-gray-100 rounded-full p-3 mr-3">
                                            {getCategoryIcon(habit.category)}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-bold text-base mb-1">
                                                {habit.name}
                                            </Text>
                                            {habit.description && (
                                                <Text className="text-gray-500 text-sm mb-2" numberOfLines={2}>
                                                    {habit.description}
                                                </Text>
                                            )}
                                            <View className="flex-row items-center flex-wrap">
                                                <View className={`${getFrequencyBadge(habit.frequency)} rounded-full px-3 py-1 mr-2 mb-1`}>
                                                    <Text className="text-xs font-semibold capitalize">
                                                        {habit.frequency}
                                                    </Text>
                                                </View>
                                                <View className="bg-orange-50 rounded-full px-3 py-1 mb-1">
                                                    <Text className="text-orange-700 text-xs font-semibold">
                                                        🔥 {habit.currentStreak} days
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Complete Button */}
                                    <Pressable 
                                        onPress={(e) => {
                                            e.stopPropagation()
                                            handleCompleteHabit(habit)
                                        }}
                                        className={`${habit.completedToday ? 'bg-green-100' : 'bg-orange-500'} rounded-full p-3 ml-2 active:opacity-80`}
                                    >
                                        <Svg width="20" height="20" viewBox="0 0 24 24">
                                            <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill={habit.completedToday ? "#10B981" : "#fff"}/>
                                        </Svg>
                                    </Pressable>
                                </View>

                                {/* Quick Actions */}
                                <View className="flex-row justify-end pt-3 border-t border-gray-100">
                                    <Pressable 
                                        onPress={(e) => {
                                            e.stopPropagation()
                                            router.push({
                                                pathname: '/edit-habit/[id]',
                                                params: { id: habit.id }
                                            } as any)
                                        }}
                                        className="flex-row items-center mr-4 active:opacity-60"
                                    >
                                        <Svg width="16" height="16" viewBox="0 0 24 24">
                                            <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#6B7280"/>
                                        </Svg>
                                        <Text className="text-gray-600 text-xs font-semibold ml-1">Edit</Text>
                                    </Pressable>

                                    <Pressable 
                                        onPress={(e) => {
                                            e.stopPropagation()
                                            setSelectedHabit(habit)
                                            setShowDeleteModal(true)
                                        }}
                                        className="flex-row items-center active:opacity-60"
                                    >
                                        <Svg width="16" height="16" viewBox="0 0 24 24">
                                            <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444"/>
                                        </Svg>
                                        <Text className="text-red-600 text-xs font-semibold ml-1">Delete</Text>
                                    </Pressable>
                                </View>
                            </Pressable>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <Pressable 
                    className="flex-1 bg-black/50 justify-end"
                    onPress={() => setShowFilterModal(false)}
                >
                    <Pressable 
                        className="bg-white rounded-t-3xl p-6"
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Filter Habits</Text>
                            <Pressable onPress={() => setShowFilterModal(false)}>
                                <Svg width="24" height="24" viewBox="0 0 24 24">
                                    <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="#6B7280"/>
                                </Svg>
                            </Pressable>
                        </View>

                        <View className="gap-3">
                            {['all', 'active', 'completed', 'health', 'productivity', 'learning', 'mindfulness'].map((filter) => (
                                <Pressable
                                    key={filter}
                                    onPress={() => {
                                        setFilterType(filter as FilterType)
                                        setShowFilterModal(false)
                                    }}
                                    className={`p-4 rounded-xl border-2 ${
                                        filterType === filter 
                                            ? 'bg-orange-50 border-orange-500' 
                                            : 'bg-white border-gray-200'
                                    } active:bg-gray-50`}
                                >
                                    <Text className={`font-semibold capitalize ${
                                        filterType === filter ? 'text-orange-600' : 'text-gray-700'
                                    }`}>
                                        {filter}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                        <View className="items-center mb-4">
                            <View className="bg-red-100 rounded-full p-4 mb-4">
                                <Svg width="32" height="32" viewBox="0 0 24 24">
                                    <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="#EF4444"/>
                                </Svg>
                            </View>
                            <Text className="text-xl font-bold text-gray-900 mb-2">Delete Habit?</Text>
                            <Text className="text-gray-600 text-center">
                                Are you sure you want to delete "{selectedHabit?.name}"? This action cannot be undone.
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            <Pressable
                                onPress={() => {
                                    setShowDeleteModal(false)
                                    setSelectedHabit(null)
                                }}
                                className="flex-1 bg-gray-100 rounded-full py-3 items-center active:bg-gray-200"
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleDeleteHabit}
                                className="flex-1 bg-red-500 rounded-full py-3 items-center active:bg-red-600"
                            >
                                <Text className="text-white font-semibold">Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Floating Action Button
            <Pressable 
                onPress={() => router.push("/add-habit")}
                className="absolute bottom-8 right-6 bg-orange-500 rounded-full p-5 shadow-2xl active:bg-orange-600"
                style={{ elevation: 8 }}
            >
                <Svg width="28" height="28" viewBox="0 0 24 24">
                    <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#fff"/>
                </Svg>
            </Pressable> */}
        </SafeAreaView>
    )
}

export default Habits