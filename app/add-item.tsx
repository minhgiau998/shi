import React, { useState } from 'react';
import {
    Box,
    VStack,
    Heading,
    Input,
    InputField,
    Button,
    ButtonText,
    FormControl,
    FormControlLabel,
    FormControlLabelText,
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicatorWrapper,
    SelectDragIndicator,
    SelectItem,
    ChevronDownIcon,
    HStack,
    Text,
    Pressable,
    Icon,
    Image,
    ScrollView,
} from '@gluestack-ui/themed';
import { TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { useInventoryStore } from '@store/inventoryStore';
import { useUserStore } from '@store/userStore';
import { Camera, CameraIcon, Package, Scan } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { computeItemStatus } from '@utils/expirationStatus';
import { notificationService } from '@utils/notificationService';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(['Food', 'Medicine', 'Cosmetics']),
    expirationDate: z.string().min(1, 'Date is required'),
    barcode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function AddItemScreen() {
    const router = useRouter();
    const addItem = useInventoryStore((state) => state.addItem);
    const { profile } = useUserStore();
    const [imageUri, setImageUri] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            type: 'Food',
            expirationDate: '',
            barcode: '',
        },
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const onSubmit = (data: FormData) => {
        // Compute the correct status based on expiration date and user settings
        const itemType = data.type as 'Food' | 'Medicine' | 'Cosmetics';
        const status = computeItemStatus(
            data.expirationDate,
            itemType,
            profile?.notificationSettings
        );

        const newItem = {
            id: Math.random().toString(36).substring(7),
            name: data.name,
            type: itemType,
            expirationDate: data.expirationDate,
            barcode: data.barcode,
            imageUri: imageUri || undefined,
            status: status,
            notificationId: undefined as string | undefined, // To be filled after scheduling
            createdAt: new Date().toISOString(),
        };

        // Schedule notification if profile exists
        if (profile) {
            notificationService.scheduleItemNotification(newItem as any, profile.notificationSettings)
                .then(id => {
                    if (id) {
                        newItem.notificationId = id;
                    }
                    addItem(newItem);
                })
                .catch(err => {
                    console.error("Failed to schedule notification:", err);
                    addItem(newItem); // Add anyway
                });
        } else {
            addItem(newItem);
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
                    <VStack space="xl" mt="$10" pb="$10">
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading size="xl">Add Item</Heading>
                            <Pressable onPress={() => router.back()}>
                                <Text color="#6B9080">Cancel</Text>
                            </Pressable>
                        </HStack>

                        {/* Image Picker Placeholder */}
                        <Box w="$full" alignItems="center">
                            <TouchableOpacity
                                onPress={pickImage}
                                activeOpacity={0.7}
                                style={{
                                    width: '100%',
                                    height: 200,
                                    backgroundColor: '#F3F4F6',
                                    borderRadius: 12,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    borderColor: '#D1D5DB',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden'
                                }}
                            >
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} w="$full" h="$full" alt="Item preview" />
                                ) : (
                                    <VStack alignItems="center" space="sm">
                                        <Icon as={CameraIcon} size="xl" color="$coolGray400" />
                                        <Text color="$coolGray400">Add Photo</Text>
                                    </VStack>
                                )}
                            </TouchableOpacity>
                        </Box>

                        <FormControl isInvalid={!!errors.name}>
                            <FormControlLabel>
                                <FormControlLabelText>Item Name</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, value } }) => (
                                    <Input variant="outline">
                                        <InputField placeholder="e.g. Greek Yogurt" value={value} onChangeText={onChange} />
                                    </Input>
                                )}
                            />
                        </FormControl>

                        <FormControl isInvalid={!!errors.type}>
                            <FormControlLabel>
                                <FormControlLabelText>Category</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field: { onChange, value } }) => (
                                    <Select onValueChange={onChange} selectedValue={value}>
                                        <SelectTrigger variant="outline" size="md">
                                            <SelectInput placeholder="Select category" />
                                            <SelectIcon as={ChevronDownIcon} mr="$3" />
                                        </SelectTrigger>
                                        <SelectPortal>
                                            <SelectBackdrop />
                                            <SelectContent>
                                                <SelectDragIndicatorWrapper>
                                                    <SelectDragIndicator />
                                                </SelectDragIndicatorWrapper>
                                                <SelectItem label="Food" value="Food" />
                                                <SelectItem label="Medicine" value="Medicine" />
                                                <SelectItem label="Cosmetics" value="Cosmetics" />
                                            </SelectContent>
                                        </SelectPortal>
                                    </Select>
                                )}
                            />
                        </FormControl>

                        <FormControl isInvalid={!!errors.expirationDate}>
                            <FormControlLabel>
                                <FormControlLabelText>Expiration Date</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="expirationDate"
                                render={({ field: { onChange, value } }) => (
                                    <Box>
                                        <Pressable onPress={() => setShowDatePicker(true)}>
                                            <Input variant="outline" isReadOnly>
                                                <InputField
                                                    placeholder="Select Date"
                                                    value={value}
                                                    editable={false}
                                                />
                                            </Input>
                                        </Pressable>

                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                // For iOS only
                                                accentColor="#6B9080"
                                                textColor="#6B9080"
                                                // -------------------------
                                                onChange={(event, selectedDate) => {
                                                    // On Android, the picker closes automatically (event type 'set' or 'dismissed')
                                                    // On iOS, we usually keep it open to let the user scroll
                                                    const shouldClose = Platform.OS !== 'ios';

                                                    if (shouldClose) {
                                                        setShowDatePicker(false);
                                                    }

                                                    if (selectedDate) {
                                                        setDate(selectedDate);
                                                        onChange(format(selectedDate, 'yyyy-MM-dd'));
                                                    }
                                                }}
                                                minimumDate={new Date()}
                                            />
                                        )}
                                    </Box>
                                )}
                            />
                        </FormControl>

                        <FormControl>
                            <FormControlLabel>
                                <FormControlLabelText>Barcode (Optional)</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="barcode"
                                render={({ field: { onChange, value } }) => (
                                    <HStack space="md">
                                        <Input variant="outline" flex={1}>
                                            <InputField placeholder="Barcode number" value={value} onChangeText={onChange} />
                                        </Input>
                                        <Button variant="outline" action="primary" onPress={() => {/* Scan logic */ }}>
                                            <Icon as={Scan} color="#6B9080" />
                                        </Button>
                                    </HStack>
                                )}
                            />
                        </FormControl>

                        <Button
                            onPress={handleSubmit(onSubmit)}
                            bg="#6B9080"
                            size="lg"
                            mt="$2"
                            borderRadius="$xl"
                        >
                            <ButtonText>Save Item</ButtonText>
                        </Button>
                    </VStack>
                </ScrollView>
            </Box>
        </KeyboardAvoidingView>
    );
}
