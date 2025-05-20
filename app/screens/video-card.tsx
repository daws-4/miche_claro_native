import { View, ScrollView } from 'react-native';
import Header from '@/components/Header';
import React from 'react';
import VideoCard from '@/components/VideoCard';

export default function VideoCardScreen() {
    return (
        <>
            <Header showBackButton title="" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                className='p-6 pt-[140px] bg-light-primary dark:bg-dark-primary'
            >
                <View className="space-y-6">
                    <VideoCard
                        videoUrl="https://videos.pexels.com/video-files/9669111/9669111-sd_360_640_25fps.mp4"
                        title="Happy Friday"
                        description="Explore the wonders of nature"
                        duration="2:45"
                    />
                    <VideoCard
                        videoUrl="https://videos.pexels.com/video-files/10994873/10994873-sd_360_640_25fps.mp4"
                        title="Happy Gradient"
                        description="Animated colors"
                        duration="10:00"
                    />



                </View>
            </ScrollView>
        </>
    );
}





