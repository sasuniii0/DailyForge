// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { auth } from '../service/firebase.config'; 
// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// GoogleSignin.configure({
//   webClientId: 'YOUR_WEB_CLIENT_ID_FROM_FIREBASE_CONSOLE.apps.googleusercontent.com',
// });

// export const signInWithGoogle = async () => {
//   try {
//     await GoogleSignin.hasPlayServices();
//     const { data } = await GoogleSignin.signIn();
    
//     // Create a Firebase credential with the token
//     const googleCredential = GoogleAuthProvider.credential(data.idToken);
    
//     // Sign-in to Firebase with the credential
//     return signInWithCredential(auth, googleCredential);
//   } catch (error) {
//     console.error("Forge authentication failed:", error);
//   }
// };