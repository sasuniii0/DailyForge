import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { auth } from "@/service/firebase.config";
import { HabitService } from "@/service/habitService";
import { Habit } from "@/types/habits";
import { ContributionGraph } from "react-native-chart-kit";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get("window");

// StatCard component
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
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [stats, setStats] = useState({
    totalWins: 0,
    bestStreakEver: 0,
    activeHabits: 0,
    completionRate: 0,
    currentWeekTotal: 0,
    longestActiveStreak: 0
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user) {
      try {
        // Load Habits & Basic Stats
        const data = await HabitService.getUserHabits(user.uid);
        setHabits(data);
        
        // Calculate comprehensive stats
        const totalWins = data.reduce((acc, h) => acc + (h.totalCompletions || 0), 0);
        const bestEver = Math.max(...data.map(h => h.bestStreak), 0);
        const activeHabits = data.filter(h => h.currentStreak > 0).length;
        const longestActive = Math.max(...data.map(h => h.currentStreak), 0);
        
        // Generate heatmap data from habit streaks
        const heatmapValues = generateHeatmapFromHabits(data);
        setHeatmapData(heatmapValues);
        
        // Calculate completion rate
        const totalPossibleCompletions = data.length * 30; // Last 30 days
        const actualCompletions = heatmapValues.reduce((sum, day) => sum + day.count, 0);
        const completionRate = totalPossibleCompletions > 0 
          ? Math.round((actualCompletions / totalPossibleCompletions) * 100) 
          : 0;
        
        // Current week total
        const last7Days = heatmapValues.slice(-7);
        const currentWeekTotal = last7Days.reduce((sum, day) => sum + day.count, 0);
        
        setStats({ 
          totalWins, 
          bestStreakEver: bestEver, 
          activeHabits,
          completionRate,
          currentWeekTotal,
          longestActiveStreak: longestActive
        });
      } catch (error) {
        console.error("Error loading progress data:", error);
      }
    }
    setLoading(false);
  };

  /**
   * Generate heatmap data from habit streaks (without completions collection)
   * Uses current streaks and lastCompletedDate to estimate past activity
   */
  const generateHeatmapFromHabits = (habits: Habit[]) => {
    const dailyCompletions: { [date: string]: number } = {};
    const today = new Date();
    
    habits.forEach(habit => {
      if (habit.currentStreak > 0 && habit.lastCompletedDate) {
        // Work backwards from last completed date
        const lastCompleted = new Date(habit.lastCompletedDate);
        
        // Generate completions for current streak
        for (let i = 0; i < habit.currentStreak; i++) {
          const date = new Date(lastCompleted);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          dailyCompletions[dateStr] = (dailyCompletions[dateStr] || 0) + 1;
        }
      }
    });
    
    // Convert to array format for heatmap
    const heatmapArray = Object.entries(dailyCompletions).map(([date, count]) => ({
      date,
      count
    }));
    
    // Sort by date
    heatmapArray.sort((a, b) => a.date.localeCompare(b.date));
    
    // If no data, generate some mock data for visualization
    if (heatmapArray.length === 0) {
      return generateMockHeatmapData();
    }
    
    return heatmapArray;
  };

  const generateMockHeatmapData = () => {
    // Generate mock data for empty state
    const mockData: { date: string; count: number }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 3));
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 3) + 1
      });
    }
    
    return mockData;
  };

  const getNumDays = () => {
    switch (timeRange) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      default: return 30;
    }
  };

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientTo: "#000",
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text className="text-gray-600 mt-4">Loading your forge data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-6 pt-10" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-3xl font-black text-gray-900">Forge Ledger</Text>
            <Text className="text-gray-500">Your journey in the fires of discipline.</Text>
          </View>
          <TouchableOpacity 
            onPress={loadAllData}
            className="bg-orange-500 p-3 rounded-full"
          >
            <MaterialIcons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats Grid */}
        <View className="my-6">
          <View className="flex-row justify-between mb-3">
            <View style={{ width: '48%' }}>
              <StatCard 
                title="Total Wins" 
                value={stats.totalWins} 
                icon="bolt" 
                color="bg-orange-500" 
              />
            </View>
            <View style={{ width: '48%' }}>
              <StatCard 
                title="Best Heat" 
                value={`${stats.bestStreakEver}d`} 
                icon="whatshot" 
                color="bg-red-500" 
              />
            </View>
          </View>

          <View className="flex-row justify-between">
            <View style={{ width: '48%' }}>
              <StatCard 
                title="Active" 
                value={stats.activeHabits} 
                icon="flash-on" 
                color="bg-green-500" 
              />
            </View>
            <View style={{ width: '48%' }}>
              <StatCard 
                title="Avg Streak" 
                value={habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length) : 0} 
                icon="trending-up" 
                color="bg-blue-500" 
              />
            </View>
          </View>
        </View>

        {/* Completion Rate Indicator */}
        <View className="bg-white p-6 rounded-3xl mb-6 shadow-sm border border-gray-100">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              Overall Completion Rate
            </Text>
            <Text className="text-2xl font-black text-orange-600">
              {stats.completionRate}%
            </Text>
          </View>
          <View className="bg-gray-200 h-3 rounded-full overflow-hidden">
            <View 
              className="bg-orange-500 h-full rounded-full" 
              style={{ width: `${stats.completionRate}%` }}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-2">
            Based on current streaks and activity
          </Text>
        </View>

        {/* Time Range Selector */}
        <View className="flex-row justify-center mb-4 bg-white rounded-2xl p-1 border border-gray-200">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setTimeRange(range)}
              className={`flex-1 py-2 rounded-xl ${
                timeRange === range ? 'bg-orange-500' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-bold text-sm capitalize ${
                  timeRange === range ? 'text-white' : 'text-gray-600'
                }`}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* HEAT MAP SECTION */}
        <View className="bg-black p-4 rounded-3xl mb-8 shadow-xl items-center">
          <View className="w-full px-2 mb-4">
            <Text className="text-white font-black text-lg">Forge Heat</Text>
            <Text className="text-orange-200 text-xs">
              Intensity of your daily strikes ({getNumDays()} days)
            </Text>
          </View>

          <ContributionGraph
            values={heatmapData}
            endDate={new Date()}
            numDays={getNumDays()}
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
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-400 font-black text-xs uppercase tracking-widest ml-2">
            Tool Durability (Streaks)
          </Text>
          <Text className="text-gray-400 text-xs">
            {habits.length} Active Tools
          </Text>
        </View>

        {habits.length === 0 ? (
          <View className="bg-white p-8 rounded-2xl items-center border border-gray-100">
            <MaterialIcons name="construction" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 font-bold mt-4 text-center">
              No Habits Yet
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Start forging new habits to see your progress here
            </Text>
          </View>
        ) : (
          habits
            .sort((a, b) => b.currentStreak - a.currentStreak) // Sort by current streak
            .map((habit, index) => (
              <View 
                key={habit.id} 
                className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    {/* Rank badge for top 3 */}
                    {index < 3 && (
                      <View className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                        index === 0 ? 'bg-yellow-400' : 
                        index === 1 ? 'bg-gray-300' : 
                        'bg-orange-300'
                      }`}>
                        <Text className="text-white text-xs font-black">
                          {index + 1}
                        </Text>
                      </View>
                    )}
                    
                    {/* Habit info */}
                    <View className="w-2 h-10 bg-orange-500 rounded-full mr-4" />
                    <View className="flex-1">
                      <Text className="text-gray-900 font-bold">{habit.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-gray-400 text-xs mr-2">{habit.category}</Text>
                        {habit.currentStreak > 0 && (
                          <View className="flex-row items-center">
                            <Svg width="10" height="10" viewBox="0 0 24 24" style={{ marginRight: 2 }}>
                              <Path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" fill="#F97316"/>
                            </Svg>
                            <Text className="text-orange-600 text-[10px] font-bold">Active</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  
                  {/* Streak stats */}
                  <View className="items-end">
                    <View className="flex-row items-baseline">
                      <Text className="text-gray-900 font-black text-xl">{habit.currentStreak}</Text>
                      <Text className="text-gray-400 text-xs ml-1">d</Text>
                    </View>
                    <Text className="text-gray-400 text-[10px]">CURRENT</Text>
                    {habit.bestStreak > habit.currentStreak && (
                      <Text className="text-orange-500 text-[10px] mt-1">
                        Best: {habit.bestStreak}d
                      </Text>
                    )}
                  </View>
                </View>

                {/* Progress bar for current vs best streak */}
                {habit.bestStreak > 0 && (
                  <View className="mt-3">
                    <View className="bg-gray-100 h-2 rounded-full overflow-hidden">
                      <View 
                        className="bg-orange-400 h-full rounded-full" 
                        style={{ 
                          width: `${Math.min((habit.currentStreak / habit.bestStreak) * 100, 100)}%` 
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Progress;