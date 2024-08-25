import { collection, doc, getDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Adjust the import path based on your project structure

// Define interfaces
interface AccountStats {
  answerState: number;
  hintLevel: number;
  lastCorrect: string | null;
  score: number;
  streak: number;
  timezone: string;
}

/**
 * Gets a reference to the account_stats document.
 * @param {string} documentId - The ID of the document to reference.
 * @returns {DocumentReference} - A reference to the Firestore document.
 */
const getDocumentRef = (documentId: string) => {
  return doc(db, 'account_stats', documentId);
};

/**
 * Retrieves the account_stats document data.
 * @param {string} documentId - The ID of the document to retrieve.
 * @returns {Promise<Object>} - A promise that resolves with the document data.
 */
export const getAccountStats = async (documentId: string) => {
  try {
    const docRef = getDocumentRef(documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('Document does not exist');
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Creates a new account_stats document with initial data.
 * @param {Object} initialData - The initial data to set in the document.
 * @returns {Promise<string>} - A promise that resolves with the document ID of the created document.
 */
export const createAccountStats = async (initialData: AccountStats) => {
  try {
    // Create a new document with auto-generated ID
    const docRef = await addDoc(collection(db, 'account_stats'), initialData);
    return docRef.id; // Return the document ID
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

/**
 * Updates an existing account_stats document.
 * @param {string} documentId - The ID of the document to update.
 * @param {Object} updates - The fields to update in the document.
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
export const updateAccountStats = async (documentId: string, updates: Partial<AccountStats>) => {
  try {
    const docRef = getDocumentRef(documentId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};
