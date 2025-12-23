import React from 'react';
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
    Image,
    ScrollView,
    Badge,
    BadgeText,
    TrashIcon
} from '@gluestack-ui/themed';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInventoryStore } from '@store/inventoryStore';
import { useUserStore } from '@store/userStore';
import { ChevronLeft, Calendar, Package, Barcode, Edit } from 'lucide-react-native';
import { computeItemStatus, getDaysUntilExpiration } from '@utils/expirationStatus';
import { notificationService } from '@utils/notificationService';

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { items, removeItem } = useInventoryStore();
    const { profile } = useUserStore();

    const item = items.find((i) => i.id === id);

    // Compute status dynamically
    const computedStatus = item ? computeItemStatus(
        item.expirationDate,
        item.type,
        profile?.notificationSettings
    ) : 'Fresh';

    const daysUntilExpiration = item ? getDaysUntilExpiration(item.expirationDate) : 0;

    if (!item) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center">
                <Text>Item not found</Text>
                <Button onPress={() => router.back()} mt="$4">
                    <ButtonText>Go Back</ButtonText>
                </Button>
            </Box>
        );
    }

    const handleDelete = () => {
        if (item.notificationId) {
            notificationService.cancelItemNotification(item.notificationId);
        }
        removeItem(item.id);
        router.back();
    };

    return (
        <Box flex={1} bg="$white">
            <ScrollView>
                {/* Header Image or Placeholder */}
                <Box h={300} bg="$coolGray100">
                    {item.imageUri ? (
                        <Image source={{ uri: item.imageUri }} w="$full" h="$full" alt={item.name} />
                    ) : (
                        <Box flex={1} justifyContent="center" alignItems="center">
                            <Icon as={Package} color="$coolGray300" />
                        </Box>
                    )}
                    <Pressable
                        onPress={() => router.back()}
                        position="absolute"
                        top="$12"
                        left="$6"
                        bg="$white"
                        p="$2"
                        borderRadius="$full"
                    >
                        <Icon as={ChevronLeft} size="lg" color="#2C3E3F" />
                    </Pressable>
                </Box>

                <VStack p="$6" space="xl">
                    <HStack justifyContent="space-between" alignItems="flex-start">
                        <VStack space="xs" flex={1}>
                            <Heading size="2xl" color="#2C3E3F">{item.name}</Heading>
                            <Text color="$coolGray500">{item.type}</Text>
                        </VStack>
                        <Badge
                            bg={computedStatus === 'Expired' ? '#D64545' : computedStatus === 'Expiring Soon' ? '#E8A87C' : '#6B9080'}
                            borderRadius="$full"
                        >
                            <BadgeText color="white">{computedStatus}</BadgeText>
                        </Badge>
                    </HStack>

                    <VStack space="md" mt="$4">
                        <HStack space="md" alignItems="center">
                            <Icon as={Calendar} color={computedStatus === 'Expired' ? '#D64545' : computedStatus === 'Expiring Soon' ? '#E8A87C' : '#6B9080'} />
                            <VStack>
                                <Text size="xs" color="$coolGray500">Expiration Date</Text>
                                <Text fontWeight="bold">{item.expirationDate}</Text>
                                <Text size="xs" color={computedStatus === 'Expired' ? '#D64545' : computedStatus === 'Expiring Soon' ? '#E8A87C' : '$coolGray500'}>
                                    {daysUntilExpiration < 0
                                        ? `Expired ${Math.abs(daysUntilExpiration)} day${Math.abs(daysUntilExpiration) !== 1 ? 's' : ''} ago`
                                        : daysUntilExpiration === 0
                                            ? 'Expires today!'
                                            : `Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`
                                    }
                                </Text>
                            </VStack>
                        </HStack>

                        {item.barcode && (
                            <HStack space="md" alignItems="center">
                                <Icon as={Barcode} color="#6B9080" />
                                <VStack>
                                    <Text size="xs" color="$coolGray500">Barcode</Text>
                                    <Text fontWeight="bold">{item.barcode}</Text>
                                </VStack>
                            </HStack>
                        )}
                    </VStack>

                    <HStack space="md" mt="$20">
                        <Button
                            flex={1}
                            variant="outline"
                            onPress={() => router.push(`/edit-item/${item.id}`)}
                            borderColor="#6B9080"
                        >
                            <Icon as={Edit} mr="$2" color="#6B9080" />
                            <ButtonText color="#6B9080">Edit Item</ButtonText>
                        </Button>
                        <Button
                            flex={1}
                            action="negative"
                            variant="outline"
                            onPress={handleDelete}
                            borderColor="$red600"
                        >
                            <Icon as={TrashIcon} mr="$2" color="$red600" />
                            <ButtonText color="$red600">Remove</ButtonText>
                        </Button>
                    </HStack>
                </VStack>
            </ScrollView>
        </Box>
    );
}
