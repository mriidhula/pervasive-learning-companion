import { useState, useEffect, useRef, useCallback } from 'react';

const WINDOW_SIZE = 20;

export function useCognitiveLoad() {
  const [load, setLoad] = useState(0);
  const [metrics, setMetrics] = useState({
    typingSpeed: 0,
    errorRate: 0,
    pauseFrequency: 0,
    backspaceRate: 0,
  });

  const keystrokesRef = useRef([]);
  const errorsRef = useRef(0);
  const totalKeysRef = useRef(0);
  const lastKeystrokeRef = useRef(null);
  const pausesRef = useRef(0);

  const recordKeystroke = useCallback((e) => {
    const now = Date.now();
    totalKeysRef.current += 1;

    if (e.key === 'Backspace') {
      errorsRef.current += 1;
    }

    if (lastKeystrokeRef.current) {
      const gap = now - lastKeystrokeRef.current;
      if (gap > 2000) pausesRef.current += 1;
      keystrokesRef.current.push(gap);
      if (keystrokesRef.current.length > WINDOW_SIZE) {
        keystrokesRef.current.shift();
      }
    }
    lastKeystrokeRef.current = now;

    // compute metrics
    const gaps = keystrokesRef.current;
    const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 500;
    const typingSpeed = Math.min(100, Math.max(0, Math.round((1 / (avgGap / 1000)) * 60 * 5)));
    const errorRate = totalKeysRef.current > 0
      ? Math.min(100, Math.round((errorsRef.current / totalKeysRef.current) * 100 * 3))
      : 0;
    const pauseFrequency = Math.min(100, pausesRef.current * 10);
    const backspaceRate = totalKeysRef.current > 0
      ? Math.min(100, Math.round((errorsRef.current / totalKeysRef.current) * 200))
      : 0;

    const computedLoad = Math.min(100, Math.round(
      (errorRate * 0.35) +
      (pauseFrequency * 0.30) +
      (backspaceRate * 0.20) +
      (Math.max(0, 60 - typingSpeed) * 0.15)
    ));

    setMetrics({ typingSpeed, errorRate, pauseFrequency, backspaceRate });
    setLoad(computedLoad);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', recordKeystroke);
    return () => window.removeEventListener('keydown', recordKeystroke);
  }, [recordKeystroke]);

  // decay load slowly when no typing
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (lastKeystrokeRef.current && now - lastKeystrokeRef.current > 5000) {
        setLoad(prev => Math.max(0, prev - 2));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { load, metrics };
}
