import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'learner_dna_v1';

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveProfile(profile) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

function defaultProfile() {
  return {
    totalSessions: 0,
    totalMinutes: 0,
    bestTimeOfDay: null,
    emotionPerformance: { happy: 0, neutral: 0, sad: 0, angry: 0, surprised: 0 },
    avgLoadByHour: {},
    levelHistory: [],
    strengths: [],
    sessionHistory: [],
    createdAt: Date.now(),
  };
}

export function useLearnerDNA() {
  const [profile, setProfile] = useState(() => loadProfile() || defaultProfile());
  const sessionStartRef = useRef(Date.now());
  const snapshotsRef = useRef([]);

  const recordSnapshot = useCallback((emotion, load, level) => {
    snapshotsRef.current.push({ emotion, load, level, time: Date.now() });
  }, []);

  const finalizeSession = useCallback(() => {
    const snapshots = snapshotsRef.current;
    if (snapshots.length === 0) return;

    const duration = Math.floor((Date.now() - sessionStartRef.current) / 60000);
    const hour = new Date().getHours();

    // Compute emotion performance scores
    const emotionCounts = {};
    snapshots.forEach(s => {
      if (!emotionCounts[s.emotion]) emotionCounts[s.emotion] = { count: 0, avgLoad: 0 };
      emotionCounts[s.emotion].count++;
      emotionCounts[s.emotion].avgLoad += s.load;
    });

    // Find dominant level
    const levelCounts = { easy: 0, medium: 0, hard: 0 };
    snapshots.forEach(s => { if (levelCounts[s.level] !== undefined) levelCounts[s.level]++; });
    const dominantLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0][0];

    setProfile(prev => {
      const updated = {
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + duration,
        levelHistory: [...prev.levelHistory.slice(-50), dominantLevel],
        avgLoadByHour: {
          ...prev.avgLoadByHour,
          [hour]: Math.round(
            ((prev.avgLoadByHour[hour] || 50) + (snapshots.reduce((a, s) => a + s.load, 0) / snapshots.length)) / 2
          ),
        },
        sessionHistory: [...prev.sessionHistory.slice(-20), {
          date: new Date().toLocaleDateString(),
          duration,
          dominantLevel,
          avgLoad: Math.round(snapshots.reduce((a, s) => a + s.load, 0) / snapshots.length),
          hour,
        }],
      };

      // Best time of day = hour with lowest avg load
      const hourEntries = Object.entries(updated.avgLoadByHour);
      if (hourEntries.length > 0) {
        const bestHour = hourEntries.sort((a, b) => a[1] - b[1])[0][0];
        updated.bestTimeOfDay = `${bestHour}:00`;
      }

      saveProfile(updated);
      return updated;
    });

    snapshotsRef.current = [];
  }, []);

  const resetProfile = useCallback(() => {
    const fresh = defaultProfile();
    saveProfile(fresh);
    setProfile(fresh);
  }, []);

  // Auto-finalize on unload
  useEffect(() => {
    window.addEventListener('beforeunload', finalizeSession);
    return () => window.removeEventListener('beforeunload', finalizeSession);
  }, [finalizeSession]);

  // Record snapshot every 5 seconds
  return { profile, recordSnapshot, finalizeSession, resetProfile };
}
