import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, Pressable, Image, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';
import useThemeColors from '@/app/contexts/ThemeColors';

import React, { useState, useRef, useEffect } from 'react';

interface JournalCardProps {
    title: string;
    imageUrl: string;
    description: string;
    date?: string;
}

export default function JournalCard({ title, imageUrl, description, date = 'Wednesday, Feb 5' }: JournalCardProps) {
    const insets = useSafeAreaInsets();
    const [isExpanded, setIsExpanded] = useState(false);
    const colors = useThemeColors();
    // Animated values - height for image, opacity for content, scale for image
    const imageHeightAnim = useRef(new Animated.Value(0)).current;
    const contentOpacityAnim = useRef(new Animated.Value(0)).current;
    const imageScaleAnim = useRef(new Animated.Value(1.3)).current;

    const handlePress = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(imageHeightAnim, {
                toValue: isExpanded ? 250 : 0,
                duration: 400,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1), // subtle easing
                useNativeDriver: false,
            }),
            Animated.timing(contentOpacityAnim, {
                toValue: isExpanded ? 1 : 0,
                duration: 500,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1), // subtle easing
                useNativeDriver: true,
            }),
            Animated.timing(imageScaleAnim, {
                toValue: isExpanded ? 1 : 1,
                duration: 500,
                //easing: Easing.bezier(0.25, 0.1, 0.25, 1), // subtle easing
                useNativeDriver: true,
            })
        ]).start();
    }, [isExpanded, imageHeightAnim, contentOpacityAnim, imageScaleAnim]);

    return (
        <>
            <Pressable
                onPress={handlePress}
                style={{
                    //elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.07,
                    shadowRadius: 6.84,
                    borderRadius: 30,
                    //paddingBottom: 100
                }}
                className=' bg-light-secondary dark:bg-black overflow-hidden mb-global' >
                <Animated.View
                    style={{ height: imageHeightAnim, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                    className='w-full overflow-hidden'>
                    <Animated.View
                        style={{
                            //opacity: contentOpacityAnim,
                            transform: [{ scale: imageScaleAnim }]
                        }}
                        className='w-full h-full items-start justify-start'>
                        <Image source={{ uri: imageUrl }} className='w-full h-full' />
                    </Animated.View>
                </Animated.View>
                <View className='p-6'>
                    <Text className='text-sm text-neutral-400 dark:text-neutral-400 mb-0.5'>{date}</Text>
                    <Text className='text-xl font-lora dark:text-white'>{title}</Text>
                    <Animated.View
                        style={{ opacity: contentOpacityAnim }}
                        className="w-full py-2  overflow-hidden">
                        <Text className='text-base text-neutral-500 dark:text-neutral-400'>{description}</Text>
                        <View className="w-full justify-end flex-row ml-auto mt-4    ">
                            <Feather name='share-2' size={20} color={colors.icon} />
                        </View>
                    </Animated.View>
                </View>

            </Pressable>
        </>
    );
}