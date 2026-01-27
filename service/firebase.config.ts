// Import the functions you need from the SDKs you need
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";

// @ts-ignore
import { initializeAuth , getReactNativePersistence} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCN3Axk4rnSQtt0FhbO8JM74jfQMK5jZyU",
  authDomain: "dailyforge-bd123.firebaseapp.com",
  projectId: "dailyforge-bd123",
  storageBucket: "dailyforge-bd123.firebasestorage.app",
  messagingSenderId: "723948857230",
  appId: "1:723948857230:web:e271a392e41a58f58366df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
})

export const db = getFirestore(app);