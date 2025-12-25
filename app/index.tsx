import React, { useEffect, useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Pressable,
    Icon,
    Fab,
    FabIcon,
    AddIcon,
    ScrollView,
    Avatar,
    AvatarFallbackText,
    Center
} from '@gluestack-ui/themed';
import { useUserStore } from '@store/userStore';
import { useInventoryStore } from '@store/inventoryStore';
import { useRouter, Redirect } from 'expo-router';
import { Home, Pill, Sparkles, AlertTriangle } from 'lucide-react-native';
import { getRecipeSuggestion } from '@utils/recipeMatcher';
import { useWindowDimensions } from 'react-native';
import { computeAllItemStatuses } from '@utils/expirationStatus';
import { getAvatarIcon } from '@features/user/components/AvatarGrid';

import { CATEGORIES, CategoryType } from '../src/constants/categories';

const CATEGORY_ICONS: Record<CategoryType, any> = {
    Food: Sparkles,
    Medicine: Pill,
    Cosmetics: Sparkles,
};

const FILTER_OPTIONS = [
    { label: 'All', value: 'All', icon: Home },
    ...CATEGORIES.map((cat) => ({
        label: cat.label,
        value: cat.value,
        icon: CATEGORY_ICONS[cat.value],
    })),
];

export default function DashboardScreen() {
    const router = useRouter();
    const { profile } = useUserStore();
    const { items } = useInventoryStore();
    const [activeFilter, setActiveFilter] = useState('All');
    const { width } = useWindowDimensions();

    if (!profile || !profile.isOnboarded) {
        return <Redirect href="/onboarding" />;
    }

    // Compute status dynamically based on expiration date and user settings
    const itemsWithStatus = computeAllItemStatuses(items, profile.notificationSettings);

    const expiredItems = itemsWithStatus.filter(i => i.status === 'Expired');
    const expiredCount = expiredItems.length;
    const expiringSoonItems = itemsWithStatus.filter(i => i.status === 'Expiring Soon');
    const expiringSoonCount = expiringSoonItems.length;
    const filteredItems = activeFilter === 'All' ? itemsWithStatus : itemsWithStatus.filter(i => i.type === activeFilter);
    const suggestion = getRecipeSuggestion(expiringSoonItems);

    return (
        <Box flex={1} bg="$backgroundLight0" $dark-bg="$backgroundDark950">
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                {/* Header */}
                <HStack justifyContent="space-between" alignItems="center" mt="$10" mb="$6">
                    <VStack>
                        <Heading size="xl" color="$textLight900" $dark-color="$textDark50" style={{ width: width * 0.6 }}>Hello, {profile.userName}!</Heading>
                        <Text size="sm" color={expiredCount > 0 ? '#D64545' : expiringSoonCount > 0 ? '#E8A87C' : '#6B9080'}>
                            {expiredCount > 0
                                ? `⚠️ You have ${expiredCount} expired item${expiredCount > 1 ? 's' : ''}!`
                                : expiringSoonCount > 0
                                    ? `You have ${expiringSoonCount} item${expiringSoonCount > 1 ? 's' : ''} expiring soon.`
                                    : "Everything is fresh!"}
                        </Text>
                    </VStack>
                    <Pressable onPress={() => router.push('/settings')}>
                        <Avatar bg="#6B9080" size="md" borderRadius="$full">
                            <Icon as={getAvatarIcon(profile.avatarId)} color="white" />
                        </Avatar>
                    </Pressable>
                </HStack>

                {/* Recipe Suggestion */}
                {suggestion && (
                    <Pressable
                        onPress={() => {/* Open recipes page or details */ }}
                        mb="$8"
                        bg="#E8F4F0"
                        $dark-bg="$backgroundDark800"
                        p="$4"
                        borderRadius="$xl"
                        borderWidth={1}
                        borderColor="#6B9080"
                    >
                        <HStack space="md" alignItems="center">
                            <Icon as={Sparkles} color="#6B9080" />
                            <VStack flex={1}>
                                <Heading size="sm" color="$textLight900" $dark-color="$textDark50">Recipe Tip</Heading>
                                <Text size="sm" color="#6B9080">{suggestion.message}</Text>
                            </VStack>
                        </HStack>
                    </Pressable>
                )}

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    style={{ marginHorizontal: -24, marginBottom: 32 }}
                >
                    <HStack space="sm">
                        {FILTER_OPTIONS.map((option) => {
                            const isActive = activeFilter === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => setActiveFilter(option.value)}
                                    px="$4"
                                    py="$2"
                                    borderRadius="$full"
                                    bg={isActive ? '#6B9080' : '$white'}
                                    $dark-bg={isActive ? '#6B9080' : '$backgroundDark800'}
                                    borderWidth={1}
                                    borderColor={isActive ? '#6B9080' : '$coolGray200'}
                                    $dark-borderColor={isActive ? '#6B9080' : '$coolGray700'}
                                >
                                    <Text
                                        color={isActive ? '$white' : '$coolGray600'}
                                        $dark-color={isActive ? '$white' : '$coolGray300'}
                                        fontWeight={isActive ? 'bold' : 'normal'}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </HStack>
                </ScrollView>

                {/* Inventory List */}
                <VStack space="md" pb="$10">
                    {filteredItems.length === 0 ? (
                        <Center mt="$20">
                            <Text color="$coolGray400">No items found. Add some!</Text>
                        </Center>
                    ) : (
                        filteredItems.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => router.push(`/item/${item.id}`)}
                                bg="$white"
                                $dark-bg="$backgroundDark900"
                                p="$4"
                                borderRadius="$xl"
                                borderLeftWidth={5}
                                borderLeftColor={item.status === 'Expired' ? '#D64545' : item.status === 'Expiring Soon' ? '#E8A87C' : '#6B9080'}
                                shadowColor="$black"
                                shadowOffset={{ width: 0, height: 2 }}
                                shadowOpacity={0.05}
                                elevation={2}
                            >
                                <HStack justifyContent="space-between" alignItems="center">
                                    <VStack>
                                        <Text fontWeight="bold" size="lg" color="$textLight900" $dark-color="$textDark50" style={{ width: width * 0.6 }}>{item.name}</Text>
                                        <Text size="xs" color="$coolGray400">Expires: {item.expirationDate}</Text>
                                    </VStack>
                                    <Text size="xs" color="$coolGray500" italic>{item.type}</Text>
                                </HStack>
                            </Pressable>
                        ))
                    )}
                </VStack>
            </ScrollView>

            {/* FAB */}
            <Fab
                size="lg"
                placement="bottom right"
                onPress={() => router.push('/add-item')}
                bg="#6B9080"
            >
                <FabIcon as={AddIcon} />
            </Fab>
        </Box >
    );
}
