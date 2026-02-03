import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../service/firebase.config';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: "rgrgergergerger",
    iosClientId: "fwefwefwefwe"
  });

  return { request, response, promptAsync };
};

export const signInWithGoogle = async (idToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error) {
    console.error('Firebase sign-in error:', error);
    throw error;
  }
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};