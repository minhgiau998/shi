import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { Stack, useRouter, useRootNavigationState, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useUserStore } from '@store/userStore';
import { useEffect } from 'react';
import { notificationService } from '@utils/notificationService';
import * as Notifications from 'expo-notifications';

export default function RootLayout() {
    const rootNavigationState = useRootNavigationState();
    const { profile } = useUserStore();
    const router = useRouter();
    const segments = useSegments();

    // Request permissions and setup listeners
    useEffect(() => {
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
    if (!rootNavigationState?.key) {
        return null; // Or a splash screen
    }

    return (
        <SafeAreaProvider>
            <GluestackUIProvider config={config}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="index" />
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
