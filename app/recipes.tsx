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
    Divider
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { ChevronLeft, Utensils, Search } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import recipesData from '@assets/recipes.json';
import { Recipe } from '@utils/recipeMatcher';

export default function RecipesListScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const recipes = recipesData as Recipe[];

    return (
        <Box flex={1} bg="$backgroundLight0" $dark-bg="$backgroundDark950">
            <ScrollView contentContainerStyle={{ padding: 24 }}>
                <HStack space="md" alignItems="center" mt="$10" mb="$6">
                    <Pressable onPress={() => router.back()}>
                        <Icon as={ChevronLeft} size="xl" color="$textLight900" $dark-color="$textDark50" />
                    </Pressable>
                    <Heading size="xl" color="$textLight900" $dark-color="$textDark50">{t('recipes.title')}</Heading>
                </HStack>

                <VStack space="md">
                    {recipes.map((recipe) => (
                        <Pressable
                            key={recipe.id}
                            onPress={() => router.push(`/recipe/${recipe.id}`)}
                            bg="$white"
                            $dark-bg="$backgroundDark900"
                            p="$4"
                            borderRadius="$xl"
                            shadowColor="$black"
                            shadowOffset={{ width: 0, height: 2 }}
                            shadowOpacity={0.05}
                            elevation={2}
                            sx={{
                                ":active": {
                                    opacity: 0.7
                                }
                            }}
                        >
                            <HStack space="md" alignItems="center">
                                <Box bg="#E8F4F0" p="$3" borderRadius="$lg">
                                    <Icon as={Utensils} color="#6B9080" />
                                </Box>
                                <VStack flex={1}>
                                    <Heading size="sm" color="$textLight900" $dark-color="$textDark50">
                                        {t(`recipes.names.${recipe.name}`)}
                                    </Heading>
                                    <Text size="xs" color="$coolGray400">{t(`recipes.tags.${recipe.tag}`)}</Text>
                                </VStack>
                            </HStack>
                        </Pressable>
                    ))}
                </VStack>
            </ScrollView>
        </Box>
    );
}
