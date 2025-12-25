import React from 'react';
import {
    Box,
    VStack,
    Heading,
    Text,
    HStack,
    Pressable,
    Icon,
    ScrollView,
    Badge,
    BadgeText,
    Divider
} from '@gluestack-ui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Utensils, Clock, BookOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import recipesData from '@assets/recipes.json';
import { Recipe } from '@utils/recipeMatcher';

export default function RecipeDetailScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const recipe = (recipesData as Recipe[]).find((r) => r.id === id);

    if (!recipe) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center" bg="$backgroundLight0" $dark-bg="$backgroundDark950">
                <Text>{t('item.not_found')}</Text>
                <Pressable onPress={() => router.back()} mt="$4">
                    <Text color="#6B9080">{t('item.go_back')}</Text>
                </Pressable>
            </Box>
        );
    }

    return (
        <Box flex={1} bg="$backgroundLight0" $dark-bg="$backgroundDark950">
            <ScrollView>
                {/* Header Image Placeholder */}
                <Box h={250} bg="$coolGray100" $dark-bg="$backgroundDark800" justifyContent="center" alignItems="center">
                    <Icon as={Utensils} size="lg" color="$coolGray300" $dark-color="$coolGray600" />
                    <Pressable
                        onPress={() => router.back()}
                        position="absolute"
                        top="$12"
                        left="$6"
                        bg="$backgroundLight0"
                        $dark-bg="$backgroundDark800"
                        p="$2"
                        borderRadius="$full"
                    >
                        <Icon as={ChevronLeft} size="lg" color="$textLight900" $dark-color="$textDark50" />
                    </Pressable>
                </Box>

                <VStack p="$6" space="xl">
                    <VStack space="xs">
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading size="2xl" color="$textLight900" $dark-color="$textDark50">
                                {t(`recipes.names.${recipe.name}`)}
                            </Heading>
                            <Badge bg="#E8F4F0" $dark-bg="$backgroundDark800" borderRadius="$full">
                                <BadgeText color="#6B9080" size="xs">{t(`recipes.tags.${recipe.tag}`)}</BadgeText>
                            </Badge>
                        </HStack>
                    </VStack>

                    <Divider />

                    <VStack space="md">
                        <HStack space="sm" alignItems="center">
                            <Icon as={Clock} size="sm" color="$coolGray400" />
                            <Text size="sm" color="$coolGray500">15-30 mins</Text>
                        </HStack>

                        <VStack space="sm">
                            <HStack space="sm" alignItems="center">
                                <Icon as={BookOpen} size="sm" color="#6B9080" />
                                <Heading size="md" color="$textLight900" $dark-color="$textDark50">
                                    {t('recipes.ingredients')}
                                </Heading>
                            </HStack>
                            <VStack space="xs" pl="$7">
                                {recipe.ingredients.map((ing, index) => (
                                    <HStack key={index} space="xs" alignItems="center">
                                        <Box w="$1.5" h="$1.5" borderRadius="$full" bg="#6B9080" />
                                        <Text color="$textLight800" $dark-color="$textDark200">
                                            {t(`recipes.ingredient_names.${ing.toLowerCase()}`, { defaultValue: ing })}
                                        </Text>
                                    </HStack>
                                ))}
                            </VStack>
                        </VStack>

                        <Divider my="$4" />

                        <VStack space="sm">
                            <Heading size="md" color="$textLight900" $dark-color="$textDark50">
                                {t('recipes.instructions')}
                            </Heading>
                            <Text color="$coolGray500" italic>
                                {t('recipes.coming_soon')}
                            </Text>
                        </VStack>
                    </VStack>
                </VStack>
            </ScrollView>
        </Box>
    );
}
