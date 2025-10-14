import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/AuthProvider';
import { useApiClient } from '@/lib/api';
import { EyeOpenIcon, EyeOffIcon } from '@/components/icons';

export default function RegisterUsuarioScreen() {
    const router = useRouter();
    const auth = useAuth();
    const api = useApiClient();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [cedula, setCedula] = useState('');
    // Default: 18 años antes de hoy
    function getDefaultBirthDate() {
        const today = new Date();
        today.setFullYear(today.getFullYear() - 18);
        return today.toISOString().split('T')[0];
    }
    const [fechaNacimiento, setFechaNacimiento] = useState(getDefaultBirthDate());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const width = Dimensions.get('window').width;

    function validateStep1() {
        if (!nombre.trim()) return 'Introduce tu nombre';
        if (!cedula.trim()) return 'Introduce tu cédula';
        if (!/^[0-9]+$/.test(cedula.trim())) return 'La cédula solo puede contener números';
        if (!fechaNacimiento) return 'Introduce tu fecha de nacimiento';
        const birth = new Date(fechaNacimiento);
        if (isNaN(birth.getTime())) return 'La fecha de nacimiento no tiene un formato válido';
        return null;
    }

    function validateStep2() {
        if (!telefono.trim()) return 'Introduce tu teléfono';
        if (!email.trim()) return 'Introduce un correo válido';
        if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return null;
    }

    const onNext = () => {
        const err = validateStep1();
        if (err) return Alert.alert('Error', err);
        setStep(1);
        // scroll to next section
        scrollRef.current?.scrollTo({ x: width, animated: true });
    };

    const onPrev = () => {
        setStep(0);
        scrollRef.current?.scrollTo({ x: 0, animated: true });
    };

    const onSubmit = async () => {
        const err = validateStep2();
        if (err) return Alert.alert('Error', err);
        setLoading(true);
        try {
            // compute is18 from fechaNacimiento
            const birth = fechaNacimiento ? new Date(fechaNacimiento) : null;


            const payload = {
                nombre: nombre.trim(),
                apellido: apellido.trim() || undefined,
                cedula: cedula.trim(),
                telefono: telefono.trim() || undefined,
                fecha_nacimiento: fechaNacimiento ? new Date(fechaNacimiento).toISOString() : undefined,
                email: email.trim().toLowerCase(),
                password,
            } as any;

            const data = await api.registerUser(payload);
            if (data?.token) {
                await auth.signIn(data.token, data.userType || 'comprador');
            } else {
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
        <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
        >
            {/* Sección 1: Datos personales */}
            <View style={{ width, flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={{ maxWidth: 600, width: '100%' }}>
                    <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 12 }}>Datos personales</Text>
                    <Text style={{ marginBottom: 6 }}>Nombre *</Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        placeholder="Nombre"
                        className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                        style={{ height: 56, marginBottom: 16 }}
                    />
                    <Text style={{ marginBottom: 6 }}>Apellido</Text>
                    <TextInput
                        value={apellido}
                        onChangeText={setApellido}
                        placeholder="Apellido"
                        className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                        style={{ height: 56, marginBottom: 16 }}
                    />
                    <Text style={{ marginBottom: 6 }}>Cédula *</Text>
                    <TextInput
                        value={cedula}
                        onChangeText={text => setCedula(text.replace(/[^0-9]/g, ''))}
                        placeholder="Cédula"
                        keyboardType="numeric"
                        className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                        style={{ height: 56, marginBottom: 16 }}
                        maxLength={15}
                    />
                    <Text style={{ marginBottom: 6 }}>Fecha de nacimiento *</Text>
                    {Platform.OS === 'web'
                        ? (
                            <input
                                type="date"
                                value={fechaNacimiento}
                                onChange={e => setFechaNacimiento(e.target.value)}
                                className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                                style={{ height: 56, marginBottom: 16, width: '100%' }}
                                max={getDefaultBirthDate()}
                            />
                        )
                        : (
                            <Pressable onPress={() => setShowDatePicker(true)} className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg" style={{ height: 56, marginBottom: 16, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 18 }}>{fechaNacimiento ? new Date(fechaNacimiento).toLocaleDateString() : 'Selecciona tu fecha de nacimiento'}</Text>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={fechaNacimiento ? new Date(fechaNacimiento) : new Date(getDefaultBirthDate())}
                                        mode="date"
                                        display="default"
                                        maximumDate={new Date()}
                                        onChange={(
                                            event: any,
                                            selectedDate?: Date | undefined
                                        ) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                setFechaNacimiento(selectedDate.toISOString().split('T')[0]);
                                            }
                                        }}
                                    />
                                )}
                            </Pressable>
                        )}
                    <Pressable onPress={onNext} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 10, marginTop: 16 }}>
                        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Siguiente</Text>
                    </Pressable>
                </View>
            </View>
            {/* Sección 2: Datos de contacto y acceso */}
            <View style={{ width, flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <View style={{ maxWidth: 600, width: '100%' }}>
                    <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 12 }}>Datos de contacto y acceso</Text>
                    <Text style={{ marginBottom: 6 }}>Teléfono *</Text>
                    <TextInput
                        value={telefono}
                        onChangeText={setTelefono}
                        placeholder="Teléfono"
                        keyboardType="phone-pad"
                        className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                        style={{ height: 56, marginBottom: 16 }}
                    />
                    <Text style={{ marginBottom: 6 }}>Correo electrónico *</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="correo@ejemplo.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                        style={{ height: 56, marginBottom: 16 }}
                    />
                    <Text style={{ marginBottom: 6 }}>Contraseña *</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, marginBottom: 16, height: 56 }}>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Contraseña"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            className="px-5 py-4 rounded-xl bg-white dark:bg-dark-secondary text-lg"
                            style={{ flex: 1, height: 56 }}
                        />
                        <Pressable className='pr-6' onPress={() => setShowPassword(v => !v)} style={{ padding: 8 }}>
                            {showPassword
                                ? <EyeOpenIcon  style={{ fontSize: 20 }} />
                                : <EyeOffIcon  style={{ fontSize: 20 }} />}
                            {/* Ejemplo: <EyeOpenIcon /> o <EyeClosedIcon /> */}
                        </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Pressable onPress={onPrev} style={{ backgroundColor: '#374151', padding: 14, borderRadius: 10, flex: 1, marginRight: 8 }}>
                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Atrás</Text>
                        </Pressable>
                        <Pressable onPress={onSubmit} style={{ backgroundColor: '#2563eb', padding: 14, borderRadius: 10, flex: 1, marginLeft: 8 }} disabled={loading}>
                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
                        </Pressable>
                    </View>
                    <Pressable onPress={() => router.replace('/login')} className="mt-12">
                        <Text className='text-xl text-black text-center justify-center'>¿Ya tienes cuenta? <Text className='text-blue-500 font-semibold underline'>Inicia sesión</Text></Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    );
}