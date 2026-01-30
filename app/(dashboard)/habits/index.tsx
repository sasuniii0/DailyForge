import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

const Habits = () => {
    const router = useRouter();
    return (
        <View className="flex-1 bg-gray-50 px-6 pt-12">
            <TouchableOpacity
                activeOpacity={0.8}
                className="absolute bottom-8 right-6 bg-black rounded-full p-4 shadow-lg"
                onPress={() => router.push('/habits/add-habit')}
            >
                <MaterialIcons name="add" size={32} color="#fff" />
            </TouchableOpacity>
            <View>
                <Text className="text-2xl font-bold text-gray-800 mb-6 text-center pt-12">Habit List</Text>
            </View>
        </View>
    )
}
export default Habits