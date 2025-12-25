import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { Stack, useRouter, useRootNavigationState, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUserStore } from '@store/userStore';
import { useInventoryStore } from '@store/inventoryStore';
import { useEffect } from 'react';
import { notificationService } from '@utils/notificationService';
import * as Notifications from 'expo-notifications';
import { verifyTables } from '@db/client';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
    const rootNavigationState = useRootNavigationState();
    const router = useRouter();
    const segments = useSegments();
    const systemColorScheme = useColorScheme();

    const { loadItems } = useInventoryStore();
    const { profile, loadUser, isLoading } = useUserStore();

    const userTheme = profile?.theme || 'system';
    const activeTheme = userTheme === 'system'
        ? (systemColorScheme || 'light')
        : userTheme;

    // Request permissions, setup listeners, and initialize DB
    useEffect(() => {
        // Initialize DB tables
        verifyTables();

        // Load data
        loadItems();
        loadUser();

        notificationService.requestPermissions();

        // Listen for notification interactions (user taps on notification)
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const itemId = response.notification.request.content.data.itemId;
            if (itemId) {
                router.push(`/item/${itemId}`);
            }
        });

        return () => subscription.remove();
    }, []);

    // Ensure the navigation state is ready before rendering the Stack
    // This prevents "Attempted to navigate before mounting the Root Layout component"
    if (!rootNavigationState?.key || isLoading) {
        return null; // Or a splash screen
    }

    return (
        <SafeAreaProvider>
            <GluestackUIProvider config={config} colorMode={activeTheme}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="index" redirect={!profile?.isOnboarded} />
                    <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
                    <Stack.Screen name="add-item" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="item/[id]" />
                </Stack>
            </GluestackUIProvider>
        </SafeAreaProvider>
    );
}
