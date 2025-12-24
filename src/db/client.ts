import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('shi.db');
export const db = drizzle(expoDb, { schema });

// Helper to ensure tables exist (basic migration for standalone)
export const verifyTables = () => {
    try {
        expoDb.execSync(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                avatar_id TEXT NOT NULL,
                is_onboarded INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS inventory_items (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                expiration_date TEXT NOT NULL,
                barcode TEXT,
                image_uri TEXT,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        `);
        console.log("Tables verified/created");
    } catch (e) {
        console.error("Error creating tables:", e);
    }
};
