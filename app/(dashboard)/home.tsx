import { View, Text, ScrollView, SafeAreaView, StatusBar, Pressable, RefreshControl, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import Svg, { Path, Circle } from 'react-native-svg';
import { collection, query, where, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../../service/firebase.config";
import Toast from "react-native-toast-message";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Habit } from "../../types/habits";

const { width } = Dimensions.get('window');

const Home = () => {
    const router = useRouter();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalHabits: 0,
        completedToday: 0,
        activeStreak: 0,
        totalCompletions: 0
    });

    const fetchHabits = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                router.push("/login");
                return;
            }

            const habitsRef = collection(db, "habits");
            const q = query(habitsRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            
            const habitsData: Habit[] = [];
            querySnapshot.forEach((doc) => {
                habitsData.push({ id: doc.id, ...doc.data() } as Habit);
            });

            setHabits(habitsData);
            
            const completedCount = habitsData.filter(h => h.completedToday).length;
            const maxStreak = habitsData.length > 0 ? Math.max(...habitsData.map(h => h.currentStreak)) : 0;
            
            setStats({
                totalHabits: habitsData.length,
                completedToday: completedCount,
                activeStreak: maxStreak,
                totalCompletions: habitsData.reduce((sum, h) => sum + (h.currentStreak || 0), 0)
            });
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Forge Error', text2: 'Failed to heat up the furnace.' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchHabits(); }, []);

    const handleCompleteHabit = async (habitId: string) => {
        try {
            const habitRef = doc(db, "habits", habitId);
            await updateDoc(habitRef, {
                completedToday: true,
                currentStreak: increment(1),
                lastCompletedDate: new Date().toISOString()
            });
            
            Toast.show({ type: 'success', text1: 'Iron Struck!', text2: 'Habit hardened for today.' });
            fetchHabits(); 
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Faulty Strike', text2: 'Try hitting the anvil again.' });
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#F97316" />
                <Text className="text-gray-500 font-bold mt-4 tracking-widest uppercase">Firing up the Forge...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" />
            
            <ScrollView 
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHabits(); }} tintColor="#F97316" />}
            >
                {/* Header Section */}
                <View className="bg-white px-6 pt-8 pb-6 border-b border-gray-100">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-tighter">Smithing Session</Text>
                            <Text className="text-3xl font-black text-gray-900">The Forge</Text>
                        </View>
                        <Pressable onPress={() => router.push("/settings")} className="bg-gray-100 p-3 rounded-2xl border border-gray-200">
                             <MaterialCommunityIcons name="hammer-screwdriver" size={24} color="#4B5563" />
                        </Pressable>
                    </View>

                    {/* Stats Dashboard */}
                    <View className="flex-row mt-6 gap-3">
                        <View className="flex-1 bg-orange-600 p-4 rounded-3xl shadow-lg shadow-orange-300">
                            <MaterialCommunityIcons name="fire" size={24} color="white" />
                            <Text className="text-white/80 font-bold text-[10px] uppercase mt-2">Highest Heat</Text>
                            <Text className="text-white text-2xl font-black">{stats.activeStreak} Days</Text>
                        </View>
                        <View className="flex-1 bg-zinc-900 p-4 rounded-3xl">
                            <MaterialCommunityIcons name="anvil" size={24} color="#F97316" />
                            <Text className="text-gray-400 font-bold text-[10px] uppercase mt-2">Total Strikes</Text>
                            <Text className="text-white text-2xl font-black">{stats.totalCompletions}</Text>
                        </View>
                    </View>
                </View>

                {/* Daily Progress Card */}
                <View className="p-6">
                    <View className="bg-white border border-gray-200 rounded-[32px] p-6 shadow-sm overflow-hidden">
                        <View className="flex-row justify-between items-center z-10">
                            <View className="flex-1">
                                <Text className="text-gray-900 text-lg font-black leading-tight">
                                    {stats.completedToday === stats.totalHabits ? "All Iron Forged!" : "Hammer Away"}
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">
                                    {stats.totalHabits - stats.completedToday} tools left to quench
                                </Text>
                            </View>
                            <View className="items-center justify-center">
                                <Text className="text-orange-600 text-2xl font-black">{Math.round((stats.completedToday / stats.totalHabits) * 100 || 0)}%</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase">Hardened</Text>
                            </View>
                        </View>
                        {/* Simple Progress Bar */}
                        <View className="h-2 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
                            <View 
                                className="h-full bg-orange-500" 
                                style={{ width: `${(stats.completedToday / stats.totalHabits) * 100}%` }} 
                            />
                        </View>
                    </View>
                </View>

                {/* Habit List */}
                <View className="px-6 pb-24">
                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-4 ml-1">Today's Blueprint</Text>
                    
                    {habits.length === 0 ? (
                        <View className="bg-white rounded-3xl p-10 items-center border border-dashed border-gray-300">
                            <MaterialCommunityIcons name="plus-circle-outline" size={48} color="#D1D5DB" />
                            <Text className="text-gray-400 font-bold mt-2">No blueprints found.</Text>
                            <Pressable onPress={() => router.push("/habits/add-habit")} className="mt-4 bg-zinc-900 px-6 py-3 rounded-full">
                                <Text className="text-white font-bold">Start Forging</Text>
                            </Pressable>
                        </View>
                    ) : (
                        habits.map((habit) => (
                            <Pressable
                                key={habit.id}
                                onPress={() => router.push({ pathname: '/habit-detail/[id]', params: { id: habit.id } } as any)}
                                className={`flex-row items-center p-4 rounded-[24px] mb-3 border ${habit.completedToday ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 shadow-sm'}`}
                            >
                                <View className={`p-3 rounded-2xl mr-4 ${habit.completedToday ? 'bg-green-500' : 'bg-gray-100'}`}>
                                    <MaterialCommunityIcons 
                                        name={habit.completedToday ? "check-bold" : "hammer"} 
                                        size={20} 
                                        color={habit.completedToday ? "white" : "#4B5563"} 
                                    />
                                </View>
                                
                                <View className="flex-1">
                                    <Text className={`font-bold text-base ${habit.completedToday ? 'text-green-800 line-through opacity-60' : 'text-gray-900'}`}>
                                        {habit.name}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-tighter">{habit.category}</Text>
                                        <View className="mx-2 w-1 h-1 rounded-full bg-gray-300" />
                                        <Text className="text-orange-600 text-[10px] font-bold">🔥 {habit.currentStreak} Day Streak</Text>
                                    </View>
                                </View>

                                {!habit.completedToday && (
                                    <Pressable 
                                        onPress={() => handleCompleteHabit(habit.id)}
                                        className="bg-orange-500 w-12 h-12 rounded-2xl items-center justify-center shadow-md shadow-orange-200"
                                    >
                                        <MaterialCommunityIcons name="lightning-bolt" size={24} color="white" />
                                    </Pressable>
                                )}
                            </Pressable>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <Pressable 
                onPress={() => router.push("/habits/add-habit")}
                className="absolute bottom-8 right-6 bg-zinc-900 w-16 h-16 rounded-full items-center justify-center shadow-2xl"
                style={{ elevation: 10 }}
            >
                <MaterialCommunityIcons name="plus" size={32} color="white" />
            </Pressable>
        </SafeAreaView>
    );
};

export default Home;