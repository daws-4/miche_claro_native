import { View, Pressable, Text } from "react-native";
import { useState } from "react";
import { useVideoPlayer, VideoView } from 'expo-video';
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import Feather from '@expo/vector-icons/Feather';
import { BlurView } from "expo-blur";

interface VideoCardProps {
  videoUrl: string;
  title: string;
  description: string;
  duration: string;
  onPress?: () => void;
}

export default function VideoCard({ 
  videoUrl, 
  title, 
  description, 
  duration,
  onPress 
}: VideoCardProps) {
    const [error, setError] = useState<string | null>(null);

    const player = useVideoPlayer(videoUrl, player => {
        player.loop = true;
        player.play();
    });

    return (
        <Pressable
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.2,
                shadowRadius: 3.84,
                elevation: 5,
            }}
            className="rounded-2xl mb-4"
            onPress={onPress}
        >
            <View
                style={{
                    height: 220,
                }}
                className="w-full h-full bg-white dark:bg-neutral-800 rounded-2xl relative overflow-hidden"
            >
                <LinearGradient className="w-full flex justify-between h-full z-30 p-5" colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)']}>
                    <View className="flex-row justify-end">
                        <Text className="text-white text-sm opacity-70 bg-black/40 px-2 py-1 rounded-full">{duration}</Text>
                    </View>
                    <View className="flex flex-row justify-between items-center">
                        <View>
                            <Text className="text-white text-xl font-bold">{title}</Text>
                            <Text className="text-white text-sm opacity-90">{description}</Text>
                        </View>
                        <BlurView intensity={20} tint="dark" className="rounded-full p-3 bg-black/50 overflow-hidden">
                            <Feather name="play" size={20} color="white" />
                        </BlurView>
                    </View>
                </LinearGradient>
                {error ? (
                    <View className="absolute top-0 left-0 w-full h-full items-center justify-center z-20">
                        <View className="p-4 bg-red-500/10 rounded-lg">
                            <Text className="text-red-500">{error}</Text>
                        </View>
                    </View>
                ) : (
                    <VideoView
                        className="absolute top-0 left-0 scale-150 z-20"
                        player={player}
                        style={{ width: '100%', height: 500, top: -200, translateY: -20 }}
                        allowsFullscreen
                    />
                )}
            </View>
        </Pressable>
    );
}
