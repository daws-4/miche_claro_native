import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/AuthProvider';
import { useApiClient } from '@/lib/api';

export default function RegisterUsuarioScreen() {
    const router = useRouter();
    const auth = useAuth();
    const api = useApiClient();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [cedula, setCedula] = useState('');
    const [telefono, setTelefono] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    function validate() {
        if (!nombre.trim()) return 'Introduce tu nombre';
        if (!cedula.trim()) return 'Introduce tu cédula';
        if (!email.trim()) return 'Introduce un correo válido';
        if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        // validate fechaNacimiento and compute is18
        if (!fechaNacimiento) return 'Introduce tu fecha de nacimiento';
        const birth = new Date(fechaNacimiento);
        if (isNaN(birth.getTime())) return 'La fecha de nacimiento no tiene un formato válido (YYYY-MM-DD)';
        const now = new Date();
        const age = now.getFullYear() - birth.getFullYear() - (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()) ? 1 : 0);
        if (age < 18) return 'Debes ser mayor de 18 años para registrarte';
        return null;
    }

    const onSubmit = async () => {
        const err = validate();
        if (err) return Alert.alert('Error', err);
        setLoading(true);
        try {
            // compute is18 from fechaNacimiento
            const birth = fechaNacimiento ? new Date(fechaNacimiento) : null;
            const is18computed = !!birth && (() => {
                const now = new Date();
                const age = now.getFullYear() - birth.getFullYear() - (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()) ? 1 : 0);
                return age >= 18;
            })();

            const payload = {
                nombre: nombre.trim(),
                apellido: apellido.trim() || undefined,
                cedula: cedula.trim(),
                telefono: telefono.trim() || undefined,
                fecha_nacimiento: fechaNacimiento ? new Date(fechaNacimiento).toISOString() : undefined,
                is18: is18computed,
                email: email.trim().toLowerCase(),
                password,
            } as any;

            const data = await api.registerUser(payload);
            // Backend should ideally return a token and userType
            if (data?.token) {
                await auth.signIn(data.token, data.userType || 'comprador');
            } else {
                // If registration succeeded but no token returned, navigate to login
                Alert.alert('Registro correcto', 'Por favor inicia sesión.');
                router.replace('/login');
            }
        } catch (e: any) {
            console.error('register error', e);
            Alert.alert('Error', e?.message || 'No se pudo registrar el usuario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
            <View style={{ maxWidth: 600, width: '100%', alignSelf: 'center' }}>
                <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 12 }}>Registro de usuario</Text>

                <Text style={{ marginBottom: 6 }}>Nombre *</Text>
                <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 8 }} />

                <Text style={{ marginBottom: 6 }}>Apellido</Text>
                <TextInput value={apellido} onChangeText={setApellido} placeholder="Apellido" style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 8 }} />

                <Text style={{ marginBottom: 6 }}>Cédula *</Text>
                <TextInput value={cedula} onChangeText={setCedula} placeholder="Cédula" keyboardType="default" style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 8 }} />

                <Text style={{ marginBottom: 6 }}>Teléfono</Text>
                <TextInput value={telefono} onChangeText={setTelefono} placeholder="Teléfono" keyboardType="phone-pad" style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 8 }} />

                <Text style={{ marginBottom: 6 }}>Fecha de nacimiento (YYYY-MM-DD)</Text>
                <TextInput value={fechaNacimiento} onChangeText={setFechaNacimiento} placeholder="1990-01-31" style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 8 }} />

                {/* is18 is computed automatically from fecha de nacimiento */}

                <Text style={{ marginBottom: 6 }}>Correo electrónico *</Text>
                <TextInput value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com" keyboardType="email-address" autoCapitalize="none" style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 8 }} />

                <Text style={{ marginBottom: 6 }}>Contraseña *</Text>
                <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry style={{ padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 12 }} />

                <Pressable onPress={onSubmit} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 10 }} disabled={loading}>
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
                </Pressable>

                <Pressable onPress={() => router.replace('/login')} style={{ marginTop: 12 }}>
                    <Text style={{ textAlign: 'center', color: '#374151' }}>¿Ya tienes cuenta? Inicia sesión</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}