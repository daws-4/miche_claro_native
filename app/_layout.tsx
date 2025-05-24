import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from './contexts/ThemeContext';
import useThemedNavigation from './hooks/useThemedNavigation';
import { useFonts, Lora_400Regular, Lora_700Bold } from '@expo-google-fonts/lora';


NativeWindStyleSheet.setOutput({
  default: 'native',
});

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();
  
  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={screenOptions} />

    </>
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
