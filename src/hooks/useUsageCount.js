import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'foodbingo:counted:v1';
let registrationPromise = null;

const readCount = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || !contentType.includes('application/json')) return null;
  const body = await response.json();
  return Number.isFinite(body?.count) ? body.count : null;
};

export async function registerUse() {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return null;
    if (!registrationPromise) {
      registrationPromise = fetch('/api/count', { method: 'POST', credentials: 'same-origin' })
        .then(readCount)
        .then((count) => { if (count !== null) localStorage.setItem(STORAGE_KEY, '1'); return count; })
        .catch((error) => {
          if (import.meta.env.DEV) console.warn('Usage counter POST failed', error);
          return null;
        })
        .finally(() => { registrationPromise = null; });
    }
    return registrationPromise;
  } catch {
    return null;
  }
}

export default function useUsageCount() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let active = true;
    fetch('/api/count', { credentials: 'same-origin' })
      .then(readCount)
      .then((nextCount) => { if (active) setCount(nextCount); })
      .catch((error) => {
        if (import.meta.env.DEV) console.warn('Usage counter GET failed', error);
        if (active) setCount(null);
      });
    return () => { active = false; };
  }, []);

  const register = useCallback(async () => {
    const nextCount = await registerUse();
    if (nextCount !== null) setCount(nextCount);
    return nextCount;
  }, []);

  return { count, registerUse: register };
}