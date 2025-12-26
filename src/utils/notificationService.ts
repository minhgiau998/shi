import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { InventoryItem, ItemType } from '@appTypes/inventory';
import { NotificationSettings } from '@appTypes/user';
import { subDays, parseISO, startOfDay, isBefore, differenceInSeconds } from 'date-fns';
import i18n from '../i18n/i18n';

// Configure how notifications should be handled when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldSchedule: true,
        shouldShowList: true,
    }),
});

export const notificationService = {
    /**
     * Request permissions for push notifications
     */
    async requestPermissions() {
        if (Platform.OS === 'web') return false;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return finalStatus === 'granted';
    },

    /**
     * Calculate the notification date based on item type and user settings
     */
    getNotificationDate(expirationDate: string, itemType: ItemType, settings: NotificationSettings): Date {
        const expDate = startOfDay(parseISO(expirationDate));
        let leadTime = settings.foodLeadTime;

        if (itemType === 'Medicine') leadTime = settings.medicineLeadTime;
        if (itemType === 'Cosmetics') leadTime = settings.cosmeticsLeadTime;

        // Subtract lead time days from expiration date
        return subDays(expDate, leadTime);
    },

    /**
     * Schedule a local notification for an inventory item
     */
    async scheduleItemNotification(item: InventoryItem, settings: NotificationSettings) {
        if (Platform.OS === 'web') return;

        // First, cancel any existing notification for this item to avoid duplicates
        await this.cancelItemNotification(item.id);

        const notifyDate = this.getNotificationDate(item.expirationDate, item.type, settings);
        const now = new Date();

        // Check logic: if notification date is in the past
        if (isBefore(notifyDate, now)) {
            // If item is not expired yet, but the "warning date" has passed, 
            // we might want to verify if we should skip or alert immediately.
            // Following current logic: if expired or notification date passed, skip.
            if (isBefore(startOfDay(parseISO(item.expirationDate)), startOfDay(now))) {
                return; // Already expired
            }
        }

        try {
            // FIX: Convert Date to seconds for TimeIntervalTriggerInput
            // This satisfies TypeScript and avoids the 'Date' type mismatch
            const seconds = differenceInSeconds(notifyDate, now);

            // If the time difference is negative or zero (e.g. notify time was 1 minute ago), don't schedule
            if (seconds <= 0) return;

            // On Android, we need a channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('expiry-alerts', {
                    name: 'Expiry Alerts',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#6B9080',
                });
            }

            // Convert Date to seconds for TimeIntervalTriggerInput
            const trigger: Notifications.TimeIntervalTriggerInput = {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: seconds,
                repeats: false,
            };

            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: i18n.t('push_notifications.expiry_title'),
                    body: i18n.t('push_notifications.expiry_body', {
                        name: item.name,
                        days: this.getLeadTime(item.type, settings)
                    }),
                    data: { itemId: item.id },
                    sound: true,
                },
                trigger,
            });

            return identifier;
        } catch (error) {
            console.error('Error scheduling notification:', error);
        }
    },

    /**
     * Cancel a notification for a specific item
     */
    async cancelItemNotification(notificationId?: string) {
        if (Platform.OS === 'web' || !notificationId) return;

        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error('Error cancelling notification:', error);
        }
    },

    /**
     * Helper to get lead time from settings
     */
    getLeadTime(itemType: ItemType, settings: NotificationSettings): number {
        switch (itemType) {
            case 'Food': return settings.foodLeadTime;
            case 'Medicine': return settings.medicineLeadTime;
            case 'Cosmetics': return settings.cosmeticsLeadTime;
            default: return 3;
        }
    }
};