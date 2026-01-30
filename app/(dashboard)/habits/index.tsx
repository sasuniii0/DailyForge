import { auth, db } from "@/service/firebase.config";
import { Habit } from "@/types/habits";
import { HabitService } from "../../../service/habitService"; // Import the service we built
import { useRouter } from "expo-router";
import { collection, query, where, getDocs, doc, updateDoc, increment, deleteDoc } from "firebase/firestore";
import { useEffect, useState, useCallback } from "react";
import { 
  ActivityIndicator, Pressable, RefreshControl, SafeAreaView, 
  ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View 
} from "react-native";
import { Circle, Path, Svg } from "react-native-svg";
import Toast from "react-native-toast-message";

type FilterType = 'all' | 'active' | 'completed' | 'health' | 'productivity' | 'learning' | 'mindfulness';
type SortType = 'name' | 'streak' | 'recent' | 'category';

const Habits = () => {
    const router = useRouter();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [filteredHabits, setFilteredHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortType, setSortType] = useState<SortType>('recent');

    // 1. Fetch habits using the user's UID
    const fetchHabits = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                router.replace("/login");
                return;
            }

            const habitsData = await HabitService.getUserHabits(user.uid);
            setHabits(habitsData);
            applyFiltersAndSort(habitsData, filterType, sortType, searchQuery);
        } catch (error) {
            console.error("Error fetching habits:", error);
            Toast.show({ type: 'error', text1: 'Forge Cold', text2: 'Failed to load habits.' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchHabits(); }, []);

    // 2. Real-time filtering and sorting
    useEffect(() => {
        applyFiltersAndSort(habits, filterType, sortType, searchQuery);
    }, [searchQuery, filterType, sortType, habits]);

    const applyFiltersAndSort = (habitsData: Habit[], filter: FilterType, sort: SortType, search: string) => {
        let filtered = [...habitsData];

        if (search) {
            filtered = filtered.filter(habit => 
                habit.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (filter !== 'all') {
            if (filter === 'active') filtered = filtered.filter(h => !h.completedToday);
            else if (filter === 'completed') filtered = filtered.filter(h => h.completedToday);
            else filtered = filtered.filter(h => h.category.toLowerCase() === filter);
        }

        filtered.sort((a, b) => {
            if (sort === 'name') return a.name.localeCompare(b.name);
            if (sort === 'streak') return b.currentStreak - a.currentStreak;
            if (sort === 'category') return a.category.localeCompare(b.category);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setFilteredHabits(filtered);
    };

    // 3. Handle Completion Strike
    const handleToggleComplete = async (habit: Habit) => {
        try {
            // Using the service logic we established
            await HabitService.completeHabit(habit.id, habit);
            Toast.show({ 
                type: 'success', 
                text1: habit.completedToday ? 'Iron Reheated' : 'Strike Success!', 
                text2: habit.completedToday ? 'Habit reset for today.' : 'Streak continued!' 
            });
            fetchHabits(); // Refresh the list
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Forge Failure', text2: 'Could not update habit.' });
        }
    };

    const getCategoryIcon = (category: string) => {
        const iconProps = { width: "20", height: "20", viewBox: "0 0 24 24" };
        switch(category.toLowerCase()) {
            case 'health': return <Svg {...iconProps}><Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#EF4444"/></Svg>;
            case 'productivity': return <Svg {...iconProps}><Path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="#010101"/></Svg>;
            default: return <Svg {...iconProps}><Circle cx="12" cy="12" r="10" fill="#F59E0B"/></Svg>;
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="text-gray-600 mt-4 font-bold">Stoking the forge...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            
            {/* Header */}
            <View className="bg-white px-6 pt-12 pb-4 shadow-sm border-b border-gray-100">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-3xl font-black text-gray-900">Daily Forge</Text>
                    <View className="bg-orange-100 rounded-full px-3 py-1">
                        <Text className="text-orange-700 font-bold text-sm">{filteredHabits.length} Tasks</Text>
                    </View>
                </View>

                {/* Search */}
                <View className="bg-gray-100 rounded-2xl px-4 py-3 mb-3 flex-row items-center">
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search your tools..."
                        className="flex-1 text-gray-900 text-base"
                    />
                </View>

                {/* Filters */}
                <View className="flex-row gap-2">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                        {['all', 'active', 'completed', 'health', 'productivity'].map((f) => (
                            <TouchableOpacity 
                                key={f} 
                                onPress={() => setFilterType(f as FilterType)}
                                className={`mr-2 px-4 py-2 rounded-xl ${filterType === f ? 'bg-orange-500' : 'bg-gray-100'}`}
                            >
                                <Text className={`capitalize font-bold ${filterType === f ? 'text-white' : 'text-gray-500'}`}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <ScrollView 
                className="flex-1" 
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchHabits} tintColor="#F97316" />}
            >
                <View className="px-6 py-4">
                    {filteredHabits.length === 0 ? (
                        <View className="items-center py-20">
                            <Text className="text-gray-400 font-medium">No iron in the fire yet.</Text>
                        </View>
                    ) : (
                        filteredHabits.map((habit) => (
                            <Pressable
                                key={habit.id}
                                onPress={() => router.push({ pathname: "/habits/[id]", params: { id: habit.id } } as any)}
                                className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100 flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="bg-gray-50 rounded-2xl p-3 mr-4">
                                        {getCategoryIcon(habit.category)}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 font-black text-lg" numberOfLines={1}>{habit.name}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <Text className="text-orange-600 text-sm font-bold mr-3">🔥 {habit.currentStreak}</Text>
                                            <Text className="text-gray-400 text-xs uppercase tracking-widest">{habit.frequency}</Text>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity 
                                    onPress={() => handleToggleComplete(habit)}
                                    className={`w-14 h-14 rounded-2xl items-center justify-center ${habit.completedToday ? 'bg-green-500' : 'bg-orange-500 shadow-orange-200 shadow-lg'}`}
                                >
                                    <Svg width="28" height="28" viewBox="0 0 24 24">
                                        <Path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#fff" strokeWidth="1" />
                                    </Svg>
                                </TouchableOpacity>
                            </Pressable>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <Pressable 
                onPress={() => router.push("/habits/add-habit")}
                className="absolute bottom-8 right-6 bg-black rounded-full p-5 shadow-2xl"
            >
                <Svg width="28" height="28" viewBox="0 0 24 24">
                    <Path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#fff"/>
                </Svg>
            </Pressable>
        </SafeAreaView>
    );
};

export default Habits;