import { createUserWithEmailAndPassword, updateProfile ,signInWithEmailAndPassword, signOut, updateEmail, updatePassword, sendPasswordResetEmail} from "firebase/auth"
import { auth, db  } from "../service/firebase.config"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const registerUser = async (name: string , email: string, password: string) => {
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(userCredentials.user, {
        displayName: name
    })
    await setDoc(
        doc(db, "users", userCredentials.user.uid),{
            name,
            role: "user",
            email,
            createdAt: new Date(),
        }
    );
    return userCredentials.user;
}

export const loginUser = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
}

export const logoutUser = async () => {
    await signOut(auth);
    AsyncStorage.clear();
    return;
}

/**
 * Update user profile (display name and Firestore data)
 */
export const updateUserProfile = async (userId: string, updates: {
    displayName?: string;
    email?: string;
}) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");

    // Update Firebase Auth display name
    if (updates.displayName && updates.displayName !== user.displayName) {
        await updateProfile(user, {
            displayName: updates.displayName
        });
    }

    // Update Firestore user document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
        ...(updates.displayName && { name: updates.displayName }),
        ...(updates.email && { email: updates.email }),
        updatedAt: new Date()
    });
}

/**
 * Update user email (requires recent authentication)
 */
export const updateUserEmail = async (newEmail: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");
    
    await updateEmail(user, newEmail);
    
    // Update in Firestore too
    await updateDoc(doc(db, "users", user.uid), {
        email: newEmail,
        updatedAt: new Date()
    });
}

/**
 * Update user password (requires recent authentication)
 */
export const updateUserPassword = async (newPassword: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");
    
    await updatePassword(user, newPassword);
}

/**
 * Get user data from Firestore
 */
export const getUserData = async (userId: string) => {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
        return userDoc.data();
    }
    return null;
}

export const resetPassword = async (email: string) => {
    try {
        // Use the 'auth' instance imported from your config
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (error: any) {
        // Firebase error codes (e.g., 'auth/user-not-found') 
        // will be caught by your Login screen's try-catch
        throw error;
    }
}