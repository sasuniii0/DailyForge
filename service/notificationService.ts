import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native'; 

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

export const NotificationService = {
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'DailyForge Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F97316',
      });
    }
    return true;
  },

  // UPDATED: Now accepts frequency and optional weekday
  scheduleHabitReminder: async (
    habitId: string, 
    habitName: string, 
    hour: number, 
    minute: number,
    frequency: 'daily' | 'weekly',
    weekday?: number // 1 (Sun) to 7 (Sat)
  ) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(habitId);

      // Construct the trigger based on frequency
      const trigger: any = {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      };

      // Add weekday if it's a weekly habit
      if (frequency === 'weekly' && weekday) {
        trigger.weekday = weekday;
      }

      await Notifications.scheduleNotificationAsync({
        identifier: habitId,
        content: {
          title: frequency === 'daily' ? "Daily Strike! ⚒️" : "Weekly Maintenance! ⚒️",
          body: `Time to work on "${habitName}". Keep the forge burning!`,
          data: { habitId },
          sound: true,
        },
        trigger: trigger,
      });
      
      console.log(`${frequency} reminder set for ${habitName}`);
    } catch (error) {
      console.error("Failed to schedule forge chime:", error);
    }
  },

  cancelReminder: async (habitId: string) => {
    await Notifications.cancelScheduledNotificationAsync(habitId);
  },

  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};