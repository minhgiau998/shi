import React, { useState } from 'react';
import {
    Box,
    VStack,
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
    Center,
    ScrollView
} from '@gluestack-ui/themed';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AvatarGrid } from '@features/user/components/AvatarGrid';
import { useUserStore } from '@store/userStore';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    avatarId: z.string({ message: 'Please select an avatar' }),
});

type OnboardingFormData = z.infer<typeof schema>;

export default function OnboardingScreen() {
    const router = useRouter();
    const setProfile = useUserStore((state) => state.setProfile);

    const { control, handleSubmit, formState: { errors } } = useForm<OnboardingFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            avatarId: '',
        },
    });

    const onSubmit = (data: OnboardingFormData) => {
        // Generate UUID or similar
        const newProfile = {
            id: Math.random().toString(36).substring(7),
            userName: data.name,
            avatarId: data.avatarId,
            isOnboarded: true,
            notificationSettings: {
                foodLeadTime: 3,
                medicineLeadTime: 7,
                cosmeticsLeadTime: 7,
            },
            createdAt: new Date().toISOString(),
        };

        setProfile(newProfile);
        // In real app, save to DB here
        router.replace('/');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <Box flex={1} bg="$white">
                <ScrollView p="$6" keyboardShouldPersistTaps="handled">
                    <VStack space="xl" mt="$16">
                        <Center>
                            <Heading size="2xl" textAlign="center">Welcome to SHI!</Heading>
                            <Text size="md" color="$coolGray500" textAlign="center" mt="$2">
                                Let's get to know you.
                            </Text>
                        </Center>

                        <FormControl isInvalid={!!errors.name}>
                            <FormControlLabel>
                                <FormControlLabelText>What should we call you?</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input variant="underlined">
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
                                <FormControlErrorText>{errors.name?.message}</FormControlErrorText>
                            </FormControlError>
                        </FormControl>

                        <FormControl isInvalid={!!errors.avatarId}>
                            <FormControlLabel>
                                <FormControlLabelText>Choose your avatar</FormControlLabelText>
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

                        <Button
                            onPress={handleSubmit(onSubmit)}
                            bg="#6B9080"
                            size="lg"
                            mt="$10"
                            borderRadius="$xl"
                        >
                            <ButtonText>Start Organizing</ButtonText>
                        </Button>
                    </VStack>
                </ScrollView>
            </Box>
        </KeyboardAvoidingView>
    );
}
