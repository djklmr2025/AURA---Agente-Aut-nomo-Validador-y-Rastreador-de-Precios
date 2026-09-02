import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  handleFirestoreError,
  OperationType 
} from "../lib/firebase";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  deleteDoc 
} from "firebase/firestore";
import { ProductScanResult, PriceAlert, VerifiedPurchase, DaemonConsent } from "../types";

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  selectedRegion?: string;
  voiceEnabled?: boolean;
  daemonConsent?: DaemonConsent;
  createdAt: string;
  updatedAt?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  isSyncing: boolean;
  verifiedPurchases: VerifiedPurchase[];
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveProductToCloud: (product: ProductScanResult) => Promise<void>;
  deleteProductFromCloud: (productId: string) => Promise<void>;
  savePriceAlertToCloud: (alert: PriceAlert) => Promise<void>;
  deletePriceAlertFromCloud: (alertId: string) => Promise<void>;
  saveVerifiedPurchaseToCloud: (purchase: VerifiedPurchase) => Promise<void>;
  deleteVerifiedPurchaseFromCloud: (purchaseId: string) => Promise<void>;
  signDaemonConsent: () => Promise<DaemonConsent>;
  updateUserPreferences: (prefs: { selectedRegion?: string; voiceEnabled?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  onCloudProductsLoaded?: (products: ProductScanResult[]) => void;
  onCloudAlertsLoaded?: (alerts: PriceAlert[]) => void;
  onCloudPurchasesLoaded?: (purchases: VerifiedPurchase[]) => void;
}> = ({ children, onCloudProductsLoaded, onCloudAlertsLoaded, onCloudPurchasesLoaded }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [verifiedPurchases, setVerifiedPurchases] = useState<VerifiedPurchase[]>([]);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Monitor Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch or create user profile doc in Firestore
        const userDocRef = doc(db, "users", user.uid);
        try {
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              userId: user.uid,
              email: user.email || "",
              displayName: user.displayName || "Usuario",
              photoURL: user.photoURL || undefined,
              selectedRegion: "GLOBAL",
              voiceEnabled: true,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn("Could not sync user profile with Firestore:", err);
        }
      } else {
        setUserProfile(null);
        setVerifiedPurchases([]);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Listen to user's products in Firestore when signed in
  useEffect(() => {
    if (!currentUser) return;

    const productsCollection = collection(db, "users", currentUser.uid, "products");
    const unsubscribe = onSnapshot(
      productsCollection,
      (snapshot) => {
        const cloudProducts: ProductScanResult[] = [];
        snapshot.forEach((doc) => {
          cloudProducts.push(doc.data() as ProductScanResult);
        });
        cloudProducts.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        if (onCloudProductsLoaded && cloudProducts.length > 0) {
          onCloudProductsLoaded(cloudProducts);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/products`);
      }
    );

    return () => unsubscribe();
  }, [currentUser, onCloudProductsLoaded]);

  // Listen to user's price alerts in Firestore when signed in
  useEffect(() => {
    if (!currentUser) return;

    const alertsCollection = collection(db, "users", currentUser.uid, "priceAlerts");
    const unsubscribe = onSnapshot(
      alertsCollection,
      (snapshot) => {
        const cloudAlerts: PriceAlert[] = [];
        snapshot.forEach((doc) => {
          cloudAlerts.push(doc.data() as PriceAlert);
        });
        cloudAlerts.sort((a, b) => b.createdAt - a.createdAt);
        if (onCloudAlertsLoaded) {
          onCloudAlertsLoaded(cloudAlerts);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/priceAlerts`);
      }
    );

    return () => unsubscribe();
  }, [currentUser, onCloudAlertsLoaded]);

  // Listen to user's verified purchases in Firestore
  useEffect(() => {
    if (!currentUser) return;

    const purchasesCollection = collection(db, "users", currentUser.uid, "verifiedPurchases");
    const unsubscribe = onSnapshot(
      purchasesCollection,
      (snapshot) => {
        const cloudPurchases: VerifiedPurchase[] = [];
        snapshot.forEach((doc) => {
          cloudPurchases.push(doc.data() as VerifiedPurchase);
        });
        cloudPurchases.sort((a, b) => b.verifiedAt - a.verifiedAt);
        setVerifiedPurchases(cloudPurchases);
        if (onCloudPurchasesLoaded) {
          onCloudPurchasesLoaded(cloudPurchases);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${currentUser.uid}/verifiedPurchases`);
      }
    );

    return () => unsubscribe();
  }, [currentUser, onCloudPurchasesLoaded]);

  const signInWithGoogle = async () => {
    try {
      setIsSyncing(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Sign-in error:", err);
      alert(err.message || "No se pudo iniciar sesión con Google");
    } finally {
      setIsSyncing(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const saveProductToCloud = async (product: ProductScanResult) => {
    if (!currentUser) return;
    setIsSyncing(true);
    const path = `users/${currentUser.uid}/products/${product.id}`;
    try {
      const docRef = doc(db, "users", currentUser.uid, "products", product.id);
      await setDoc(docRef, {
        ...product,
        userId: currentUser.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteProductFromCloud = async (productId: string) => {
    if (!currentUser) return;
    setIsSyncing(true);
    const path = `users/${currentUser.uid}/products/${productId}`;
    try {
      const docRef = doc(db, "users", currentUser.uid, "products", productId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const savePriceAlertToCloud = async (alertData: PriceAlert) => {
    if (!currentUser) return;
    setIsSyncing(true);
    const path = `users/${currentUser.uid}/priceAlerts/${alertData.id}`;
    try {
      const docRef = doc(db, "users", currentUser.uid, "priceAlerts", alertData.id);
      await setDoc(docRef, {
        ...alertData,
        userId: currentUser.uid,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const deletePriceAlertFromCloud = async (alertId: string) => {
    if (!currentUser) return;
    setIsSyncing(true);
    const path = `users/${currentUser.uid}/priceAlerts/${alertId}`;
    try {
      const docRef = doc(db, "users", currentUser.uid, "priceAlerts", alertId);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveVerifiedPurchaseToCloud = async (purchase: VerifiedPurchase) => {
    if (!currentUser) return;
    setIsSyncing(true);
    const path = `users/${currentUser.uid}/verifiedPurchases/${purchase.id}`;
    try {
      const docRef = doc(db, "users", currentUser.uid, "verifiedPurchases", purchase.id);
      await setDoc(docRef, {
        ...purchase,
        userId: currentUser.uid,
      });
      setVerifiedPurchases((prev) => [purchase, ...prev.filter((p) => p.id !== purchase.id)]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteVerifiedPurchaseFromCloud = async (purchaseId: string) => {
    if (!currentUser) return;
    setIsSyncing(true);
    const path = `users/${currentUser.uid}/verifiedPurchases/${purchaseId}`;
    try {
      const docRef = doc(db, "users", currentUser.uid, "verifiedPurchases", purchaseId);
      await deleteDoc(docRef);
      setVerifiedPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    } finally {
      setIsSyncing(false);
    }
  };

  const signDaemonConsent = async (): Promise<DaemonConsent> => {
    if (!currentUser) {
      throw new Error("Debe iniciar sesión para firmar el consentimiento de AURA Daemon.");
    }
    const signatureHash = "AURA_SIG_" + Math.random().toString(36).substring(2, 10).toUpperCase() + "_" + Date.now();
    const consent: DaemonConsent = {
      signed: true,
      signerUid: currentUser.uid,
      signerEmail: currentUser.email || "",
      signedAt: new Date().toISOString(),
      consentScope: ["order.query", "fulfillment.verify", "delivery.confirm", "dispute.shield"],
      protocolVersion: "2.4-AURA-DAEMON",
      digitalSignatureHash: signatureHash,
    };

    const userDocRef = doc(db, "users", currentUser.uid);
    await setDoc(
      userDocRef,
      {
        daemonConsent: consent,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    setUserProfile((prev) => (prev ? { ...prev, daemonConsent: consent } : null));
    return consent;
  };

  const updateUserPreferences = async (prefs: { selectedRegion?: string; voiceEnabled?: boolean }) => {
    if (!currentUser) return;
    const path = `users/${currentUser.uid}`;
    try {
      const docRef = doc(db, "users", currentUser.uid);
      await setDoc(
        docRef,
        {
          ...prefs,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setUserProfile((prev) => (prev ? { ...prev, ...prefs } : null));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAuthReady,
        isSyncing,
        verifiedPurchases,
        signInWithGoogle,
        logout,
        saveProductToCloud,
        deleteProductFromCloud,
        savePriceAlertToCloud,
        deletePriceAlertFromCloud,
        saveVerifiedPurchaseToCloud,
        deleteVerifiedPurchaseFromCloud,
        signDaemonConsent,
        updateUserPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
