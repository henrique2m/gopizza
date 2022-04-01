import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
} from "@env";

import { Alert } from "react-native";

type User = {
  id: string;
  name: string;
  isAdmin: boolean;
};

type AuthContextData = {
  signIn: (email: string, password: string) => Promise<void>;
  isLogging: boolean;
  logoff: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  user: User | null;
};

type AuthProviderProps = {
  children: ReactNode;
};

const USER_COLLECTION = "@gopizza:user";

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth();

const db = getFirestore(firebaseApp);

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  async function getUser(uid: string) {
    const refUser = doc(db, "users", uid);

    const user = await getDoc(refUser);

    const { name, isAdmin } = user.data() as User;

    if (!user.exists()) return;

    const userData = {
      id: uid,
      name,
      isAdmin,
    };

    await AsyncStorage.setItem(USER_COLLECTION, JSON.stringify(userData));

    setUser(userData);
  }

  async function signIn(email: string, password: string) {
    if (!email || !password) {
      return Alert.alert("Login", "Informe e-mail e a senha");
    }

    setIsLogging(true);

    try {
      const account = await signInWithEmailAndPassword(auth, email, password);

      const { user } = account;

      getUser(user.uid);

      setIsLogging(false);
    } catch (error: any) {
      const { code } = error;

      setIsLogging(false);

      if (code === "auth/invalid-email" || code === "auth/wrong-password") {
        return Alert.alert("Login", "E-mail e/ou senha inválida.");
      }

      return Alert.alert("Login", "Não foi possível realizar o login.");
    }
  }

  async function loadUserStorageData() {
    setIsLogging(true);

    const storedUser = await AsyncStorage.getItem(USER_COLLECTION);

    if (storedUser) {
      const userData = JSON.parse(storedUser) as User;

      setUser(userData);
    }

    setIsLogging(false);
  }

  async function logoff() {
    await signOut(auth);
    await AsyncStorage.removeItem(USER_COLLECTION);
    setUser(null);
  }

  async function forgotPassword(email: string) {
    if (email) {
      return Alert.alert(
        "Redefinir senha",
        "Enviamos um link no seu e-mail, para redefinir sua senha."
      );
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      Alert.alert(
        "Redefinir senha",
        "Não foi possível enviar um email para redefinir sua senha."
      );
    }
  }

  useEffect(() => {
    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider
      value={{ signIn, logoff, isLogging, forgotPassword, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
