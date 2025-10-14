import React from 'react';
import axios from 'axios';
import { useApi as useApiBase } from './AuthProvider';

export type LoginPayload = {
  email: string;
  password: string;
};

export type SocialProfile = {
  provider: 'google';
  providerId: string | null; // google sub
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  idToken?: string | null;
  accessToken?: string | null;
};

export type RegisterPayload = {
  nombre: string;
  apellido?: string;
  cedula: string;
  telefono?: string;
  fecha_nacimiento?: string; // ISO date string
  is18: boolean;
  email: string;
  password: string;
  image?: string | null;
  googleId?: string | null;
};

function createApi(baseUrl: string) {
  const instance = axios.create({
    baseURL: baseUrl,
    headers: { 'Content-Type': 'application/json' },
  });

  return {
    async loginWithEmail(payload: LoginPayload) {
      const res = await instance.post('/auth/loginuser', payload);
      return res.data;
    },

    async socialRegisterOrLogin(profile: SocialProfile) {
      const res = await instance.post('/auth/social', profile);
      return res.data;
    },

    async sendForgotPassword(email: string) {
      const res = await instance.post('/auth/forgot-password', { email });
      return res.data;
    },

    // Register a new usuario (matches the Mongoose schema provided)
    async registerUser(payload: RegisterPayload) {
      const res = await instance.post('/auth/registeruser', payload);
      return res.data;
    },
  };
}

// Hook that components can use to get the API methods (reads base URL from AuthProvider ApiContext)
export function useApiClient() {
  const base = useApiBase();
  if (!base)
    throw new Error('API base URL not available (useApiClient must be used inside AuthProvider)');
  // memoize so callers get stable identity
  return React.useMemo(() => createApi(base), [base]);
}
