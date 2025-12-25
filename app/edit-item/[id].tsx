import React, { useState, useEffect } from 'react';
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
import { TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useInventoryStore } from '@store/inventoryStore';
import { CameraIcon, Scan } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { useUserStore } from '@store/userStore';
import { notificationService } from '@utils/notificationService';
import { CATEGORIES, CATEGORY_VALUES } from '../../src/constants/categories';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.enum(CATEGORY_VALUES),
    expirationDate: z.string().min(1, 'Date is required'),
    barcode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EditItemScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { items, updateItem } = useInventoryStore();
    const { profile } = useUserStore();

    const item = items.find((i) => i.id === id);

    const [imageUri, setImageUri] = useState<string | null>(item?.imageUri || null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(() => {
        if (item?.expirationDate) {
            try {
                return parseISO(item.expirationDate);
            } catch {
                return new Date();
            }
        }
        return new Date();
    });

    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: item?.name || '',
            type: item?.type || 'Food',
            expirationDate: item?.expirationDate || '',
            barcode: item?.barcode || '',
        },
    });

    // Reset form when item changes
    useEffect(() => {
        if (item) {
            reset({
                name: item.name,
                type: item.type,
                expirationDate: item.expirationDate,
                barcode: item.barcode || '',
            });
            setImageUri(item.imageUri || null);
            if (item.expirationDate) {
                try {
                    setDate(parseISO(item.expirationDate));
                } catch {
                    // Keep current date if parsing fails
                }
            }
        }
    }, [item, reset]);

    if (!item) {
        return (
            <Box flex={1} justifyContent="center" alignItems="center" bg="$white">
                <Text>Item not found</Text>
                <Button onPress={() => router.back()} mt="$4">
                    <ButtonText>Go Back</ButtonText>
                </Button>
            </Box>
        );
    }

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const chooseFromLibrary = async () => {
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

    const pickImage = () => {
        Alert.alert(
            "Change Photo",
            "Choose a source",
            [
                {
                    text: "Take Photo",
                    onPress: takePhoto
                },
                {
                    text: "Choose from Library",
                    onPress: chooseFromLibrary
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    const onSubmit = async (data: FormData) => {
        if (!item) return;

        // Cancel existing notification
        if (item.notificationId) {
            await notificationService.cancelItemNotification(item.notificationId);
        }

        const updatedFields: any = {
            name: data.name,
            type: data.type as any,
            expirationDate: data.expirationDate,
            barcode: data.barcode,
            imageUri: imageUri || undefined,
            notificationId: undefined,
        };

        // Schedule new notification
        if (profile) {
            try {
                const newNotificationId = await notificationService.scheduleItemNotification(
                    { ...item, ...updatedFields } as any,
                    profile.notificationSettings
                );
                if (newNotificationId) {
                    updatedFields.notificationId = newNotificationId;
                }
            } catch (err) {
                console.error("Failed to reschedule notification:", err);
            }
        }

        updateItem(item.id, updatedFields);
        router.back();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <Box flex={1} bg="$backgroundLight0" $dark-bg="$backgroundDark950">
                <ScrollView p="$6" keyboardShouldPersistTaps="handled">
                    <VStack space="xl" mt="$10" pb="$10">
                        <HStack justifyContent="space-between" alignItems="center">
                            <Heading size="xl" color="$textLight900" $dark-color="$textDark50">Edit Item</Heading>
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
                                    borderRadius: 12,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    w="$full"
                                    h="$full"
                                    borderWidth={2}
                                    borderStyle="dashed"
                                    borderRadius={12}
                                    justifyContent="center"
                                    alignItems="center"
                                    sx={{
                                        bg: "$coolGray100",
                                        borderColor: "$coolGray300",
                                        _dark: {
                                            bg: "$backgroundDark800",
                                            borderColor: "$coolGray700",
                                        },
                                    }}
                                >
                                    {imageUri ? (
                                        <Image source={{ uri: imageUri }} w="$full" h="$full" alt="Item preview" />
                                    ) : (
                                        <VStack alignItems="center" space="sm">
                                            <Icon as={CameraIcon} size="xl" color="$coolGray400" />
                                            <Text color="$coolGray400">Change Photo</Text>
                                        </VStack>
                                    )}
                                </Box>
                            </TouchableOpacity>
                        </Box>

                        <FormControl isInvalid={!!errors.name}>
                            <FormControlLabel>
                                <FormControlLabelText color="$textLight900" $dark-color="$textDark50">Item Name</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="name"
                                render={({ field: { onChange, value } }) => (
                                    <Input variant="outline">
                                        <InputField placeholder="e.g. Greek Yogurt" value={value} onChangeText={onChange} color="$textLight900" $dark-color="$textDark50" />
                                    </Input>
                                )}
                            />
                        </FormControl>

                        <FormControl isInvalid={!!errors.type}>
                            <FormControlLabel>
                                <FormControlLabelText color="$textLight900" $dark-color="$textDark50">Category</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="type"
                                render={({ field: { onChange, value } }) => (
                                    <Select onValueChange={onChange} selectedValue={value}>
                                        <SelectTrigger variant="outline" size="md">
                                            <SelectInput placeholder="Select category" color="$textLight900" $dark-color="$textDark50" />
                                            <SelectIcon as={ChevronDownIcon} mr="$3" />
                                        </SelectTrigger>
                                        <SelectPortal>
                                            <SelectBackdrop />
                                            <SelectContent>
                                                <SelectDragIndicatorWrapper>
                                                    <SelectDragIndicator />
                                                </SelectDragIndicatorWrapper>
                                                {CATEGORIES.map((cat) => (
                                                    <SelectItem
                                                        key={cat.value}
                                                        label={cat.label}
                                                        value={cat.value}
                                                        sx={{
                                                            _light: {
                                                                bg: "$backgroundLight50",
                                                                ":hover": {
                                                                    bg: "$backgroundLight100",
                                                                },
                                                                ":active": {
                                                                    bg: "$backgroundLight200",
                                                                },
                                                            },
                                                            _dark: {
                                                                bg: "$backgroundDark900",
                                                                ":hover": {
                                                                    bg: "$backgroundDark800",
                                                                },
                                                                ":active": {
                                                                    bg: "$backgroundDark700",
                                                                },
                                                            },
                                                        }}
                                                    />
                                                ))}
                                            </SelectContent>
                                        </SelectPortal>
                                    </Select>
                                )}
                            />
                        </FormControl>

                        <FormControl isInvalid={!!errors.expirationDate}>
                            <FormControlLabel>
                                <FormControlLabelText color="$textLight900" $dark-color="$textDark50">Expiration Date</FormControlLabelText>
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
                                                    color="$textLight900"
                                                    $dark-color="$textDark50"
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
                                            />
                                        )}
                                    </Box>
                                )}
                            />
                        </FormControl>

                        <FormControl>
                            <FormControlLabel>
                                <FormControlLabelText color="$textLight900" $dark-color="$textDark50">Barcode (Optional)</FormControlLabelText>
                            </FormControlLabel>
                            <Controller
                                control={control}
                                name="barcode"
                                render={({ field: { onChange, value } }) => (
                                    <HStack space="md">
                                        <Input variant="outline" flex={1}>
                                            <InputField placeholder="Barcode number" value={value} onChangeText={onChange} color="$textLight900" $dark-color="$textDark50" />
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
                            <ButtonText>Save Changes</ButtonText>
                        </Button>
                    </VStack>
                </ScrollView>
            </Box>
        </KeyboardAvoidingView>
    );
}
