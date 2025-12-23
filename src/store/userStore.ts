import { create } from 'zustand';
import { UserProfile } from '@appTypes/user';

interface UserState {
    profile: UserProfile | null;
    setProfile: (profile: UserProfile) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    clearProfile: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    profile: null,
    setProfile: (profile) => set({ profile }),
    updateProfile: (updates) =>
        set((state) => ({
            profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
    clearProfile: () => set({ profile: null }),
}));
