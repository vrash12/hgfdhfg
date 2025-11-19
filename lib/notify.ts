// app/lib/notify.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let didInit = false;

// call once at app start (e.g., in _layout.tsx)
export async function ensureNotificationsReady() {
  if (!didInit) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false, // iOS
        // iOS 14+ presentation options are handled by shouldShowAlert/PlaySound above
      }),
    });
    didInit = true;
  }

  // permissions
  const cur = await Notifications.getPermissionsAsync();
  if (cur.status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') return false;
  }

  // Android channels (create BEFORE any schedule)
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationChannelAsync('commuter-acks', {
      name: 'Commuter Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 250, 250, 500],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    await Notifications.setNotificationChannelAsync('teller-alerts', {
      name: 'Teller Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
      vibrationPattern: [0, 200, 150, 400],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return true;
}

type Content = Notifications.NotificationContentInput;

// always call this to show a local notification
export async function notify(content: Content, channel: 'default' | 'commuter-acks' | 'teller-alerts' = 'default') {
  const ok = await ensureNotificationsReady();
  if (!ok) return false;

  // channelId is Android-only; harmless elsewhere
  await Notifications.scheduleNotificationAsync({
    content: {
      ...content,
      ...(Platform.OS === 'android' ? { channelId: channel } : {}),
      // On iOS, channelId is ignored; sound comes from content/handler
    },
    trigger: null,
  });
  return true;
}
