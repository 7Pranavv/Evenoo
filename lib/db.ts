import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export { serverTimestamp };

export const getDocument = async <T>(collectionName: string, id: string): Promise<T | null> => {
  const ref = doc(db, collectionName, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
};

export const getCollection = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  const ref = collection(db, collectionName);
  const q = constraints.length > 0 ? query(ref, ...constraints) : query(ref);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
};

export const createDocument = async <T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>
): Promise<string> => {
  const ref = collection(db, collectionName);
  const docRef = await addDoc(ref, { ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  return docRef.id;
};

export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  id: string,
  data: WithFieldValue<T>
): Promise<void> => {
  const ref = doc(db, collectionName, id);
  await setDoc(ref, { ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
};

export const updateDocument = async (
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> => {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, { ...data, updated_at: new Date().toISOString() });
};

export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
};

export { where, orderBy, limit, collection, doc, query, getDocs, getDoc, updateDoc, deleteDoc };
