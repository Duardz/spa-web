import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import type { User } from '$lib/types';

const googleProvider = new GoogleAuthProvider();

// Configure Google provider to always show account picker
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      // Create new user document
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined,
        role: 'student' // Default role
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      return userData;
    }
    
    return userDoc.data() as User;
  } catch (error: any) {
    // Handle specific auth errors
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('Sign-in cancelled by user');
      return null;
    }
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Get current user data from Firestore
export async function getCurrentUserData(uid: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Check if user is admin
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const userData = await getCurrentUserData(uid);
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Auth state observer
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const userData = await getCurrentUserData(firebaseUser.uid);
      callback(userData);
    } else {
      callback(null);
    }
  });
}