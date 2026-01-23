// index.tsx
import React, { useState } from "react";
import { View, Text, Button, FlatList, Pressable } from "react-native";
import "../global.css"; // Make sure NativeWind is installed and configured

export default function Index() {
  const [habits, setHabits] = useState<string[]>(["Drink Water", "Exercise", "Read Book"]);

  const addHabit = () => {
    setHabits([...habits, `New Habit ${habits.length + 1}`]);
  };

  return (
    <View className="flex-1 justify-center items-center p-5 bg-gray-100">
      <Text className="text-4xl font-bold mb-5">🔥 DailyForge</Text>
      <Text className="text-lg mb-3 text-gray-700">Your Habits for Today:</Text>

      <FlatList
        data={habits}
        keyExtractor={(item, index) => index.toString()}
        className="w-full mb-5"
        renderItem={({ item }) => (
          <View className="bg-white p-3 mb-2 rounded shadow">
            <Text className="text-base">{item}</Text>
          </View>
        )}
      />

      {/* Tailwind-style button using Pressable */}
      <Pressable
        className="bg-blue-500 px-5 py-3 rounded-full"
        onPress={addHabit}
      >
        <Text className="text-white text-lg">Add Habit</Text>
      </Pressable>
    </View>
  );
}
