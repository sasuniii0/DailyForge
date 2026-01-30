import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native'; 

// 1. Configure how notifications behave when the app is OPEN
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Fixes the missing property error
    shouldShowList: true,   // Fixes the missing property error
  }),
});

export const NotificationService = {
  // 2. Request Permissions from the User
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn("Forge Alert: Notification permissions not granted.");
      return false;
    }

    // Android specific channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'DailyForge Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F97316', // DailyForge Orange
      });
    }

    return true;
  },

  // 3. Schedule a Habit Reminder (fixes the Trigger Type error)
  scheduleHabitReminder: async (habitId: string, habitName: string, hour: number, minute: number) => {
    try {
      // First, cancel any existing reminder for this specific habit to avoid duplicates
      await Notifications.cancelScheduledNotificationAsync(habitId);

      await Notifications.scheduleNotificationAsync({
        identifier: habitId, // Using habitId lets us manage this specific notification later
        content: {
          title: "The Forge is Hot! ⚒️",
          body: `Don't let your streak for "${habitName}" cool down. Strike now!`,
          data: { habitId }, // Used for deep linking
          sound: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR, // Explicitly required by latest TS types
          hour,
          minute,
          repeats: true,
        },
      });
      
      console.log(`Reminder set for ${habitName} at ${hour}:${minute}`);
    } catch (error) {
      console.error("Failed to schedule forge chime:", error);
    }
  },

  // 4. Cancel a specific habit reminder (e.g., if habit is deleted)
  cancelReminder: async (habitId: string) => {
    await Notifications.cancelScheduledNotificationAsync(habitId);
  },

  // 5. Clean up (for logout)
  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};