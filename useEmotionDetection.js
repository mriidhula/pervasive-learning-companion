import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

export function useEmotionDetection(videoRef) {
  const [emotion, setEmotion] = useState('neutral');
  const [emotionScores, setEmotionScores] = useState({});
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function loadModels() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        setError('Could not load face models. Using simulated emotion.');
        setModelsLoaded(false);
      }
    }
    loadModels();
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Using simulated emotion.');
      startSimulation();
    }
  }, [videoRef]);

  const startSimulation = useCallback(() => {
    const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'disgusted', 'fearful'];
    setCameraActive(false);
    intervalRef.current = setInterval(() => {
      const picked = emotions[Math.floor(Math.random() * emotions.length)];
      const scores = {};
      emotions.forEach(e => { scores[e] = Math.random() * 0.1; });
      scores[picked] = 0.6 + Math.random() * 0.4;
      setEmotion(picked);
      setEmotionScores(scores);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!modelsLoaded || !cameraActive || !videoRef.current) return;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      try {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections) {
          const expr = detections.expressions;
          const top = Object.entries(expr).sort((a, b) => b[1] - a[1])[0];
          setEmotion(top[0]);
          setEmotionScores(expr);
        }
      } catch (e) {}
    }, 1500);

    return () => clearInterval(intervalRef.current);
  }, [modelsLoaded, cameraActive, videoRef]);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, [videoRef]);

  return { emotion, emotionScores, modelsLoaded, cameraActive, error, startCamera };
}
