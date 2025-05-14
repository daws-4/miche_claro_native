import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from './contexts/ThemeContext';
import useThemedNavigation from './hooks/useThemedNavigation';


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
  return (

        <ThemeProvider>
            <ThemedLayout />
        </ThemeProvider>

  );
}
