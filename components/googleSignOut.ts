import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signOut as firebaseSignOut, getAuth } from '@react-native-firebase/auth';

export default async function signOutGoogle() {
  try {
    try {
      await GoogleSignin.revokeAccess();
    } catch (e) {}
    try {
      await GoogleSignin.signOut();
    } catch (e) {}
    try {
      await firebaseSignOut(getAuth());
    } catch (e) {}
    try {
      await SecureStore.deleteItemAsync('user_email');
      await SecureStore.deleteItemAsync('user_name');
      await SecureStore.deleteItemAsync('user_picture');
      await SecureStore.deleteItemAsync('user_id');
    } catch (e) {}
  } catch (e) {
    console.warn('signOutGoogle helper error', e);
  }
}
