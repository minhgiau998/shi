import { differenceInDays, parseISO, isValid } from 'date-fns';
import { ItemStatus, ItemType, InventoryItem } from '@appTypes/inventory';
import { NotificationSettings } from '@appTypes/user';

/**
 * Computes the status of an inventory item based on its expiration date
 * and the user's notification settings for lead time.
 * 
 * @param expirationDate - The item's expiration date in ISO format (YYYY-MM-DD)
 * @param itemType - The type of item (Food, Medicine, Cosmetics)
 * @param notificationSettings - User's notification settings with lead times
 * @returns The computed status: 'Fresh', 'Expiring Soon', or 'Expired'
 */
export function computeItemStatus(
    expirationDate: string,
    itemType: ItemType,
    notificationSettings?: NotificationSettings
): ItemStatus {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    let expDate: Date;
    try {
        expDate = parseISO(expirationDate);
        if (!isValid(expDate)) {
            return 'Fresh'; // Default if date is invalid
        }
    } catch {
        return 'Fresh'; // Default if parsing fails
    }

    expDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const daysUntilExpiration = differenceInDays(expDate, today);

    // If expired (expiration date is before today)
    if (daysUntilExpiration < 0) {
        return 'Expired';
    }

    // Get lead time based on item type
    const leadTime = getLeadTime(itemType, notificationSettings);

    // If within lead time, it's expiring soon
    if (daysUntilExpiration <= leadTime) {
        return 'Expiring Soon';
    }

    return 'Fresh';
}

/**
 * Gets the lead time (days before expiration to notify) for an item type
 */
function getLeadTime(itemType: ItemType, settings?: NotificationSettings): number {
    if (!settings) {
        // Default lead times if no settings provided
        switch (itemType) {
            case 'Food':
                return 3;
            case 'Medicine':
                return 7;
            case 'Cosmetics':
                return 7;
            default:
                return 3;
        }
    }

    switch (itemType) {
        case 'Food':
            return settings.foodLeadTime;
        case 'Medicine':
            return settings.medicineLeadTime;
        case 'Cosmetics':
            return settings.cosmeticsLeadTime;
        default:
            return settings.foodLeadTime;
    }
}

/**
 * Updates the status of all items in a list based on their expiration dates
 */
export function computeAllItemStatuses(
    items: InventoryItem[],
    notificationSettings?: NotificationSettings
): InventoryItem[] {
    return items.map(item => ({
        ...item,
        status: computeItemStatus(item.expirationDate, item.type, notificationSettings),
    }));
}

/**
 * Checks if an item needs a notification based on its status and days remaining
 */
export function shouldNotify(
    item: InventoryItem,
    notificationSettings?: NotificationSettings
): boolean {
    const status = computeItemStatus(item.expirationDate, item.type, notificationSettings);
    return status === 'Expiring Soon' || status === 'Expired';
}

/**
 * Gets the number of days until an item expires (negative if already expired)
 */
export function getDaysUntilExpiration(expirationDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const expDate = parseISO(expirationDate);
        if (!isValid(expDate)) {
            return 999; // Large number if invalid
        }
        expDate.setHours(0, 0, 0, 0);
        return differenceInDays(expDate, today);
    } catch {
        return 999;
    }
}
