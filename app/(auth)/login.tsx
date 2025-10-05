import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View, TextInput, Alert, KeyboardAvoidingView, ScrollView, Platform as RNPlatform } from 'react-native';
import { useRouter } from 'expo-router';


import { useAuth } from '@/lib/AuthProvider';
import { useApiClient } from '@/lib/api';
import GoogleAuthe from '@/components/GoogleAuth';

import * as GoogleAuth from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();


export default function LoginScreen() {
    const router = useRouter();
    const auth = useAuth();
    const api = useApiClient();
    console.log('api methods available', Object.keys(api));

    // form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Web google auth
    const [request, response, promptAsync] = GoogleAuth.useAuthRequest({
        clientId: '650817826399-u3o28atpe9sr83p94c391bnup59eoksm.apps.googleusercontent.com',
        androidClientId: '650817826399-p2svjfukgu39id38sidko9i6mnitvjav.apps.googleusercontent.com',
    });

    useEffect(() => {
        async function handleResponse() {
            if (!response) return;
            if (response.type !== 'success') return setError('Google auth cancelled or failed');
            try {
                const idToken = (response as any).params?.id_token || response.authentication?.idToken || null;
                const accessToken = response.authentication?.accessToken || (response as any).params?.access_token || null;

                // Fetch profile if necessary
                let profile: any = null;
                if (!idToken && accessToken) {
                    const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    if (r.ok) profile = await r.json();
                }

                if (!profile && idToken) {
                    try {
                        const base64Url = idToken.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(
                            atob(base64)
                                .split('')
                                .map(function (c) {
                                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                                })
                                .join('')
                        );
                        profile = JSON.parse(jsonPayload);
                    } catch (e) {
                        // ignore
                    }
                }

                const socialProfile = {
                    provider: 'google' as const,
                    providerId: profile?.sub || profile?.id || null,
                    email: profile?.email || null,
                    name: profile?.name || profile?.given_name || null,
                    picture: profile?.picture || null,
                    idToken,
                    accessToken,
                };

                // Call backend to create or login user via social profile
                setLoading(true);
                const data = await api.socialRegisterOrLogin(socialProfile as any);
                // Backend should return a session token and user type
                if (data?.token) {
                    await auth.signIn(data.token, data.userType || 'comprador');
                }
            } catch (err: any) {
                console.error('social login failed', err);
                setError(err?.message || String(err));
            } finally {
                setLoading(false);
            }
        }
        handleResponse();
    }, [response]);

    const onSubmit = async () => {
        setError(null);
        setLoading(true);
        try {
            const data = await api.loginWithEmail({ email, password });
            if (data?.token) {
                await auth.signIn(data.token, data.userType || 'comprador');
            } else {
                setError('Invalid response from server');
            }
        } catch (err: any) {
            console.error('login error', err);
            setError(err?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const onForgot = async () => {
        if (!email) return Alert.alert('Introduce tu correo para recuperar la contraseña');
        try {
            await api.sendForgotPassword(email);
            Alert.alert('Se ha enviado un correo con instrucciones');
        } catch (err: any) {
            Alert.alert('Error', err?.message || 'No se pudo enviar el correo');
        }
    };

    return (
        <View className="flex-1 bg-light-primary dark:bg-dark-primary pt-10 relative">
            <KeyboardAvoidingView behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-1 justify-center px-6 py-8 items-center">
                    <View className="w-full max-w-md">
                        <Text className="text-3xl font-bold text-center mb-6 text-neutral-900 dark:text-neutral-50">Iniciar sesión</Text>

                        <View className="mb-4">
                            <Text className="mb-2 text-sm text-neutral-700 dark:text-neutral-300">Correo electrónico</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="tucorreo@ejemplo.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                                style={{ height: 56 }}
                            />
                        </View>

                        <View className="mb-2">
                            <Text className="mb-2 text-sm text-neutral-700 dark:text-neutral-300">Contraseña</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Contraseña"
                                secureTextEntry
                                className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                                style={{ height: 56 }}
                            />
                        </View>

                        <Pressable onPress={onForgot} className="mb-4 mt-2">
                            <Text className="text-sm text-blue-500">Olvidé mi contraseña</Text>
                        </Pressable>

                        {error && <Text className="text-sm text-red-500 mb-2">{error}</Text>}

                        <Pressable onPress={onSubmit} className="bg-blue-500 py-4 rounded-xl mb-3">
                            <Text className="text-center text-white font-semibold text-lg">Iniciar sesión</Text>
                        </Pressable>

                        <View className="mt-2 space-y-3">
                            <Pressable onPress={() => router.push('/register')} className="py-3 rounded-xl border border-neutral-300">
                                <Text className="text-center text-neutral-800 dark:text-neutral-100 font-medium">Registrarse</Text>
                            </Pressable>

                            <View className="items-center">
                                {Platform.OS === 'web' ? (
                                    <Pressable onPress={() => promptAsync()} className="py-2 px-4 border rounded-lg border-neutral-300">
                                        <Text>Iniciar sesión con Google (web)</Text>
                                    </Pressable>
                                ) : (
                                    <GoogleAuthe defaultUserType="comprador" />
                                )}
                            </View>
                        </View>
                    </View>
                </View>
                {/* Footer buttons near bottom */}
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 20 }} className="px-6">
                    <View className="flex-row justify-between">
                        <Pressable onPress={() => router.push('/vendedores')} className="px-3 py-2 rounded-lg border border-neutral-200 bg-white/60">
                            <Text>Ingresar como vendedor</Text>
                        </Pressable>
                        <Pressable onPress={() => router.push('/deliverys')} className="px-3 py-2 rounded-lg border border-neutral-200 bg-white/60">
                            <Text>Ingresar como delivery</Text>
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}