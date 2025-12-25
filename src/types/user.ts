export interface NotificationSettings {
    foodLeadTime: number;
    medicineLeadTime: number;
    cosmeticsLeadTime: number;
}

export interface UserProfile {
    id: string;
    userName: string;
    avatarId: string;
    isOnboarded: boolean;
    notificationSettings: NotificationSettings;
    theme: 'system' | 'light' | 'dark';
    createdAt: string;
}
