import { isNativeApp } from "./capacitor";

const REMINDER_NOTIFICATION_ID = 1001;

/**
 * Request permission for local notifications.
 * Returns true if permission granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNativeApp()) {
    // Web fallback — use Notification API if available
    if (typeof Notification !== "undefined") {
      const result = await Notification.requestPermission();
      return result === "granted";
    }
    return false;
  }

  const { LocalNotifications } = await import(
    "@capacitor/local-notifications"
  );
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

/**
 * Schedule a daily reminder notification at the specified time.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<boolean> {
  if (!isNativeApp()) {
    // On web, we can't schedule persistent reminders — just store the preference
    return false;
  }

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    // Cancel any existing reminder first
    await cancelDailyReminder();

    // Schedule repeating daily notification
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REMINDER_NOTIFICATION_ID,
          title: "Log your day",
          body: "Don't forget to record today's work in your logbook!",
          schedule: {
            on: { hour, minute },
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: "ic_launcher",
          largeIcon: "ic_launcher",
          sound: "default",
          actionTypeId: "OPEN_APP",
        },
      ],
    });

    return true;
  } catch (error) {
    console.error("Failed to schedule reminder:", error);
    return false;
  }
}

/**
 * Cancel the daily reminder notification.
 */
export async function cancelDailyReminder(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    await LocalNotifications.cancel({
      notifications: [{ id: REMINDER_NOTIFICATION_ID }],
    });
  } catch (error) {
    console.error("Failed to cancel reminder:", error);
  }
}

/**
 * Check if notifications are currently permitted.
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (!isNativeApp()) {
    if (typeof Notification !== "undefined") {
      return Notification.permission === "granted";
    }
    return false;
  }

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    const { display } = await LocalNotifications.checkPermissions();
    return display === "granted";
  } catch {
    return false;
  }
}
