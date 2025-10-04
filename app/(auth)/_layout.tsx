import React from 'react';
import { Slot } from 'expo-router';
import { View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

export default function Layout() {
    return (
        <View style={{ flex: 1 }}>
                <ScrollView  contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                    <Slot />
                </ScrollView>
        </View>
    );
}