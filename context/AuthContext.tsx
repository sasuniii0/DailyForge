import { useLoader } from "@/hooks/use-loader";
import { auth } from "../service/firebase.config";
import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useEffect, useState, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
});

export const AuthProvider = ({children} : {children:ReactNode}) => {
  const { showLoader, hideLoader, isLoading } = useLoader();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    showLoader();
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      hideLoader();
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
