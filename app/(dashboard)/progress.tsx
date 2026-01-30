import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, Dimensions } from "react-native";
import { auth } from "@/service/firebase.config";
import { HabitService } from "@/service/habitService";
import { Habit } from "@/types/habits";
import { ContributionGraph } from "react-native-chart-kit";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

// StatCard defined OUTSIDE to fix ts(2304)
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

const Progress = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const [stats, setStats] = useState({
    totalWins: 0,
    bestStreakEver: 0,
  });

  useEffect(() => {
    const loadAllData = async () => {
      const user = auth.currentUser;
      if (user) {
        // 1. Load Habits & Basic Stats
        const data = await HabitService.getUserHabits(user.uid);
        setHabits(data);
        
        const totalWins = data.reduce((acc, h) => acc + (h.totalCompletions || 0), 0);
        const bestEver = Math.max(...data.map(h => h.bestStreak), 0);
        setStats({ totalWins, bestStreakEver: bestEver });

        // 2. Load Heatmap Data (Mocked for now, replace with a real Firestore query later)
        const mockHeatmap = [
          { date: "2026-01-01", count: 2 },
          { date: "2026-01-02", count: 4 },
          { date: "2026-01-05", count: 5 },
          { date: "2026-01-10", count: 3 },
          { date: "2026-01-30", count: 4 },
        ];
        setHeatmapData(mockHeatmap);
      }
    };
    loadAllData();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientTo: "#000",
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-6 pt-10" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-gray-900 mb-2">Forge Ledger</Text>
        <Text className="text-gray-500 mb-8">Your journey in the fires of discipline.</Text>

        {/* Highlight Stats */}
        <View className="flex-row justify-between mb-2">
          <View style={{ width: '48%' }}>
            <StatCard title="Total Wins" value={stats.totalWins} icon="bolt" color="bg-orange-500" />
          </View>
          <View style={{ width: '48%' }}>
            <StatCard title="Best Heat" value={`${stats.bestStreakEver}d`} icon="whatshot" color="bg-red-500" />
          </View>
        </View>

        {/* HEAT MAP SECTION */}
        <View className="bg-black p-4 rounded-3xl mb-8 shadow-xl items-center">
          <View className="w-full px-2 mb-4">
            <Text className="text-white font-black text-lg">Forge Heat</Text>
            <Text className="text-orange-200 text-xs">Intensity of your daily strikes</Text>
          </View>

          <ContributionGraph
            values={heatmapData}
            endDate={new Date()}
            numDays={105}
            width={width - 80}
            height={220}
            chartConfig={chartConfig}
            gutterSize={2}
            squareSize={18}
          />

          <View className="w-full flex-row justify-between px-4 mt-2">
            <Text className="text-gray-500 text-[10px]">COLD</Text>
            <Text className="text-orange-500 text-[10px]">BLAZING</Text>
          </View>
        </View>

        {/* Individual Tool Performance */}
        <Text className="text-gray-400 font-black text-xs uppercase tracking-widest mb-4 ml-2">
          Tool Durability (Streaks)
        </Text>

        {habits.map((habit) => (
          <View key={habit.id} className="bg-white p-4 rounded-2xl mb-3 flex-row items-center justify-between border border-gray-100 shadow-sm">
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