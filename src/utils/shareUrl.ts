import { JournalEntry } from '../types/journal';
import { isSampleActivityEntry } from './dateUtils';

/**
 * Encodes journal entries into a clean URL-safe base64 string
 */
export function encodeEntriesToUrl(entries: JournalEntry[]): string {
  try {
    // Only pack the necessary fields to keep payload compact
    const compactList = entries.map((e) => ({
      i: e.id,
      d: e.date,
      t: e.title,
      ds: e.description || '',
      s: e.status,
      p: e.progressPercent,
      fp: e.followUpPlan || '',
      fd: e.followUpDeadline || '',
      fdo: e.followUpDone ? 1 : 0,
      pr: e.priority || 'Normal',
      pf: e.principalFeedback || '',
      pa: e.principalApproved ? 1 : 0,
      pat: e.principalApprovedAt || '',
      c: e.createdAt,
      u: e.updatedAt,
    }));

    const json = JSON.stringify(compactList);
    // URL-safe base64
    const base64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#share=${base64}`;
  } catch (err) {
    console.error('Failed to encode entries to URL', err);
    return window.location.href;
  }
}

/**
 * Decodes entries from URL if `#share=` or `?share=` is present
 */
export function decodeEntriesFromUrl(): JournalEntry[] | null {
  try {
    let payload = '';

    // Check hash first (e.g. #share=...)
    if (window.location.hash.includes('share=')) {
      const match = window.location.hash.match(/share=([^&]+)/);
      if (match && match[1]) {
        payload = match[1];
      }
    }

    // Fallback check query params (e.g. ?share=...)
    if (!payload && window.location.search.includes('share=')) {
      const params = new URLSearchParams(window.location.search);
      payload = params.get('share') || '';
    }

    if (!payload) return null;

    // Restore base64 padding and chars
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const json = decodeURIComponent(escape(atob(base64)));
    const compactList = JSON.parse(json);

    if (Array.isArray(compactList) && compactList.length > 0) {
      const restored: JournalEntry[] = compactList.map((item: any) => ({
        id: item.i || item.id,
        date: item.d || item.date || '2026-10-15',
        title: item.t || item.title || 'Untitled Activity',
        description: item.ds !== undefined ? item.ds : item.description || '',
        status: item.s || item.status || 'In Progress',
        progressPercent: typeof item.p === 'number' ? item.p : item.progressPercent || 50,
        followUpPlan: item.fp !== undefined ? item.fp : item.followUpPlan || '',
        followUpDeadline: item.fd || item.followUpDeadline || undefined,
        followUpDone: Boolean(item.fdo !== undefined ? item.fdo : item.followUpDone),
        priority: item.pr || item.priority || 'Normal',
        principalFeedback: item.pf || item.principalFeedback || undefined,
        principalApproved: Boolean(item.pa !== undefined ? item.pa : item.principalApproved),
        principalApprovedAt: item.pat || item.principalApprovedAt || undefined,
        createdAt: item.c || item.createdAt || new Date().toISOString(),
        updatedAt: item.u || item.updatedAt || new Date().toISOString(),
      }));

      const cleanRestored = restored.filter((e) => !isSampleActivityEntry(e));
      return cleanRestored.length > 0 ? cleanRestored : null;
    }
  } catch (err) {
    console.warn('Could not decode entries from URL', err);
  }

  return null;
}
