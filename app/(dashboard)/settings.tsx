import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch, Alert } from "react-native";
import { auth } from "@/service/firebase.config";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import { cancelAllReminders, registerForPushNotificationsAsync, scheduleDailyReminder } from "@/service/notificationService";
import { useColorScheme } from "nativewind";

const Settings = () => {
  const router = useRouter();
  const user = auth.currentUser;

  // Local state for toggles
  const [notifications, setNotifications] = React.useState(true);
  const { colorScheme, setColorScheme } = useColorScheme();

  const isDarkMode = colorScheme === "dark";

  const handleDarkModeToggle = () => {
    const newScheme = isDarkMode ? "light" : "dark";
    setColorScheme(newScheme);
    Toast.show({
      type: 'success',
      text1: isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode',
      text2: `Switched to ${newScheme} mode`
    });
  };

  const toggleNotifications = async () => {
    const newValue = !notifications;
    
    try {
      if (newValue) {
        const hasPermission = await registerForPushNotificationsAsync();
        if (hasPermission) {
          await scheduleDailyReminder(9, 0); // 9:00 AM
          setNotifications(true);
          Toast.show({
            type: 'success',
            text1: 'Reminders Enabled',
            text2: 'You\'ll be notified daily at 9:00 AM'
          });
        }
      } else {
        await cancelAllReminders(); 
        setNotifications(false);
        Toast.show({
          type: 'info',
          text1: 'Reminders Disabled',
          text2: 'You won\'t receive daily notifications'
        });
      }
    } catch (error) {
      console.error("Notification Error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update notification settings'
      });
    }
  };

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
              Toast.show({ 
                type: 'success', 
                text1: 'Forge Closed', 
                text2: 'See you at the next strike!' 
              });
            } catch (error) {
              Toast.show({ 
                type: 'error', 
                text1: 'Error', 
                text2: 'Failed to log out.' 
              });
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
      className="flex-row items-center justify-between bg-white p-4 mb-2 rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50"
    >
      <View className="flex-row items-center flex-1">
        <View className="bg-orange-50 p-2 rounded-xl mr-4">
          <MaterialIcons name={icon} size={24} color="#F97316" />
        </View>
        <View className="flex-1">
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
      <ScrollView className="px-6 pt-10" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-black text-gray-900 mb-6">Workshop</Text>

        {/* Profile Section */}
        <TouchableOpacity
          onPress={() => router.push("/profile-edit")}
          className="bg-black p-6 rounded-3xl mb-8 flex-row items-center shadow-xl active:opacity-90"
        >
          <View className="w-16 h-16 bg-orange-500 rounded-full items-center justify-center mr-4 border-4 border-orange-200">
            <Text className="text-white text-2xl font-black">
              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "S"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-xl" numberOfLines={1}>
              {user?.displayName || "Blacksmith"}
            </Text>
            <Text className="text-orange-200 text-xs font-medium" numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <MaterialIcons name="edit" size={20} color="#FDBA74" />
        </TouchableOpacity>

        {/* Preferences Section */}
        <Text className="text-gray-400 font-black text-xs uppercase tracking-widest mb-4 ml-2">
          App Settings
        </Text>
        
        <SettingItem 
          icon="notifications-active" 
          title="Daily Reminders" 
          subtitle="Get notified to strike while the iron is hot"
          type="switch"
          value={notifications}
          onPress={toggleNotifications}
        />

        <SettingItem 
          icon="dark-mode" 
          title="Dark Forge" 
          subtitle="Reduce glare for night smithing"
          type="switch"
          value={isDarkMode}
          onPress={handleDarkModeToggle}
        />

        {/* Account Section */}
        <Text className="text-gray-400 font-black text-xs uppercase tracking-widest mt-6 mb-4 ml-2">
          Account
        </Text>
        
        <SettingItem 
          icon="person-outline" 
          title="Profile Details" 
          subtitle="Edit your name, email, and password"
          onPress={() => router.push("/profile-edit")} 
        />

        <SettingItem 
          icon="shield" 
          title="Privacy & Security" 
          subtitle="Manage your account security"
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Coming Soon',
              text2: 'This feature is being forged'
            });
          }} 
        />

        <SettingItem 
          icon="help-outline" 
          title="Forge Support" 
          subtitle="Get help with your habits"
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Need Help?',
              text2: 'Contact support at help@habitforge.com'
            });
          }} 
        />

        <SettingItem 
          icon="info-outline" 
          title="About Habit Forge" 
          subtitle="Version 1.0.0"
          onPress={() => {
            Alert.alert(
              "About Habit Forge",
              "Strike while the iron is hot! ⚒️\n\nVersion: 1.0.0\nBuilt with passion and discipline.",
              [{ text: "OK" }]
            );
          }} 
        />

        {/* Logout */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="mt-10 mb-20 flex-row items-center justify-center p-5 rounded-2xl border-2 border-red-200 bg-red-50 active:bg-red-100"
        >
          <MaterialIcons name="logout" size={22} color="#EF4444" />
          <Text className="text-red-500 font-black text-base ml-2">Extinguish Forge</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;