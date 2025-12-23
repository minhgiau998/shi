import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // UUID
    name: text('name').notNull(),
    avatarId: text('avatar_id').notNull(),
    isOnboarded: integer('is_onboarded', { mode: 'boolean' }).default(false),
    createdAt: text('created_at').notNull(),
});

export const inventoryItems = sqliteTable('inventory_items', {
    id: text('id').primaryKey(), // UUID
    name: text('name').notNull(),
    type: text('type', { enum: ['Food', 'Medicine', 'Cosmetics'] }).notNull(),
    expirationDate: text('expiration_date').notNull(),
    barcode: text('barcode'),
    imageUri: text('image_uri'),
    status: text('status', { enum: ['Fresh', 'Expiring Soon', 'Expired'] }).notNull(), // Computed status, but storing might be cache. Actually status is usually computed on fly. Software.md says "Create the utility function that compares expirationDate vs today". But schema in requirements had 'status' property. If it's computed, we might not store it if we can compute efficiently. But requirement `InventoryItem` has it. I'll store it for easy querying/filtering if Drizzle allows. Or I'll drop it if it's purely computed. Requirements say "Computed property". I'll leave it as a column for now to match the interface, or strictly compute it. Storing it implies we need to update it daily. Better to compute it. I will keep it in the interface but maybe not in DB? No, requirements schema: `status: 'Fresh' | ... // Computed property`. I'll omit it from DB schema and compute it in the application layer or use a generated column if SQLite supported it easily, but application layer logic is safer for "Today" changes.
    createdAt: text('created_at').notNull(),
});
