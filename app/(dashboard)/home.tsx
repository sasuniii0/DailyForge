import { View, Text, Pressable } from "react-native";

const Home = () => {
  return (
    <View className="flex-1 bg-gray-50 px-6 pt-12">
      
      {/* Header */}
      <View className="items-center mb-6 mt-12">
        <Text className="text-2xl font-bold text-gray-800 mb-1">
            Welcome
        </Text>
        <Text className="text-gray-500">
            Hope you’re having a great day
        </Text>
      </View>


      {/* Card */}
      <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-2">
          Quick Actions
        </Text>

        <Pressable className="bg-black py-3 rounded-xl mb-3 active:opacity-80">
          <Text className="text-white text-center font-medium">
            Tasks
          </Text>
        </Pressable>

        <Pressable className="border border-gray-300 py-3 mb-3 rounded-xl active:opacity-80">
          <Text className="text-gray-800 text-center font-medium">
            Profile
          </Text>
        </Pressable>

        <Pressable className="border border-gray-300 py-3 mb-3 rounded-xl active:opacity-80">
          <Text className="text-gray-800 text-center font-medium">
            News
          </Text>
        </Pressable>
      </View>

      {/* Info */}
      <View className="bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-lg font-semibold text-gray-800 mb-1">
          Today
        </Text>
        <Text className="text-gray-500">
          No new notifications
        </Text>
      </View>

    </View>
  );
};

export default Home;
