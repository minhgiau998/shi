export type ItemType = 'Food' | 'Medicine' | 'Cosmetics';

export type ItemStatus = 'Fresh' | 'Expiring Soon' | 'Expired';

export interface InventoryItem {
    id: string;
    name: string;
    type: ItemType;
    expirationDate: string; // ISO 8601
    barcode?: string;
    imageUri?: string;
    status: ItemStatus;
    notificationId?: string;
    createdAt: string;
}
