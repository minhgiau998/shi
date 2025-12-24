import { Share, Alert } from 'react-native';
import { InventoryItem } from '@appTypes/inventory';

export async function shareInventoryList(items: InventoryItem[]) {
    if (items.length === 0) {
        Alert.alert('Empty', 'You have no items to share.');
        return;
    }

    // 1. Generate a readable message
    const currentDate = new Date().toLocaleDateString();

    let message = `📦 *SHI Inventory List* (${currentDate})\n\n`;

    // Group items by status (Optional, looks nicer)
    const expiringSoon = items.filter(i => i.status === 'Expiring Soon');
    const fresh = items.filter(i => i.status === 'Fresh');
    const expired = items.filter(i => i.status === 'Expired');

    if (expired.length > 0) {
        message += `🔴 *EXPIRED (${expired.length})*\n`;
        expired.forEach(item => {
            message += `- ${item.name} (${item.expirationDate})\n`;
        });
        message += '\n';
    }

    if (expiringSoon.length > 0) {
        message += `🟡 *EXPIRING SOON (${expiringSoon.length})*\n`;
        expiringSoon.forEach(item => {
            message += `- ${item.name} (${item.expirationDate})\n`;
        });
        message += '\n';
    }

    if (fresh.length > 0) {
        message += `🟢 *FRESH (${fresh.length})*\n`;
        fresh.forEach(item => {
            message += `- ${item.name} (${item.expirationDate})\n`;
        });
    }

    // 2. Trigger the Native Share Sheet
    try {
        const result = await Share.share({
            message: message,
            title: 'SHI Inventory List', // Title for some Android apps
        });

        if (result.action === Share.sharedAction) {
            console.log('List shared successfully');
        }
    } catch (error) {
        Alert.alert('Error', 'Could not share the list.');
        console.error(error);
    }
}