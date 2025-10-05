// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useSegments, useRouter } from "expo-router";

// Define la forma de nuestro contexto
interface AuthContextType {
    signIn: (token: string, userType: "comprador" | "vendedor" | "delivery") => Promise<void>;
    signOut: () => void;
    session: string | null;
    userType: "comprador" | "vendedor" | "delivery" | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const ApiContext = createContext<string | null>(null);
// const API_BASE_URL = "https://miche-claro.vercel.app/api/mobile/"; 
const API_BASE_URL = "http://192.168.1.105:3000/api/mobile/"; 

// Hook personalizado para acceder fácilmente al contexto
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
}
export function useApi() {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error("useApi debe usarse dentro de un AuthProvider");
    }
    return context;
}

// Hook de ayuda para manejar la lógica de redirección
function useProtectedRoute(
    session: string | null,
    userType: "comprador" | "vendedor" | "delivery" | null,
    isLoading: boolean
) {
    const segments = useSegments();
    const router = useRouter();
    useEffect(() => {
        if (isLoading) return; // Espera a que termine de cargar

        const inAuthGroup = segments[0] === "(auth)";

        if (!session && !inAuthGroup) {
            router.replace("/login");
        } else if (session && inAuthGroup) {
            if (userType === "comprador") {
                router.replace("/usuarios");
            } else if (userType === "vendedor") {
                router.replace("/vendedores");
            } else if (userType === "delivery") {
                router.replace("/deliverys");
            } else {
                router.replace("/usuarios");
            }
        }
    }, [session, userType, segments, router, isLoading]);
}

// El Proveedor
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<string | null>(null);
    const [userType, setUserType] = useState<"comprador" | "vendedor" |  "delivery" | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Al cargar la app, intentar cargar el token desde SecureStore
        const loadSession = async () => {
            try {
                const token = await SecureStore.getItemAsync("session_token");
                const type = await SecureStore.getItemAsync("user_type");
                if (token && (type === "comprador" || type === "vendedor" || type === "delivery")) {
                    setSession(token);
                    setUserType(type);
                }
            } catch (e) {
            } finally {
                setIsLoading(false);
            }
        };
        loadSession();
    }, []);

    useProtectedRoute(session, userType, isLoading);

    const authActions = {
        signIn: async (token: string, type: "comprador" | "vendedor" | "delivery"
        ) => {
            // Guardar el token y tipo en SecureStore Y en el estado
            await SecureStore.setItemAsync("session_token", token);
            await SecureStore.setItemAsync("user_type", type);
            setSession(token);
            setUserType(type);
            // El hook useProtectedRoute se encargará de redirigir
        },
        signOut: async () => {
            // Borrar token de SecureStore y estado
            await SecureStore.deleteItemAsync("session_token");
            await SecureStore.deleteItemAsync("user_type");
            setSession(null);
            setUserType(null);
            // El hook useProtectedRoute redirigirá al (auth) group
        },
        session,
        userType,
        isLoading,
    };

    // Renderiza un Splash Screen mientras carga la sesión
    if (isLoading) {
        return <Text>Cargando...</Text>;
    }
    return (
        <AuthContext.Provider value={authActions}>
            <ApiContext.Provider value={API_BASE_URL}>
            {children}
            </ApiContext.Provider>
        </AuthContext.Provider>
    );
}