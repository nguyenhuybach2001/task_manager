import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './config';

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDocument(result.user);
  return result.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

/**
 * Register with email and password
 */
export async function registerWithEmail(email, password, displayName) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await ensureUserDocument(result.user, displayName);
  return result.user;
}

/**
 * Sign out
 */
export async function signOut() {
  await firebaseSignOut(auth);
}

/**
 * Ensure user document exists in Firestore
 */
async function ensureUserDocument(user, displayName) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      displayName: displayName || user.displayName || 'User',
      email: user.email,
      photoURL: user.photoURL || null,
      settings: {
        defaultNotifyBeforeDeadline: 2,
        defaultNotifyBeforeStart: 1,
        defaultRemindTime: '09:00',
        theme: 'vintage-light',
      },
      createdAt: serverTimestamp(),
    });
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
