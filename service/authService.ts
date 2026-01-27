import { createUserWithEmailAndPassword, updateProfile ,signInWithEmailAndPassword, signOut} from "firebase/auth"
import { auth, db  } from "../service/firebase.config"
import { doc, setDoc } from "firebase/firestore"
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