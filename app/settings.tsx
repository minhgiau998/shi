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
import { ChevronLeft, LogOut, Download, Bell } from 'lucide-react-native';
import { getAvatarIcon } from '@features/user/components/AvatarGrid';
import { computeAllItemStatuses } from '@utils/expirationStatus';

export default function SettingsScreen() {
    const router = useRouter();
    const { profile, clearProfile } = useUserStore();
    const { items } = useInventoryStore();

    if (!profile) return null;

    // Compute current status for all items before export
    const itemsWithStatus = computeAllItemStatuses(items, profile.notificationSettings);

    return (
        <Box flex={1} bg="$white">
            <ScrollView p="$6">
                <HStack space="md" alignItems="center" mt="$10" mb="$6">
                    <Pressable onPress={() => router.back()}>
                        <Icon as={ChevronLeft} size="xl" />
                    </Pressable>
                    <Heading size="xl">Settings</Heading>
                </HStack>

                {/* Profile Section */}
                <VStack space="lg" mb="$10">
                    <HStack space="lg" alignItems="center" bg="$coolGray50" p="$4" borderRadius="$xl">
                        <Avatar bg="#6B9080" size="lg" borderRadius="$full">
                            <Icon as={getAvatarIcon(profile.avatarId)} color="white" size="xl" />
                        </Avatar>
                        <VStack flex={1} overflow="hidden">
                            <Text fontWeight="bold" size="lg" numberOfLines={1} ellipsizeMode="tail">
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

                {/* Notifications Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={Bell} size="sm" color="$coolGray600" />
                        <Heading size="md">Notifications</Heading>
                    </HStack>
                    <Divider />
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text>Food Lead Time (Days)</Text>
                        <Text fontWeight="bold">{profile.notificationSettings.foodLeadTime}</Text>
                    </HStack>
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text>Medicine Lead Time (Days)</Text>
                        <Text fontWeight="bold">{profile.notificationSettings.medicineLeadTime}</Text>
                    </HStack>
                </VStack>

                {/* Share Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={Share2} size="sm" color="$coolGray600" />
                        <Heading size="md">Share Data</Heading>
                    </HStack>
                    <Divider />

                    <Text size="sm" color="$coolGray500">
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

                {/* Logout/Reset */}
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
                    mt="$10"
                >
                    <Icon as={LogOut} mr="$2" size="sm" color="$red600" />
                    <ButtonText color="$red600">Reset App Data</ButtonText>
                </Button>
            </ScrollView>
        </Box>
    );
}
