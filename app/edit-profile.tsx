import React, { useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Heading,
    Text,
    Input,
    InputField,
    Button,
    ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    FormControlError,
    FormControlErrorText,
    FormControlErrorIcon,
    AlertCircleIcon,
    ScrollView,
    Pressable,
    Icon,
    Divider
} from '@gluestack-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AvatarGrid } from '@features/user/components/AvatarGrid';
import { useUserStore } from '@store/userStore';
import { useInventoryStore } from '@store/inventoryStore';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { notificationService } from '@utils/notificationService';
import { KeyboardAvoidingView, Platform } from 'react-native';

const schema = z.object({
    userName: z.string().min(2, 'Name must be at least 2 characters'),
    avatarId: z.string({ message: 'Please select an avatar' }),
    foodLeadTime: z.number().min(1).max(30),
    medicineLeadTime: z.number().min(1).max(30),
    cosmeticsLeadTime: z.number().min(1).max(30),
});

type EditProfileFormData = z.infer<typeof schema>;

export default function EditProfileScreen() {
    const router = useRouter();
    const { profile, updateProfile } = useUserStore();
    const { items, updateItem } = useInventoryStore();

    const { control, handleSubmit, formState: { errors }, reset } = useForm<EditProfileFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            userName: profile?.userName || '',
            avatarId: profile?.avatarId || '',
            foodLeadTime: profile?.notificationSettings.foodLeadTime || 3,
            medicineLeadTime: profile?.notificationSettings.medicineLeadTime || 7,
            cosmeticsLeadTime: profile?.notificationSettings.cosmeticsLeadTime || 7,
        },
    });

    useEffect(() => {
        if (profile) {
            reset({
                userName: profile.userName,
                avatarId: profile.avatarId,
                foodLeadTime: profile.notificationSettings.foodLeadTime,
                medicineLeadTime: profile.notificationSettings.medicineLeadTime,
                cosmeticsLeadTime: profile.notificationSettings.cosmeticsLeadTime,
            });
        }
    }, [profile, reset]);

    const onSubmit = async (data: EditProfileFormData) => {
        const newSettings = {
            foodLeadTime: data.foodLeadTime,
            medicineLeadTime: data.medicineLeadTime,
            cosmeticsLeadTime: data.cosmeticsLeadTime,
        };

        const settingsChanged =
            profile?.notificationSettings.foodLeadTime !== newSettings.foodLeadTime ||
            profile?.notificationSettings.medicineLeadTime !== newSettings.medicineLeadTime ||
            profile?.notificationSettings.cosmeticsLeadTime !== newSettings.cosmeticsLeadTime;

        updateProfile({
            userName: data.userName,
            avatarId: data.avatarId,
            notificationSettings: newSettings
        });

        // If lead times changed, reschedule all item notifications
        if (settingsChanged) {
            for (const item of items) {
                if (item.notificationId) {
                    await notificationService.cancelItemNotification(item.notificationId);
                }
                const newId = await notificationService.scheduleItemNotification(item, newSettings);
                if (newId) {
                    updateItem(item.id, { notificationId: newId });
                }
            }
        }

        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <Box flex={1} bg="$white">
                <ScrollView p="$6" keyboardShouldPersistTaps="handled">
                    <HStack space="md" alignItems="center" mt="$10" mb="$6">
                        <Pressable onPress={() => router.back()}>
                            <Icon as={ChevronLeft} size="xl" />
                        </Pressable>
                        <Heading size="xl">Edit Profile</Heading>
                    </HStack>

                    <VStack space="xl">
                        <FormControl isInvalid={!!errors.userName}>
                            <FormControlLabel>
                                <FormControlLabelText>Display Name</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="userName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input variant="outline">
                                        <InputField
                                            placeholder="Your Name"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                    </Input>
                                )}
                            />
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.userName?.message}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        <FormControl isInvalid={!!errors.avatarId}>
                            <FormControlLabel>
                                <FormControlLabelText>Change Avatar</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="avatarId"
                                render={({ field: { onChange, value } }) => (
                                    <AvatarGrid selectedId={value} onSelect={onChange} />
                                )}
                            />
                            <FormControlError>
                                <FormControlErrorIcon as={AlertCircleIcon} />
                                <FormControlErrorText>{errors.avatarId?.message}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        <Divider my="$4" />
                        <Heading size="md" mb="$2">Notification Lead Times (Days)</Heading>
                        <Text size="xs" color="$coolGray500" mb="$4">
                            How many days before expiration should we notify you?
                        </Text>

                        <HStack space="md" justifyContent="space-between">
                            <FormControl flex={1} isInvalid={!!errors.foodLeadTime}>
                                <FormControlLabel>
                                    <FormControlLabelText>Food</FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="foodLeadTime"
                                    render={({ field: { onChange, value } }) => (
                                        <Input variant="outline">
                                            <InputField
                                                keyboardType="numeric"
                                                value={value.toString()}
                                                onChangeText={(text) => onChange(parseInt(text) || 0)}
                                            />
                                        </Input>
                                    )}
                                />
                            </FormControl>

                            <FormControl flex={1} isInvalid={!!errors.medicineLeadTime}>
                                <FormControlLabel>
                                    <FormControlLabelText>Medicine</FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="medicineLeadTime"
                                    render={({ field: { onChange, value } }) => (
                                        <Input variant="outline">
                                            <InputField
                                                keyboardType="numeric"
                                                value={value.toString()}
                                                onChangeText={(text) => onChange(parseInt(text) || 0)}
                                            />
                                        </Input>
                                    )}
                                />
                            </FormControl>

                            <FormControl flex={1} isInvalid={!!errors.cosmeticsLeadTime}>
                                <FormControlLabel>
                                    <FormControlLabelText>Cosmetics</FormControlLabelText>
                                </FormControlLabel>
                                <Controller
                                    control={control}
                                    name="cosmeticsLeadTime"
                                    render={({ field: { onChange, value } }) => (
                                        <Input variant="outline">
                                            <InputField
                                                keyboardType="numeric"
                                                value={value.toString()}
                                                onChangeText={(text) => onChange(parseInt(text) || 0)}
                                            />
                                        </Input>
                                    )}
                                />
                            </FormControl>
                        </HStack>

                        <Button
                            onPress={handleSubmit(onSubmit)}
                            bg="#6B9080"
                            size="lg"
                            mt="$10"
                            borderRadius="$xl"
                        >
                            <ButtonText>Save Changes</ButtonText>
                        </Button>
                    </VStack>
                </ScrollView>
            </Box>
        </KeyboardAvoidingView>
    );
}
