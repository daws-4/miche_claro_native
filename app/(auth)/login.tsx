import { View, Text, Pressable } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import React, { useEffect } from 'react';

export default function Login() {
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: '650817826399-1qfifp7fmj4tgvgv8ke1qd13t5ugajqu.apps.googleusercontent.com',
        iosClientId: '',
    });

    useEffect(() => {
        if (response?.type === 'success') {
            // Handle successful authentication here (exchange token, fetch profile, etc.)
            console.log('Google auth success:', response);
        }
    }, [response]);

    return (
        <View className="flex-1 justify-center items-center dark:bg-black bg-white">
            <Pressable onPress={() => promptAsync().catch((e) => {
                console.error('error al iniciar sesión con google: ', e);
            })} className="w-52 h-16 bg-red-500 items-center justify-center rounded-lg">
                <Text className='text-center text-xl font-bold text-white'>Iniciar sesión con Google</Text>
            </Pressable>
        </View>
    )
}