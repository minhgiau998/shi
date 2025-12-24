import { create } from 'zustand';
import { InventoryItem } from '@appTypes/inventory';
import { db } from '@db/client';
import { inventoryItems } from '@db/schema';
import { eq } from 'drizzle-orm';

interface InventoryState {
    items: InventoryItem[];
    setItems: (items: InventoryItem[]) => void;
    loadItems: () => Promise<void>;
    addItem: (item: InventoryItem) => Promise<void>;
    updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    resetStore: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
    items: [],
    setItems: (items) => set({ items }),
    loadItems: async () => {
        try {
            const result = await db.select().from(inventoryItems);
            // Map DB result back to app Status if needed, though we computed it on fly mostly?
            // For now, trust DB status or re-compute it? The schema has status column.
            set({ items: result as InventoryItem[] });
        } catch (e) {
            console.error("Failed to load items from DB", e);
        }
    },
    addItem: async (item) => {
        try {
            await db.insert(inventoryItems).values(item);
            set((state) => ({ items: [item, ...state.items] }));
        } catch (e) {
            console.error("Failed to add item to DB", e);
        }
    },
    updateItem: async (id, updates) => {
        try {
            await db.update(inventoryItems).set(updates).where(eq(inventoryItems.id, id));
            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id ? { ...item, ...updates } : item
                ),
            }));
        } catch (e) {
            console.error("Failed to update item in DB", e);
        }
    },
    removeItem: async (id) => {
        try {
            await db.delete(inventoryItems).where(eq(inventoryItems.id, id));
            set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        } catch (e) {
            console.error("Failed to delete item from DB", e);
        }
    },
    resetStore: async () => {
        try {
            await db.delete(inventoryItems);
            set({ items: [] });
        } catch (e) {
            console.error("Failed to reset DB", e);
        }
    }
}));
