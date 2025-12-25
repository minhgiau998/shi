import React from 'react';
import { Alert } from 'react-native';
import {
    Box,
    VStack,
    Heading,
    Text,
    HStack,
    Pressable,
    Icon,
    Button,
    ButtonText,
    Divider,
    ScrollView,
    Avatar
} from '@gluestack-ui/themed';
import { useUserStore } from '@store/userStore';
import { Share2 } from 'lucide-react-native';
import { shareInventoryList } from '@utils/shareList';
import { useInventoryStore } from '@store/inventoryStore';
import { useRouter } from 'expo-router';
import { ChevronLeft, LogOut, Download, Bell, Moon } from 'lucide-react-native';
import { getAvatarIcon } from '@features/user/components/AvatarGrid';
import { computeAllItemStatuses } from '@utils/expirationStatus';

import { CATEGORIES, CategoryType } from '../src/constants/categories';

// Helper to map category value to notification setting key
const CATEGORY_TO_SETTING_KEY: Record<CategoryType, 'foodLeadTime' | 'medicineLeadTime' | 'cosmeticsLeadTime'> = {
    Food: 'foodLeadTime',
    Medicine: 'medicineLeadTime',
    Cosmetics: 'cosmeticsLeadTime',
};

export default function SettingsScreen() {
    const router = useRouter();
    const { profile, updateProfile, clearProfile } = useUserStore();
    const { items } = useInventoryStore();

    if (!profile) return null;

    // Compute current status for all items before export
    const itemsWithStatus = computeAllItemStatuses(items, profile.notificationSettings);

    return (
        <Box flex={1} bg="$backgroundLight0" $dark-bg="$backgroundDark950">
            <ScrollView p="$6">
                <HStack space="md" alignItems="center" mt="$10" mb="$6">
                    <Pressable onPress={() => router.back()}>
                        <Icon as={ChevronLeft} size="xl" color="$textLight900" $dark-color="$textDark50" />
                    </Pressable>
                    <Heading size="xl" color="$textLight900" $dark-color="$textDark50">Settings</Heading>
                </HStack>

                {/* Profile Section */}
                <VStack space="lg" mb="$10">
                    <HStack space="lg" alignItems="center" bg="$backgroundLight50" $dark-bg="$backgroundDark900" p="$4" borderRadius="$xl">
                        <Avatar bg="#6B9080" size="lg" borderRadius="$full">
                            <Icon as={getAvatarIcon(profile.avatarId)} color="white" size="xl" />
                        </Avatar>
                        <VStack flex={1} overflow="hidden">
                            <Text fontWeight="bold" size="lg" numberOfLines={1} ellipsizeMode="tail" color="$textLight900" $dark-color="$textDark50">
                                {profile.userName}
                            </Text>
                            <Text size="sm" color="$coolGray500" numberOfLines={1} ellipsizeMode="tail">
                                Created at {new Date(profile.createdAt).toLocaleDateString()}
                            </Text>
                        </VStack>
                        <Button variant="link" onPress={() => router.push('/edit-profile')} flexShrink={0}>
                            <ButtonText color="#6B9080">Edit</ButtonText>
                        </Button>
                    </HStack>
                </VStack>

                {/* Appearance Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={Moon} size="sm" color="$coolGray600" $dark-color="$coolGray400" />
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">App Appearance</Heading>
                    </HStack>
                    <Divider />
                    <HStack space="sm" mt="$2">
                        {(['system', 'light', 'dark'] as const).map((mode) => (
                            <Button
                                key={mode}
                                flex={1}
                                variant={profile.theme === mode ? 'solid' : 'outline'}
                                action={profile.theme === mode ? 'primary' : 'secondary'}
                                bg={profile.theme === mode ? '#6B9080' : 'transparent'}
                                borderColor={profile.theme === mode ? '#6B9080' : '$coolGray300'}
                                onPress={() => updateProfile({ theme: mode })}
                            >
                                <ButtonText
                                    color={profile.theme === mode ? '$white' : '$coolGray600'}
                                    $dark-color={profile.theme === mode ? '$white' : '$coolGray400'}
                                    textTransform="capitalize"
                                >
                                    {mode}
                                </ButtonText>
                            </Button>
                        ))}
                    </HStack>
                </VStack>

                {/* Notifications Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={Bell} size="sm" color="$coolGray600" $dark-color="$coolGray400" />
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">Notifications</Heading>
                    </HStack>
                    <Divider />
                    {CATEGORIES.map((cat) => (
                        <HStack key={cat.value} justifyContent="space-between" alignItems="center">
                            <Text color="$textLight900" $dark-color="$textDark50">{cat.label} Lead Time (Days)</Text>
                            <Text fontWeight="bold" color="$textLight900" $dark-color="$textDark50">
                                {profile.notificationSettings[CATEGORY_TO_SETTING_KEY[cat.value]]}
                            </Text>
                        </HStack>
                    ))}
                </VStack>

                {/* Share Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={Share2} size="sm" color="$coolGray600" $dark-color="$coolGray400" />
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">Share Data</Heading>
                    </HStack>
                    <Divider />

                    <Text size="sm" color="$coolGray500" $dark-color="$coolGray400">
                        Send your current inventory list via message or save to notes.
                    </Text>

                    <Button
                        variant="outline"
                        action="primary"
                        borderColor="#6B9080"
                        onPress={() => shareInventoryList(items)}
                    >
                        <ButtonText color="#6B9080">Share Inventory List</ButtonText>
                    </Button>
                </VStack>

                {/* Logout Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={LogOut} size="sm" color="$coolGray600" $dark-color="$coolGray400" />
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">Reset App Data</Heading>
                    </HStack>
                    <Divider />

                    <Text size="sm" color="$coolGray500" $dark-color="$coolGray400">
                        This will clear all data stored in the app and reset everything to the beginning.
                    </Text>

                    <Button
                        variant="outline"
                        action="negative"
                        onPress={() => {
                            Alert.alert(
                                "Reset App Data",
                                "Are you sure you want to delete all your data? This action cannot be undone.",
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: async () => {
                                            await useInventoryStore.getState().resetStore();
                                            await clearProfile();
                                            router.replace('/onboarding');
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <ButtonText color="$red600">Reset</ButtonText>
                    </Button>
                </VStack>
            </ScrollView>
        </Box>
    );
}
