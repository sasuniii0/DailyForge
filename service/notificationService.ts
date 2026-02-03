import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes, NotificationBehavior } from 'expo-notifications';
import { Platform } from 'react-native';

// 1. Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Fixed: Added missing property
    shouldShowList: true,   // Fixed: Added missing property
  }),
});

// 2. Request Permissions
export async function registerForPushNotificationsAsync() {
  let success = false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus === 'granted') {
    success = true;
  } else {
    console.log('Failed to get push token for daily reminders!');
  }

  return success;
}

// 3. Schedule the Daily "Forge" Reminder
export async function scheduleDailyReminder(hour: number = 9, minute: number = 0) {
  // Clear existing notifications first so they don't stack up
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "The Forge is Hot! ⚒️",
      body: "Strike now! It's time to check off your daily habits.",
      data: { screen: 'home' },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.CALENDAR, // Fixed: Added required type
      hour: hour,
      minute: minute,
      repeats: true,
    },
  });
  
  console.log(`Reminder scheduled for ${hour}:${minute}`);
}

// 4. Cancel Reminders
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All reminders canceled');
}