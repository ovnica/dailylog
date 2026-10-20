import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import { JournalEntry } from '../types/journal';
import { isSampleActivityId, isSampleActivityEntry } from './dateUtils';

const COLLECTION_NAME = 'activities';

/**
 * Subscribes to real-time updates from Firestore.
 * Automatically purges any studio sample / demo entries if detected.
 */
export function subscribeToCloudActivities(
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: JournalEntry[] = [];

      snapshot.forEach((docSnap) => {
        const docId = docSnap.id;
        const data = docSnap.data();
        if (
          isSampleActivityId(docId) ||
          isSampleActivityEntry({ id: docId, title: data?.title })
        ) {
          deleteDoc(docSnap.ref).catch(() => {});
          return;
        }
        if (data && data.title) {
          items.push({
            id: docId,
            date: data.date,
            title: data.title,
            description: data.description || '',
            status: data.status || 'In Progress',
            progressPercent: typeof data.progressPercent === 'number' ? data.progressPercent : 50,
            followUpPlan: data.followUpPlan || '',
            followUpDeadline: data.followUpDeadline || undefined,
            followUpDone: Boolean(data.followUpDone),
            priority: data.priority || 'Normal',
            principalFeedback: data.principalFeedback || undefined,
            principalApproved: Boolean(data.principalApproved),
            principalApprovedAt: data.principalApprovedAt || undefined,
            authorEmail: data.authorEmail || 'ovnica@lazuardi.sch.id',
            authorName: data.authorName || 'Ovnica',
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        }
      });

      // Sort by date descending
      items.sort((a, b) => b.date.localeCompare(a.date));
      onUpdate(items);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves or updates a single activity in Firestore
 */
export async function saveActivityToCloud(entry: JournalEntry): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, entry.id);
    await setDoc(docRef, { ...entry, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Failed to save activity to Firestore:', err);
    throw err;
  }
}

/**
 * Deletes an activity from Firestore
 */
export async function deleteActivityFromCloud(entryId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, entryId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Failed to delete activity from Firestore:', err);
    throw err;
  }
}

/**
 * Batch upload existing user entries to Firestore
 */
export async function syncAllActivitiesToCloud(entries: JournalEntry[]): Promise<boolean> {
  try {
    if (!entries || entries.length === 0) return true;

    const batch = writeBatch(db);
    entries.forEach((entry) => {
      const docRef = doc(db, COLLECTION_NAME, entry.id);
      batch.set(docRef, { ...entry, updatedAt: new Date().toISOString() }, { merge: true });
    });
    await batch.commit();
    return true;
  } catch (err) {
    console.error('Failed batch sync to Firestore:', err);
    return false;
  }
}


/**
 * Fetches one-time snapshot of cloud activities (only genuine user activities)
 */
export async function getCloudActivitiesOnce(): Promise<JournalEntry[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const items: JournalEntry[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        isSampleActivityId(docSnap.id) ||
        isSampleActivityEntry({ id: docSnap.id, title: data?.title })
      ) {
        return;
      }
      if (data && data.title) {
        items.push({
          id: docSnap.id,
          date: data.date,
          title: data.title,
          description: data.description || '',
          status: data.status || 'In Progress',
          progressPercent: typeof data.progressPercent === 'number' ? data.progressPercent : 50,
          followUpPlan: data.followUpPlan || '',
          followUpDeadline: data.followUpDeadline || undefined,
          followUpDone: Boolean(data.followUpDone),
          priority: data.priority || 'Normal',
          principalFeedback: data.principalFeedback || undefined,
          principalApproved: Boolean(data.principalApproved),
          principalApprovedAt: data.principalApprovedAt || undefined,
          authorEmail: data.authorEmail || 'ovnica@lazuardi.sch.id',
          authorName: data.authorName || 'Ovnica',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      }
    });

    items.sort((a, b) => b.date.localeCompare(a.date));
    return items;
  } catch (err) {
    console.error('Failed to get cloud activities once:', err);
    return [];
  }
}
