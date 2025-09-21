import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from './contexts/ThemeContext';
import useThemedNavigation from './hooks/useThemedNavigation';
import { useFonts, Lora_400Regular, Lora_700Bold } from '@expo-google-fonts/lora';
import { AuthProvider } from "@/lib/AuthProvider"; 

NativeWindStyleSheet.setOutput({
  default: 'native',
});

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();
  
  return (
    <AuthProvider>
      <ThemedStatusBar />
      <Stack>
        {/* El grupo para usuarios no autenticados */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Los grupos para cada tipo de usuario autenticado */}
        <Stack.Screen name="(usuarios)" options={{ headerShown: false }} />
        <Stack.Screen name="(vendedores)" options={{ headerShown: false }} />
        <Stack.Screen name="(deliverys)" options={{ headerShown: false }} />

        {/* Tus otras pantallas globales, como los modales */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

    </AuthProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular: Lora_400Regular,
    Lora_700Bold: Lora_700Bold,
  });
  return (

        <ThemeProvider>
            <ThemedLayout />
        </ThemeProvider>

  );
}
