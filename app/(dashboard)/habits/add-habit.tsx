import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { db, auth } from "@/service/firebase.config";
import { collection, addDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Habit } from "../../../types/habits"; // Import your interface
import { HabitService } from "../../../service/habitService";

const AddHabit = () => {
    const router = useRouter();
    
    // State aligned with your Habit interface
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
    const [category, setCategory] = useState("Productivity");
    const [targetGoal, setTargetGoal] = useState("1"); // Default to 1 time per day
    const [isForging, setIsForging] = useState(false);

    const handleCreate = async () => {
  if (!name.trim()) {
    Toast.show({ 
      type: 'error', 
      text1: 'Empty Anvil!', 
      text2: 'Please name your habit before forging.' 
    });
    return;
  }

  setIsForging(true);

  try {
    const user = auth.currentUser;
    if (user) {
      // 1. Create the habit and get the ID string
      const newHabitId = await HabitService.createHabit(user.uid, {
        name: name.trim(),
        description: description.trim(),
        frequency: frequency,
        category: category,
        targetGoal: parseInt(targetGoal) || 1,
        color: "#F97316",
      });


      Toast.show({ 
        type: 'success', 
        text1: 'Habit Forged!', 
        text2: 'Your new tool is ready at the anvil.' 
      });
      
      router.back();
    } // End if(user)
  } catch (error) {
    console.error("Forge Error:", error);
    Toast.show({ 
      type: 'error', 
      text1: 'Forge Error', 
      text2: 'The iron cooled too fast. Try again.' 
    });
  } finally {
    setIsForging(false);
  }
};

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
      >
        <View className="px-6 pt-10 pb-4 border-b border-gray-100 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <MaterialIcons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-black">Forge New Habit</Text>
        </View>

        <ScrollView className="p-6">
          {/* Habit Name */}
          <Text className="text-gray-500 font-bold mb-2">NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Lift Heavy Metal"
            className="bg-gray-100 p-4 rounded-2xl text-lg mb-6"
          />

          {/* Description */}
          <Text className="text-gray-500 font-bold mb-2">DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What's the purpose of this task?"
            multiline
            className="bg-gray-100 p-4 rounded-2xl text-base mb-6 h-24"
            textAlignVertical="top"
          />

          {/* Frequency Selector */}
          <Text className="text-gray-500 font-bold mb-2">FREQUENCY</Text>
          <View className="flex-row gap-2 mb-6">
            {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
              <TouchableOpacity 
                key={freq}
                onPress={() => setFrequency(freq)}
                className={`flex-1 py-3 rounded-xl border items-center ${frequency === freq ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300'}`}
              >
                <Text className={`capitalize ${frequency === freq ? 'text-white font-bold' : 'text-gray-600'}`}>{freq}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Chips */}
          <Text className="text-gray-500 font-bold mb-2">CATEGORY</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {['Health', 'Productivity', 'Learning', 'Mindfulness'].map((cat) => (
              <TouchableOpacity 
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-black border-black' : 'bg-white border-gray-300'}`}
              >
                <Text className={category === cat ? 'text-white font-bold' : 'text-gray-600'}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Target Goal */}
          <Text className="text-gray-500 font-bold mb-2">DAILY TARGET GOAL</Text>
          <TextInput
            value={targetGoal}
            onChangeText={setTargetGoal}
            keyboardType="numeric"
            placeholder="1"
            className="bg-gray-100 p-4 rounded-2xl text-lg mb-10"
          />
        </ScrollView>

        <View className="p-6">
          <TouchableOpacity 
            onPress={handleCreate}
            disabled={isForging}
            className={`p-5 rounded-2xl items-center shadow-lg ${isForging ? 'bg-gray-400' : 'bg-orange-600'}`}
          >
            <Text className="text-white font-bold text-lg">
              {isForging ? "Forging..." : "Add to Daily Forge"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddHabit;