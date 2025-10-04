import axios from 'axios';

export type LoginPayload = {
  email: string;
  password: string;
};

export type SocialProfile = {
  provider: 'google';
  providerId: string; // google sub
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  idToken?: string | null;
  accessToken?: string | null;
};

const API_BASE = process.env.API_BASE || 'https://api.example.com';


export async function loginWithEmail(payload: LoginPayload) {
  const res = await axios.post(`${API_BASE}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function socialRegisterOrLogin(profile: SocialProfile) {
  const res = await axios.post(`${API_BASE}/auth/social`, profile, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

export async function sendForgotPassword(email: string) {
  const res = await axios.post(
    `${API_BASE}/auth/forgot-password`,
    { email },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.data;
}
