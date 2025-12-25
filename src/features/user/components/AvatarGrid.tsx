import React from 'react';
import { Box, Pressable, Icon, Heading, Text, Center } from '@gluestack-ui/themed';
import { Home, Cat, Leaf, Coffee, User, Heart, Smile, Star, LucideIcon } from 'lucide-react-native';

export const AVATARS = [
    { id: 'home', icon: Home },
    { id: 'cat', icon: Cat },
    { id: 'leaf', icon: Leaf },
    { id: 'coffee', icon: Coffee },
    { id: 'user', icon: User },
    { id: 'heart', icon: Heart },
    { id: 'smile', icon: Smile },
    { id: 'star', icon: Star },
];

/**
 * Get the avatar icon component by its ID
 * @param avatarId - The ID of the avatar (e.g., 'cat', 'leaf')
 * @returns The Lucide icon component, or User as default
 */
export function getAvatarIcon(avatarId: string | undefined): LucideIcon {
    const avatar = AVATARS.find(a => a.id === avatarId);
    return avatar?.icon || User;
}

interface AvatarGridProps {
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export const AvatarGrid: React.FC<AvatarGridProps> = ({ selectedId, onSelect }) => {
    return (
        <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" gap="$4" w="$full">
            {AVATARS.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                    <Pressable
                        key={item.id}
                        onPress={() => onSelect(item.id)}
                        p="$4"
                        borderRadius="$lg"
                        bg={isSelected ? '#E8F4F0' : '$white'}
                        borderWidth={2}
                        borderColor={isSelected ? '#6B9080' : '$coolGray200'}
                        $dark-bgColor={isSelected ? '$backgroundDark950' : '$backgroundDark900'}
                    >
                        <Icon
                            as={item.icon}
                            size="xl"
                            color={isSelected ? '#6B9080' : '$coolGray400'}
                        />
                    </Pressable>
                );
            })}
        </Box>
    );
};

