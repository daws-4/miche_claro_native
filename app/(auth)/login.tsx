import React, { useEffect } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

// native signin
import {
    GoogleSignin,
    GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

// web / universal signin
import * as GoogleAuth from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// simple cross-platform component
export default function GoogleLogin() {
    // WEB: expo-auth-session hook
    const [request, response, promptAsync] = GoogleAuth.useAuthRequest({
        clientId: '650817826399-u3o28atpe9sr83p94c391bnup59eoksm.apps.googleusercontent.com',
        androidClientId: '650817826399-p2svjfukgu39id38sidko9i6mnitvjav.apps.googleusercontent.com',
        
    });

    useEffect(() => {
        console.log('response', response);  
        if (response?.type === 'success') {
            const token = response.authentication?.accessToken;
            // fetch user info with token
            // fetch('https://www.googleapis.com/userinfo/v2/me', { headers: { Authorization: `Bearer ${token}` }})
        }
    }, [response]);

    // NATIVE: configure GoogleSignin once (do it on app init)
    if (Platform.OS !== 'web') {
        GoogleSignin.configure({
            webClientId: '650817826399-u3o28atpe9sr83p94c391bnup59eoksm.apps.googleusercontent.com', // for server auth
            offlineAccess: true,
        });
    }

    // UI
    if (Platform.OS === 'web') {
        // web button
        return (
            <View>
                <Pressable onPress={() => promptAsync()}>
                    <Text>Sign in with Google (web)</Text>
                </Pressable>
            </View>
        );
    } else {
        // native button
        return (
            <View>
                <GoogleSigninButton
                    onPress={async () => {
                        try {
                            await GoogleSignin.hasPlayServices();
                            const userInfo = await GoogleSignin.signIn();
                            console.log('native user', userInfo);
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                />
            </View>
        );
    }
}