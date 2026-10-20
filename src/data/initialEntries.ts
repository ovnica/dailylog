import { JournalEntry } from '../types/journal';

// Empty by default: user activities come exclusively from the user's input and Cloud Firestore.
// No synthetic Studio samples are seeded.
export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [];
