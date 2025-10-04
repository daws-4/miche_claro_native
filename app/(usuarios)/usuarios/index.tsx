import { Text, View, Pressable } from 'react-native';
import { useAuth } from '@/lib/AuthProvider';
import signOutGoogle from '@/components/googleSignOut';

export default function UserHomeScreen() {
    const auth = useAuth();



    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Pantalla de Inicio de Usuarios</Text>
            <Pressable className='mt-4 bg-red-700' onPress={async () => {
                try {
                    await signOutGoogle();
                } finally {
                    await auth.signOut();
                }
            }}>
                <Text>Sign out</Text>
            </Pressable>
        </View>
    );
}