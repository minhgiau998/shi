import { db } from '@db/client';
import { inventoryItems } from '@db/schema';
import { InventoryItem } from '@appTypes/inventory';
import { eq } from 'drizzle-orm';

export const inventoryService = {
    async getAllItems(): Promise<InventoryItem[]> {
        const results = await db.query.inventoryItems.findMany();
        return results as any;
    },

    async addItem(item: InventoryItem) {
        // Note: status is computed in app, but if stored:
        return await db.insert(inventoryItems).values({
            id: item.id,
            name: item.name,
            type: item.type,
            expirationDate: item.expirationDate,
            barcode: item.barcode,
            imageUri: item.imageUri,
            status: item.status,
            createdAt: item.createdAt,
        });
    },

    async deleteItem(id: string) {
        return await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
    }
};
