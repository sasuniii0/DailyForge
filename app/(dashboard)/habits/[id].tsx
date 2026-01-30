import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "@/service/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Habit } from "@/types/habits";
import { HabitService } from "@/service/habitService";
import Toast from "react-native-toast-message";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const EditHabit = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [category, setCategory] = useState("");
  const [targetGoal, setTargetGoal] = useState("1");

  useEffect(() => {
    const fetchHabitDetails = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "habits", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Habit;
          setName(data.name);
          setDescription(data.description || "");
          setFrequency(data.frequency);
          setCategory(data.category);
          setTargetGoal(data.targetGoal?.toString() || "1");
        } else {
          Toast.show({ type: 'error', text1: 'Lost Tool', text2: 'Habit not found.' });
          router.back();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchHabitDetails();
  }, [id]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Invalid Iron', text2: 'Habit name cannot be empty.' });
      return;
    }

    setIsUpdating(true);
    try {
      const habitRef = doc(db, "habits", id as string);
      await updateDoc(habitRef, {
        name: name.trim(),
        description: description.trim(),
        frequency: frequency,
        category: category,
        targetGoal: parseInt(targetGoal) || 1,
      });

      Toast.show({ type: 'success', text1: 'Iron Reforged!', text2: 'Habit updated successfully.' });
      router.back();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Forge Error', text2: 'Failed to update habit.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="px-6 pt-10 pb-4 border-b border-gray-100 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <MaterialIcons name="close" size={28} color="black" />
            </TouchableOpacity>
            <Text className="text-2xl font-black">Reforge Habit</Text>
          </View>
          
          <TouchableOpacity onPress={() => HabitService.deleteHabit(id as string).then(() => router.back())}>
             <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <ScrollView className="p-6">
          <Text className="text-gray-500 font-bold mb-2">NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="bg-gray-100 p-4 rounded-2xl text-lg mb-6 font-semibold"
          />

          <Text className="text-gray-500 font-bold mb-2">DESCRIPTION</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            className="bg-gray-100 p-4 rounded-2xl text-base mb-6 h-20"
          />

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
        </ScrollView>

        <View className="p-6 border-t border-gray-100">
          <TouchableOpacity 
            onPress={handleUpdate}
            disabled={isUpdating}
            className="bg-orange-600 p-5 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white font-bold text-lg">
              {isUpdating ? "Reshaping..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditHabit;