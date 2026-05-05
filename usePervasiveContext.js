import { useState, useEffect, useRef } from 'react';

export function usePervasiveContext() {
  const [context, setContext] = useState({
    hour: new Date().getHours(),
    battery: null,
    sessionMinutes: 0,
    timeOfDay: getTimeOfDay(new Date().getHours()),
    ambientStress: 0,
    recommendation: 'medium',
  });

  const startTimeRef = useRef(Date.now());

  function getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  function computeAmbientStress(battery, sessionMinutes, hour) {
    let stress = 0;
    // Late night penalty
    if (hour >= 22 || hour < 5) stress += 30;
    else if (hour >= 20) stress += 15;
    // Long session penalty
    if (sessionMinutes > 60) stress += 30;
    else if (sessionMinutes > 40) stress += 15;
    else if (sessionMinutes > 25) stress += 8;
    // Low battery penalty
    if (battery !== null) {
      if (battery < 10) stress += 25;
      else if (battery < 20) stress += 15;
      else if (battery < 30) stress += 5;
    }
    return Math.min(100, stress);
  }

  function getRecommendation(ambientStress) {
    if (ambientStress > 40) return 'easy';
    if (ambientStress > 20) return 'medium';
    return 'hard';
  }

  // Battery API
  useEffect(() => {
    if (!navigator.getBattery) return;
    navigator.getBattery().then(bat => {
      const update = () => {
        setContext(prev => {
          const battery = Math.round(bat.level * 100);
          const ambientStress = computeAmbientStress(battery, prev.sessionMinutes, prev.hour);
          return {
            ...prev,
            battery,
            ambientStress,
            recommendation: getRecommendation(ambientStress),
          };
        });
      };
      update();
      bat.addEventListener('levelchange', update);
    });
  }, []);

  // Session timer + time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionMinutes = Math.floor((Date.now() - startTimeRef.current) / 60000);
      const hour = new Date().getHours();
      setContext(prev => {
        const ambientStress = computeAmbientStress(prev.battery, sessionMinutes, hour);
        return {
          ...prev,
          hour,
          sessionMinutes,
          timeOfDay: getTimeOfDay(hour),
          ambientStress,
          recommendation: getRecommendation(ambientStress),
        };
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return context;
}
