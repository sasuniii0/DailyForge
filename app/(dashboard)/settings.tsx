import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, Alert } from "react-native";
import { auth } from "@/service/firebase.config";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

const Settings = () => {
  const router = useRouter();
  const user = auth.currentUser;

  // Local state for toggles (You can later sync these with Firebase/AsyncStorage)
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Extinguish Fire?",
      "Are you sure you want to log out of your forge?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/login");
              Toast.show({ type: 'success', text1: 'Forge Closed', text2: 'See you at the next strike!' });
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to log out.' });
            }
          } 
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, type = 'arrow', value }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={type === 'switch'}
      className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-2xl border border-gray-100"
    >
      <View className="flex-row items-center flex-1">
        <View className="bg-orange-50 p-2 rounded-xl mr-4">
          <MaterialIcons name={icon} size={24} color="#F97316" />
        </View>
        <View>
          <Text className="text-gray-900 font-bold text-base">{title}</Text>
          {subtitle && <Text className="text-gray-500 text-xs">{subtitle}</Text>}
        </View>
      </View>
      
      {type === 'arrow' && <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />}
      {type === 'switch' && (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: "#E5E7EB", true: "#FDBA74" }}
          thumbColor={value ? "#F97316" : "#F4F4F5"}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-6 pt-10">
        <Text className="text-3xl font-black text-gray-900 mb-6">Workshop</Text>

        {/* Profile Section */}
        <View className="bg-black p-6 rounded-3xl mb-8 flex-row items-center shadow-xl">
          <View className="w-16 h-16 bg-orange-500 rounded-full items-center justify-center mr-4 border-4 border-orange-200">
            <Text className="text-white text-2xl font-black">
              {user?.email?.charAt(0).toUpperCase() || "S"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-xl" numberOfLines={1}>{user?.displayName}</Text>
            <Text className="text-orange-200 text-xs font-medium">{user?.email}</Text>
          </View>
        </View>

        {/* Preferences Section */}
        <Text className="text-gray-400 font-black text-xs uppercase tracking-widest mb-4 ml-2">App Settings</Text>
        
        <SettingItem 
          icon="notifications-active" 
          title="Daily Reminders" 
          subtitle="Get notified to strike while the iron is hot"
          type="switch"
          value={notifications}
          onPress={() => setNotifications(!notifications)}
        />

        <SettingItem 
          icon="dark-mode" 
          title="Dark Forge" 
          subtitle="Reduce glare for night smithing"
          type="switch"
          value={darkMode}
          onPress={() => setDarkMode(!darkMode)}
        />

        {/* Account Section */}
        <Text className="text-gray-400 font-black text-xs uppercase tracking-widest mt-6 mb-4 ml-2">Account</Text>
        
        <SettingItem 
          icon="person-outline" 
          title="Profile Details" 
          onPress={() => {}} 
        />

        <SettingItem 
          icon="shield" 
          title="Privacy & Security" 
          onPress={() => {}} 
        />

        <SettingItem 
          icon="help-outline" 
          title="Forge Support" 
          onPress={() => {}} 
        />

        {/* Logout */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="mt-10 mb-20 flex-row items-center justify-center p-4 rounded-2xl border border-red-100 bg-red-50"
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text className="text-red-500 font-black ml-2">Extinguish Forge</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;