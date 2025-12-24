import { create } from 'zustand';
import { UserProfile } from '@appTypes/user';
import { db } from '@db/client';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';

interface UserState {
    profile: UserProfile | null;
    isLoading: boolean;
    loadUser: () => Promise<void>;
    setProfile: (profile: UserProfile) => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    clearProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    profile: null,
    isLoading: true,
    loadUser: async () => {
        try {
            const result = await db.select().from(users).limit(1);
            if (result.length > 0) {
                const user = result[0];
                const profile: UserProfile = {
                    id: user.id,
                    userName: user.name,
                    avatarId: user.avatarId,
                    isOnboarded: user.isOnboarded || false,
                    createdAt: user.createdAt,
                    notificationSettings: {
                        foodLeadTime: 3,
                        medicineLeadTime: 7,
                        cosmeticsLeadTime: 7,
                    }
                };
                set({ profile, isLoading: false });
            } else {
                set({ profile: null, isLoading: false });
            }
        } catch (e) {
            console.error("Failed to load user", e);
            set({ isLoading: false });
        }
    },
    setProfile: async (profile) => {
        try {
            await db.insert(users).values({
                id: profile.id,
                name: profile.userName,
                avatarId: profile.avatarId,
                isOnboarded: profile.isOnboarded,
                createdAt: profile.createdAt
            });
            set({ profile });
        } catch (e) {
            console.error("Failed to save user", e);
        }
    },
    updateProfile: async (updates) => {
        const currentProfile = get().profile;
        if (!currentProfile) return;

        const updatedProfile = { ...currentProfile, ...updates };

        try {
            await db.update(users)
                .set({
                    name: updatedProfile.userName,
                    avatarId: updatedProfile.avatarId,
                    isOnboarded: updatedProfile.isOnboarded,
                })
                .where(eq(users.id, currentProfile.id));

            set({ profile: updatedProfile });
        } catch (e) {
            console.error("Failed to update user", e);
        }
    },
    clearProfile: async () => {
        try {
            await db.delete(users);
            set({ profile: null });
        } catch (e) {
            console.error("Failed to delete user", e);
        }
    },
}));
