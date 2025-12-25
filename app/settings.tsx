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
import { Share2, Globe } from 'lucide-react-native';
import { shareInventoryList } from '@utils/shareList';
import { useInventoryStore } from '@store/inventoryStore';
import { useRouter } from 'expo-router';
import { ChevronLeft, LogOut, Download, Bell, Moon } from 'lucide-react-native';
import { getAvatarIcon } from '@features/user/components/AvatarGrid';
import { computeAllItemStatuses } from '@utils/expirationStatus';
import { useTranslation } from 'react-i18next';

import { CATEGORIES, CategoryType } from '../src/constants/categories';

// Helper to map category value to notification setting key
const CATEGORY_TO_SETTING_KEY: Record<CategoryType, 'foodLeadTime' | 'medicineLeadTime' | 'cosmeticsLeadTime'> = {
    Food: 'foodLeadTime',
    Medicine: 'medicineLeadTime',
    Cosmetics: 'cosmeticsLeadTime',
};

export default function SettingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { profile, updateProfile, clearProfile } = useUserStore();
    const { items } = useInventoryStore();

    if (!profile) return null;

    // Compute current status for all items before export
    const itemsWithStatus = computeAllItemStatuses(items, profile.notificationSettings);

    const languages = [
        { label: t('settings.languages.system'), value: 'system' },
        { label: t('settings.languages.en'), value: 'en' },
        { label: t('settings.languages.vi'), value: 'vi' },
    ];

    const themes = [
        { label: t('settings.themes.system'), value: 'system' },
        { label: t('settings.themes.light'), value: 'light' },
        { label: t('settings.themes.dark'), value: 'dark' },
    ] as const;

    return (
        <Box flex={1} bg="$backgroundLight0" $dark-bg="$backgroundDark950">
            <ScrollView p="$6">
                <HStack space="md" alignItems="center" mt="$10" mb="$6">
                    <Pressable onPress={() => router.back()}>
                        <Icon as={ChevronLeft} size="xl" color="$textLight900" $dark-color="$textDark50" />
                    </Pressable>
                    <Heading size="xl" color="$textLight900" $dark-color="$textDark50">{t('settings.title')}</Heading>
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
                                {t('settings.created_at', { date: new Date(profile.createdAt).toLocaleDateString() })}
                            </Text>
                        </VStack>
                        <Button variant="link" onPress={() => router.push('/edit-profile')} flexShrink={0}>
                            <ButtonText color="#6B9080">{t('common.edit')}</ButtonText>
                        </Button>
                    </HStack>
                </VStack>

                {/* Appearance Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={Moon} size="sm" color="$coolGray600" $dark-color="$coolGray400" />
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">{t('settings.appearance')}</Heading>
                    </HStack>
                    <Divider />
                    <HStack space="sm" mt="$2">
                        {themes.map((theme) => (
                            <Button
                                key={theme.value}
                                flex={1}
                                variant={profile.theme === theme.value ? 'solid' : 'outline'}
                                action={profile.theme === theme.value ? 'primary' : 'secondary'}
                                bg={profile.theme === theme.value ? '#6B9080' : 'transparent'}
                                borderColor={profile.theme === theme.value ? '#6B9080' : '$coolGray300'}
                                onPress={() => updateProfile({ theme: theme.value })}
                            >
                                <ButtonText
                                    color={profile.theme === theme.value ? '$white' : '$coolGray600'}
                                    $dark-color={profile.theme === theme.value ? '$white' : '$coolGray400'}
                                    textTransform="capitalize"
                                >
                                    {theme.label}
                                </ButtonText>
                            </Button>
                        ))}
                    </HStack>
                </VStack>

                {/* Language Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={Globe} size="sm" color="$coolGray600" $dark-color="$coolGray400" />
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">{t('settings.language')}</Heading>
                    </HStack>
                    <Divider />
                    <VStack space="sm" mt="$2">
                        {languages.map((lang) => (
                            <Button
                                key={lang.value}
                                variant={profile.language === lang.value ? 'solid' : 'outline'}
                                action={profile.language === lang.value ? 'primary' : 'secondary'}
                                bg={profile.language === lang.value ? '#6B9080' : 'transparent'}
                                borderColor={profile.language === lang.value ? '#6B9080' : '$coolGray300'}
                                onPress={() => updateProfile({ language: lang.value })}
                                justifyContent="flex-start"
                            >
                                <ButtonText
                                    color={profile.language === lang.value ? '$white' : '$coolGray600'}
                                    $dark-color={profile.language === lang.value ? '$white' : '$coolGray400'}
                                >
                                    {lang.label}
                                </ButtonText>
                            </Button>
                        ))}
                    </VStack>
                </VStack>

                {/* Notifications Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={Bell} size="sm" color="$coolGray600" $dark-color="$coolGray400" />
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">{t('settings.notifications')}</Heading>
                    </HStack>
                    <Divider />
                    {CATEGORIES.map((cat) => (
                        <HStack key={cat.value} justifyContent="space-between" alignItems="center">
                            <Text color="$textLight900" $dark-color="$textDark50">
                                {t('settings.lead_time', { category: t(`categories.${cat.value.toLowerCase()}`) })}
                            </Text>
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
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">{t('settings.share_data')}</Heading>
                    </HStack>
                    <Divider />

                    <Text size="sm" color="$coolGray500" $dark-color="$coolGray400">
                        {t('settings.share_description')}
                    </Text>

                    <Button
                        variant="outline"
                        action="primary"
                        borderColor="#6B9080"
                        onPress={() => shareInventoryList(items)}
                    >
                        <ButtonText color="#6B9080">{t('settings.share_button')}</ButtonText>
                    </Button>
                </VStack>

                {/* Logout Section */}
                <VStack space="md" mb="$10">
                    <HStack alignItems="center" space="sm">
                        <Icon as={LogOut} size="sm" color="$coolGray600" $dark-color="$coolGray400" />
                        <Heading size="md" color="$textLight900" $dark-color="$textDark50">{t('settings.reset_data')}</Heading>
                    </HStack>
                    <Divider />

                    <Text size="sm" color="$coolGray500" $dark-color="$coolGray400">
                        {t('settings.reset_description')}
                    </Text>

                    <Button
                        variant="outline"
                        action="negative"
                        onPress={() => {
                            Alert.alert(
                                t('settings.reset_data'),
                                t('settings.reset_description'),
                                [
                                    {
                                        text: t('common.cancel'),
                                        style: "cancel"
                                    },
                                    {
                                        text: t('common.delete'),
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
                        <ButtonText color="$red600">{t('common.reset')}</ButtonText>
                    </Button>
                </VStack>
            </ScrollView>
        </Box>
    );
}

