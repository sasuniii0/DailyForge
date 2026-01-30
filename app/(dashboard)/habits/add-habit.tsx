import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { db, auth } from "@/service/firebase.config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Toast from "react-native-toast-message";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const AddHabit = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Productivity");
  const [isForging, setIsForging] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Empty Anvil!', text2: 'Please name your habit.' });
      return;
    }

    setIsForging(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "habits"), {
          userId: user.uid,
          name: name,
          category: category,
          currentStreak: 0,
          bestStreak: 0,
          completedToday: false,
          totalCompletions: 0,
          createdAt: new Date().toISOString(),
        });

        Toast.show({ type: 'success', text1: 'Habit Forged!', text2: 'Now go strike the iron!' });
        router.back(); // Go back to the list
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Forge Error', text2: 'Could not save habit.' });
    } finally {
      setIsForging(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-black">New Habit</Text>
      </View>

      <ScrollView className="p-6">
        <Text className="text-gray-500 font-bold mb-2">HABIT NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning Meditation"
          className="bg-gray-100 p-4 rounded-2xl text-lg mb-6"
        />

        <Text className="text-gray-500 font-bold mb-2">CATEGORY</Text>
        <View className="flex-row flex-wrap gap-2">
          {['Health', 'Productivity', 'Learning', 'Mindfulness'].map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-300'}`}
            >
              <Text className={category === cat ? 'text-white font-bold' : 'text-gray-600'}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View className="p-6">
        <TouchableOpacity 
          onPress={handleCreate}
          disabled={isForging}
          className="bg-orange-600 p-5 rounded-2xl items-center shadow-lg"
        >
          <Text className="text-white font-bold text-lg">
            {isForging ? "Stoking Fire..." : "Forge Habit"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddHabit;