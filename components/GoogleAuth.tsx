import { Dimensions, Pressable, View, Text } from "react-native";
import React, { useState, useEffect } from "react";

import * as SecureStore from 'expo-secure-store';
import {
    GoogleAuthProvider,
    getAuth,
    signInWithCredential,
    onAuthStateChanged,
    signOut,
} from "@react-native-firebase/auth";

import {
    GoogleSignin,
    GoogleSigninButton,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
    webClientId:
        "650817826399-u3o28atpe9sr83p94c391bnup59eoksm.apps.googleusercontent.com",
});

// Top-level reusable helper to sign out and cleanup native + secure store
export const signOutGoogle = async () => {
    try {
        try { await GoogleSignin.revokeAccess(); } catch (e) { /* ignore */ }
        try { await GoogleSignin.signOut(); } catch (e) { /* ignore */ }
        try { await signOut(getAuth()); } catch (e) { /* ignore */ }
        try {
            await SecureStore.deleteItemAsync('user_email');
            await SecureStore.deleteItemAsync('user_name');
            await SecureStore.deleteItemAsync('user_picture');
            await SecureStore.deleteItemAsync('user_id');
        } catch (e) { /* ignore */ }
    } catch (e) {
        console.warn('signOutGoogle error', e);
    }
};

const GoogleAuthe: React.FC<{ defaultUserType?: 'comprador' | 'vendedor' | 'delivery'; disabled?: boolean }> = ({ defaultUserType = 'comprador', disabled = false }) => {
    const [initializing, setInitializing] = useState(true);

    const [user, setUser] = useState<any>(null);

    // Handle user state changes
    function handleAuthStateChanged(user: any) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    async function signIn() {
        let idToken: string | undefined | null = null;

        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const signInResult: any = await GoogleSignin.signIn();

        // Try the new style of google-sign in result, from v13+ of that module
        idToken = signInResult?.data?.idToken || signInResult?.idToken || null;
        if (!idToken) {
            throw new Error("No ID token found");
        }

        // Create a Google credential with the token
        const googleCredential = GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        const result = await signInWithCredential(getAuth(), googleCredential);

        try {
            // Try to obtain profile from Firebase user and persist basic profile in SecureStore
            const GoogleUser = result.user;
            if (GoogleUser) {
                // Optionally get ID token (returned to caller if needed)
                const idToken = await GoogleUser.getIdToken();

                // Persist additional profile fields in SecureStore
                try {
                    if (GoogleUser.email) await SecureStore.setItemAsync('user_email', GoogleUser.email);
                    if (GoogleUser.displayName) await SecureStore.setItemAsync('user_name', GoogleUser.displayName);
                    if (GoogleUser.photoURL) await SecureStore.setItemAsync('user_picture', GoogleUser.photoURL);
                    if (GoogleUser.uid) await SecureStore.setItemAsync('user_id', GoogleUser.uid);
                } catch (e) {
                    console.warn('Could not save profile to SecureStore', e);
                }
                // Return idToken so caller can use it to sign in to backend if desired
                return { result, idToken };
            }
        } catch (e) {
            // ignore persistence errors, but log
            console.warn('Could not persist session to AuthProvider', e);
        }

        return result;
    }

    const logout = async () => {
        try {
            await signOutGoogle();
        } catch (e) {
            console.warn('logout helper failed', e);
        }
        console.log('User signed out and access revoked');
    };

    // (signOutGoogle is a top-level helper)



    return (
        <View
        >
            <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={async () => {
                    if (disabled) return;
                    const user = await signIn();
                    console.log(user, "user");
                    // initiate sign in
                }}
                disabled={disabled}
            />

            {user && <Text>{user.email}</Text>}
            {user && <Text>{user.uid}</Text>}

            {user && (
                <Pressable
                    onPress={logout}
                >
                    <Text>Sign out</Text>
                </Pressable>
            )}
        </View>
    );
};

export default GoogleAuthe;
