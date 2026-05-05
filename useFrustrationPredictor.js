import { useState, useEffect, useRef } from 'react';

const WINDOW = 8; // last N readings to analyze trend

export function useFrustrationPredictor(emotion, load) {
  const [prediction, setPrediction] = useState({
    risk: 0,           // 0-100
    trend: 'stable',   // 'rising', 'falling', 'stable'
    warning: false,
    message: '',
    intervention: null,
  });

  const historyRef = useRef([]);

  useEffect(() => {
    const entry = { emotion, load, time: Date.now() };
    historyRef.current.push(entry);
    if (historyRef.current.length > WINDOW) historyRef.current.shift();

    const history = historyRef.current;
    if (history.length < 3) return;

    // Compute load trend (linear slope over window)
    const loads = history.map(h => h.load);
    const n = loads.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = loads.reduce((a, b) => a + b, 0);
    const sumXY = loads.reduce((acc, y, i) => acc + i * y, 0);
    const sumX2 = loads.reduce((acc, _, i) => acc + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    // Emotion danger scores
    const emotionRisk = {
      angry: 80, disgusted: 70, fearful: 60,
      sad: 45, neutral: 20, surprised: 10, happy: 0,
    };
    const currentEmotionRisk = emotionRisk[emotion] || 20;

    // Negative emotion trend
    const recentNegative = history.slice(-4).filter(h =>
      ['angry', 'disgusted', 'sad', 'fearful'].includes(h.emotion)
    ).length;

    // Compute risk score
    let risk = 0;
    risk += currentEmotionRisk * 0.35;
    risk += Math.min(100, load) * 0.30;
    risk += Math.min(100, Math.max(0, slope * 10)) * 0.20; // rising load trend
    risk += (recentNegative / 4) * 100 * 0.15;
    risk = Math.round(Math.min(100, risk));

    const trend = slope > 2 ? 'rising' : slope < -2 ? 'falling' : 'stable';
    const warning = risk > 60 && trend !== 'falling';

    let message = '';
    let intervention = null;

    if (risk > 75) {
      message = 'High frustration risk — switching to easier content';
      intervention = 'easy';
    } else if (risk > 60) {
      message = 'Frustration pattern detected — adding hints';
      intervention = 'hint';
    } else if (risk > 40) {
      message = 'Early stress signals — monitoring closely';
      intervention = null;
    } else if (trend === 'falling') {
      message = 'Stress reducing — good recovery';
    }

    setPrediction({ risk, trend, warning, message, intervention });
  }, [emotion, load]);

  return prediction;
}
