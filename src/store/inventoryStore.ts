import { create } from 'zustand';
import { InventoryItem } from '@appTypes/inventory';

interface InventoryState {
    items: InventoryItem[];
    setItems: (items: InventoryItem[]) => void;
    addItem: (item: InventoryItem) => void;
    updateItem: (id: string, updates: Partial<InventoryItem>) => void;
    removeItem: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
    items: [],
    setItems: (items) => set({ items }),
    addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
    updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
        ),
    })),
    removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
}));
