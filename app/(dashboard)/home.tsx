// app/(tabs)/home.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DailyForgeLogo } from "../../components/daily-forge-logo";
import { useRouter } from "expo-router";

type Habit = {
  id: string;
  name: string;
  icon: string;
  streak: number;
  completed: boolean;
  category: string;
  completionRate: number;
};

const Home = () => {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Morning Workout', icon: '💪', streak: 12, completed: true, category: 'Fitness', completionRate: 92 },
    { id: '2', name: 'Read 30min', icon: '📚', streak: 18, completed: true, category: 'Learning', completionRate: 95 },
    { id: '3', name: 'Meditate 10min', icon: '🧘', streak: 7, completed: false, category: 'Wellness', completionRate: 78 },
    { id: '4', name: 'Drink 8 Glasses', icon: '💧', streak: 5, completed: false, category: 'Health', completionRate: 85 },
    { id: '5', name: 'Journal', icon: '✍️', streak: 3, completed: false, category: 'Mindfulness', completionRate: 68 },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak } : h
    ));
  };

  const completedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const todayProgress = Math.round((completedToday / totalHabits) * 100);
  const bestStreak = Math.max(...habits.map(h => h.streak));
  const totalDays = habits.reduce((sum, h) => sum + h.streak, 0);

  // Get current date
  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-6 py-5 shadow-sm">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <DailyForgeLogo size={50} />
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  DailyForge
                </Text>
                <Text className="text-xs text-orange-600 font-semibold tracking-wider">
                  FORGE YOUR FUTURE
                </Text>
              </View>
            </View>
            <Pressable 
              onPress={() => router.push("/settings")}
              className="w-11 h-11 bg-gray-100 rounded-full items-center justify-center"
            >
              <Text className="text-xl">⚙️</Text>
            </Pressable>
          </View>
          <Text className="text-sm text-gray-600">
            {getCurrentDate()}
          </Text>
        </View>

        {/* Main Content */}
        <View className="px-6 py-6">
          {/* Daily Progress Card */}
          <LinearGradient
            colors={['#FF6B35', '#E85D04', '#DC2F02']}
            className="rounded-3xl p-6 mb-6 shadow-xl"
          >
            <View className="flex-row items-center justify-between mb-5">
              <View>
                <Text className="text-orange-100 text-sm font-semibold mb-2">
                  Today's Forge Progress
                </Text>
                <Text className="text-white text-5xl font-bold mb-1">
                  {completedToday}/{totalHabits}
                </Text>
                <Text className="text-orange-100 text-xs">
                  Habits Completed
                </Text>
              </View>
              <View className="bg-white/20 rounded-full p-4">
                <Text style={{ fontSize: 40 }}>🔥</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="bg-white/20 rounded-full h-4 overflow-hidden mb-2">
              <LinearGradient
                colors={['#FFB703', '#FFA500']}
                className="h-full rounded-full"
                style={{ width: `${todayProgress}%` }}
              />
            </View>
            <Text className="text-orange-100 text-sm font-semibold">
              {todayProgress}% of Daily Goal Achieved
            </Text>
          </LinearGradient>

          {/* Quick Stats */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm border border-orange-100">
              <View className="bg-orange-50 rounded-full p-3 mb-2">
                <Text style={{ fontSize: 28 }}>🔥</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">{bestStreak}</Text>
              <Text className="text-xs text-gray-600 font-medium">Best Streak</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm border border-orange-100">
              <View className="bg-orange-50 rounded-full p-3 mb-2">
                <Text style={{ fontSize: 28 }}>🏆</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">{totalDays}</Text>
              <Text className="text-xs text-gray-600 font-medium">Total Days</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 items-center shadow-sm border border-orange-100">
              <View className="bg-orange-50 rounded-full p-3 mb-2">
                <Text style={{ fontSize: 28 }}>💪</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900">{totalHabits}</Text>
              <Text className="text-xs text-gray-600 font-medium">Active Habits</Text>
            </View>
          </View>

          {/* Today's Habits Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  Today's Forge
                </Text>
                <Text className="text-sm text-gray-600">
                  Strike while the iron is hot
                </Text>
              </View>
              <Pressable 
                onPress={() => router.push("/add-habit")}
                className="bg-orange-500 rounded-full px-4 py-2 shadow-md"
              >
                <Text className="text-white font-bold text-sm">+ Add</Text>
              </Pressable>
            </View>

            {/* Habit Cards */}
            <View className="gap-3">
              {habits.map((habit) => (
                <Pressable
                  key={habit.id}
                  onPress={() => toggleHabit(habit.id)}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4 flex-1">
                      {/* Status Circle */}
                      <View
                        className={`w-14 h-14 rounded-full items-center justify-center ${
                          habit.completed 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
                            : 'bg-gray-100'
                        }`}
                      >
                        {habit.completed ? (
                          <Text className="text-white text-3xl font-bold">✓</Text>
                        ) : (
                          <View className="w-7 h-7 border-3 border-gray-300 rounded-full" />
                        )}
                      </View>

                      {/* Habit Info */}
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-1">
                          <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
                          <Text className="font-bold text-gray-900 text-base flex-1">
                            {habit.name}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <View className="flex-row items-center gap-1">
                            <Text className="text-sm">🔥</Text>
                            <Text className="text-sm text-orange-600 font-semibold">
                              {habit.streak} days
                            </Text>
                          </View>
                          <Text className="text-gray-400">•</Text>
                          <Text className="text-xs text-gray-600">
                            {habit.completionRate}% completion
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Chevron */}
                    <Text className="text-gray-400 text-xl ml-2">›</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Motivational Quote */}
          <View className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 mb-4">
            <Text className="text-orange-400 text-sm font-bold mb-2">
              💡 FORGE WISDOM
            </Text>
            <Text className="text-white text-lg font-semibold mb-2">
              "The iron is shaped by fire, you are shaped by discipline."
            </Text>
            <Text className="text-gray-400 text-xs">
              Every day you show up is a strike of the hammer
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;