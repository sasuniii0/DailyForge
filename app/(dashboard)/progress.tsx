import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, Dimensions } from "react-native";
import { auth } from "@/service/firebase.config";
import { HabitService } from "@/service/habitService";
import { Habit } from "@/types/habits";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const Progress = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [stats, setStats] = useState({
    totalWins: 0,
    activeStreaks: 0,
    bestStreakEver: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const user = auth.currentUser;
      if (user) {
        const data = await HabitService.getUserHabits(user.uid);
        setHabits(data);
        calculateStats(data);
      }
    };
    loadStats();
  }, []);

  const calculateStats = (data: Habit[]) => {
    const totalWins = data.reduce((acc, h) => acc + (h.totalCompletions || 0), 0);
    const activeStreaks = data.reduce((acc, h) => acc + h.currentStreak, 0);
    const bestEver = Math.max(...data.map(h => h.bestStreak), 0);
    
    // Simple completion logic: (total wins / total habits) - just a placeholder metric
    const rate = data.length > 0 ? Math.round((totalWins / (data.length * 30)) * 100) : 0; 

    setStats({
      totalWins,
      activeStreaks,
      bestStreakEver: bestEver,
      completionRate: rate > 100 ? 100 : rate,
    });
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4 flex-row items-center">
      <View className={`${color} p-3 rounded-2xl mr-4`}>
        <MaterialIcons name={icon} size={24} color="white" />
      </View>
      <View>
        <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest">{title}</Text>
        <Text className="text-gray-900 font-black text-2xl">{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-6 pt-10">
        <Text className="text-3xl font-black text-gray-900 mb-2">Forge Ledger</Text>
        <Text className="text-gray-500 mb-8">Your journey in the fires of discipline.</Text>

        {/* Highlight Stats */}
        <View className="flex-row flex-wrap justify-between">
            <View style={{ width: '48%' }}>
                <StatCard title="Total Wins" value={stats.totalWins} icon="bolt" color="bg-orange-500" />
            </View>
            <View style={{ width: '48%' }}>
                <StatCard title="Best Heat" value={`${stats.bestStreakEver}d`} icon="whatshot" color="bg-red-500" />
            </View>
        </View>

        {/* Heat Map Placeholder / Progress Section */}
        <View className="bg-black p-6 rounded-3xl mb-8 shadow-xl">
            <Text className="text-white font-black text-lg mb-1">Consistency Rate</Text>
            <Text className="text-orange-200 text-xs mb-4">Monthly heat intensity</Text>
            
            <View className="h-4 bg-gray-800 rounded-full overflow-hidden">
                <View 
                    className="h-full bg-orange-500" 
                    style={{ width: `${stats.completionRate}%` }} 
                />
            </View>
            <Text className="text-right text-orange-500 font-bold mt-2">{stats.completionRate}% Capacity</Text>
        </View>

        {/* Individual Tool Performance */}
        <Text className="text-gray-400 font-black text-xs uppercase tracking-widest mb-4 ml-2">Tool Durability (Streaks)</Text>
        
        {habits.map((habit) => (
          <View key={habit.id} className="bg-white p-4 rounded-2xl mb-3 flex-row items-center justify-between border border-gray-100">
            <View className="flex-row items-center">
                <View className="w-2 h-10 bg-orange-500 rounded-full mr-4" />
                <View>
                    <Text className="text-gray-900 font-bold">{habit.name}</Text>
                    <Text className="text-gray-400 text-xs">{habit.category}</Text>
                </View>
            </View>
            <View className="items-end">
                <Text className="text-gray-900 font-black">{habit.currentStreak}d</Text>
                <Text className="text-gray-400 text-[10px]">CURRENT</Text>
            </View>
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Progress;