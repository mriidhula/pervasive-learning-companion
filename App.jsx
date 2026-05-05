import React, { useRef, useState, useEffect, useCallback } from 'react';
import EmotionPanel from './components/EmotionPanel';
import CognitiveLoadPanel from './components/CognitiveLoadPanel';
import LessonEditor from './components/LessonEditor';
import AttentionHeatmap from './components/AttentionHeatmap';
import PervasiveContextPanel from './components/PervasiveContextPanel';
import LearnerDNAPanel from './components/LearnerDNAPanel';
import UploadPanel from './components/UploadPanel';
import { useCognitiveLoad } from './hooks/useCognitiveLoad';
import { useEmotionDetection } from './hooks/useEmotionDetection';
import { usePervasiveContext } from './hooks/usePervasiveContext';
import { useFrustrationPredictor } from './hooks/useFrustrationPredictor';
import { useLearnerDNA } from './hooks/useLearnerDNA';
import { defaultLessons, getLessonLevel, getEmotionAdvice } from './data/lessons';

const LEVEL_COLORS = { easy: '#4ec9b0', medium: '#dcdcaa', hard: '#c586c0' };

const TABS = [
  { id: 'lesson',  label: 'Lesson',          icon: '📄', color: '#dcdcaa', desc: 'lesson.md' },
  { id: 'upload',  label: 'Upload Material', icon: '📂', color: '#007acc', desc: 'upload.js' },
  { id: 'emotion', label: 'Emotion Detector', icon: '📷', color: '#4ec9b0', desc: 'emotion_detector.js' },
  { id: 'load',    label: 'Cognitive Load',   icon: '🧠', color: '#f44747', desc: 'cognitive_load.ts' },
  { id: 'heatmap', label: 'Attention Map',    icon: '📊', color: '#569cd6', desc: 'attention_heatmap.tsx' },
  { id: 'context', label: 'Context Engine',   icon: '⚡', color: '#c586c0', desc: 'pervasive_context.ts' },
  { id: 'dna',     label: 'Learner DNA',      icon: '🧬', color: '#ce9178', desc: 'learner_dna.json' },
];

export default function App() {
  const videoRef = useRef(null);
  const [activeTab, setActiveTab] = useState('lesson');

  // All signal hooks
  const { load, metrics } = useCognitiveLoad();
  const { emotion, emotionScores, modelsLoaded, cameraActive, error, startCamera } = useEmotionDetection(videoRef);
  const pervasiveContext = usePervasiveContext();
  const frustration = useFrustrationPredictor(emotion, load);
  const { profile, recordSnapshot, resetProfile } = useLearnerDNA();

  // Dynamic lessons from upload
  const [dynamicLessons, setDynamicLessons] = useState(defaultLessons);
  const [materialTopic, setMaterialTopic] = useState(null);

  const handleLessonsGenerated = useCallback((lessons, topic) => {
    setDynamicLessons(lessons);
    setMaterialTopic(topic);
    setActiveTab('lesson');
  }, []);

  // Level state
  const [currentLevel, setCurrentLevel] = useState('medium');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [adaptationLog, setAdaptationLog] = useState([]);
  const prevLevelRef = useRef('medium');
  const [manualOverride, setManualOverride] = useState(false);

  const logAdaptation = useCallback((from, to, reason) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    setAdaptationLog(prev => [...prev, { time, level: to.toUpperCase(), color: LEVEL_COLORS[to], reason }]);
  }, []);

  const applyLevel = useCallback((newLevel, reason) => {
    if (newLevel === prevLevelRef.current) return;
    const from = prevLevelRef.current;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentLevel(newLevel);
      prevLevelRef.current = newLevel;
      setIsTransitioning(false);
      logAdaptation(from, newLevel, reason);
    }, 300);
  }, [logAdaptation]);

  const handleManualOverride = useCallback((level) => {
    setManualOverride(true);
    applyLevel(level, 'manual override');
    setTimeout(() => setManualOverride(false), 15000);
  }, [applyLevel]);

  // Adaptation loop — priority: frustration > ambient > emotion+load
  useEffect(() => {
    const interval = setInterval(() => {
      if (manualOverride) return;
      if (frustration.intervention === 'easy') {
        applyLevel('easy', `⚠ frustration predicted (risk: ${frustration.risk}%)`);
        return;
      }
      if (pervasiveContext.ambientStress > 45) {
        applyLevel('easy', `ambient stress ${pervasiveContext.ambientStress}% · ${pervasiveContext.timeOfDay}`);
        return;
      }
      const newLevel = getLessonLevel(emotion, load);
      const reason = load > 65 ? 'high cognitive load'
        : (load < 30 && emotion === 'happy') ? 'high engagement'
        : `emotion: ${emotion}`;
      applyLevel(newLevel, reason);
    }, 4000);
    return () => clearInterval(interval);
  }, [emotion, load, manualOverride, frustration, pervasiveContext, applyLevel]);

  // Learner DNA snapshot every 5s
  useEffect(() => {
    const interval = setInterval(() => recordSnapshot(emotion, load, currentLevel), 5000);
    return () => clearInterval(interval);
  }, [emotion, load, currentLevel, recordSnapshot]);

  const advice = getEmotionAdvice(emotion, load);
  const lesson = (dynamicLessons && dynamicLessons[currentLevel]) || defaultLessons[currentLevel];
  const levelColor = LEVEL_COLORS[currentLevel];
  const loadColor = load > 65 ? '#f44747' : load > 35 ? '#dcdcaa' : '#4ec9b0';

  return (
    <div style={s.app}>

      {/* ── Title bar ── */}
      <div style={s.titleBar}>
        <div style={s.lights}>
          <div style={{ ...s.light, background: '#ff5f57' }} />
          <div style={{ ...s.light, background: '#febc2e' }} />
          <div style={{ ...s.light, background: '#28c840' }} />
        </div>
        <span style={s.titleCenter}>
          Pervasive Learning Companion
          <span style={s.titleSep}> — </span>
          <span style={{ color: levelColor }}>{materialTopic ? materialTopic : `lesson_${currentLevel}.md`}</span>
        </span>
        <div style={s.titleRight}>
          {frustration.warning && (
            <span style={{ ...s.alertPill, color: '#f44747', background: '#f4474715', border: '1px solid #f4474740' }}>
              ⚠ frustration risk {frustration.risk}%
            </span>
          )}
          <span style={s.titleMeta}>adaptive-learning v2.0</span>
        </div>
      </div>

      <div style={s.body}>

        {/* ── Left sidebar: file explorer + log ── */}
        <div style={s.sidebar}>
          <div style={s.sidebarTitle}>EXPLORER</div>
          <div style={s.sidebarSection}>
            {TABS.map(tab => (
              <div
                key={tab.id}
                style={{ ...s.sidebarFile, background: activeTab === tab.id ? '#37373d' : 'transparent' }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ fontSize: 12 }}>{tab.icon}</span>
                <span style={{ color: activeTab === tab.id ? tab.color : '#858585', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                  {tab.desc}
                </span>
              </div>
            ))}
          </div>

          <div style={s.sidebarDivider} />
          {materialTopic && (
            <div style={{ padding: '6px 12px' }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#6a9955', marginBottom: 4 }}>// material loaded</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#4ec9b0', wordBreak: 'break-word' }}>{materialTopic}</div>
            </div>
          )}
          <div style={s.sidebarDivider} />
          <div style={s.sidebarTitle}>ADAPTATION LOG</div>
          <div style={s.logWrap}>
            {adaptationLog.length === 0 && (
              <div style={s.logEmpty}>// no changes yet</div>
            )}
            {adaptationLog.slice(-10).reverse().map((e, i) => (
              <div key={i} style={s.logEntry}>
                <span style={s.logTime}>{e.time}</span>
                <span style={{ color: e.color, fontSize: 10, fontWeight: 600 }}>{e.level}</span>
                <span style={s.logReason}>{e.reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main panel ── */}
        <div style={s.main}>

          {/* Tab bar */}
          <div style={s.tabBar}>
            {TABS.map(tab => (
              <div
                key={tab.id}
                style={{
                  ...s.tab,
                  background: activeTab === tab.id ? '#1e1e1e' : '#2d2d2d',
                  borderTop: activeTab === tab.id ? `1px solid ${tab.color}` : '1px solid transparent',
                  borderRight: '1px solid #3c3c3c',
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                <span style={{ fontSize: 11 }}>{tab.icon}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: activeTab === tab.id ? tab.color : '#858585',
                }}>
                  {tab.label}
                </span>
                {/* Live pulse dot */}
                {tab.id === 'emotion' && cameraActive && (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ec9b0', flexShrink: 0 }} />
                )}
                {tab.id === 'context' && frustration.warning && (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f44747', flexShrink: 0 }} />
                )}
              </div>
            ))}
            {/* Live stats */}
            <div style={s.liveStats}>
              <span style={{ color: loadColor, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>load {load}%</span>
              <span style={{ color: '#555' }}>│</span>
              <span style={{ color: '#858585', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{emotion}</span>
              <span style={{ color: '#555' }}>│</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: levelColor, fontWeight: 600 }}>{currentLevel}</span>
            </div>
          </div>

          {/* ── Tab panels ── */}
          <div style={s.panel}>

            {/* LESSON */}
            {activeTab === 'lesson' && (
              <LessonEditor
                lesson={lesson}
                advice={advice}
                isTransitioning={isTransitioning}
                onManualOverride={handleManualOverride}
              />
            )}

            {/* UPLOAD MATERIAL */}
            {activeTab === 'upload' && (
              <UploadPanel onLessonsGenerated={handleLessonsGenerated} />
            )}

            {/* EMOTION DETECTOR — always mounted so videoRef stays alive */}
            <div style={{ display: activeTab === 'emotion' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={s.panelScroll}>
                <div style={s.panelHeader}>
                  <span style={s.panelComment}>// real-time facial expression detection via face-api.js</span>
                </div>
                <div style={s.twoCol}>
                  <EmotionPanel
                    videoRef={videoRef}
                    emotion={emotion}
                    emotionScores={emotionScores}
                    cameraActive={cameraActive}
                    error={error}
                    onStart={startCamera}
                    modelsLoaded={modelsLoaded}
                  />
                  <div style={s.emotionInfo}>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// how it works</div>
                      <div style={s.infoText}>
                        face-api.js runs a TinyFaceDetector model entirely in your browser.
                        It reads your webcam every 1.5 seconds and classifies 7 expressions:
                        happy, sad, angry, disgusted, surprised, fearful, neutral.
                      </div>
                    </div>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// patent contribution</div>
                      <div style={s.infoText}>
                        Emotion state is one input to the Unified Learner Stress Index (ULSI).
                        Negative emotions (angry, disgusted) increase frustration risk score
                        and trigger proactive lesson simplification before the student disengages.
                      </div>
                    </div>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// current state</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginTop: 6 }}>
                        <span style={{ color: '#9cdcfe' }}>emotion</span>
                        <span style={{ color: '#d4d4d4' }}> = </span>
                        <span style={{ color: '#ce9178' }}>"{emotion}"</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COGNITIVE LOAD */}
            {activeTab === 'load' && (
              <div style={s.panelScroll}>
                <div style={s.panelHeader}>
                  <span style={s.panelComment}>// keystroke-based cognitive load analysis — no hardware required</span>
                </div>
                <div style={s.twoCol}>
                  <CognitiveLoadPanel load={load} metrics={metrics} />
                  <div style={s.emotionInfo}>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// how it works</div>
                      <div style={s.infoText}>
                        Every keystroke is timestamped. The system measures inter-key intervals,
                        backspace frequency, typing speed, and pause duration to compute a
                        cognitive load score from 0–100 in real time.
                      </div>
                    </div>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// signal weights</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2, marginTop: 6 }}>
                        <div><span style={{ color: '#9cdcfe' }}>errorRate</span><span style={{ color: '#d4d4d4' }}>     × 0.35</span></div>
                        <div><span style={{ color: '#9cdcfe' }}>pauseFrequency</span><span style={{ color: '#d4d4d4' }}> × 0.30</span></div>
                        <div><span style={{ color: '#9cdcfe' }}>backspaceRate</span><span style={{ color: '#d4d4d4' }}>  × 0.20</span></div>
                        <div><span style={{ color: '#9cdcfe' }}>typingSpeed</span><span style={{ color: '#d4d4d4' }}>    × 0.15</span></div>
                      </div>
                    </div>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// try it</div>
                      <div style={s.infoText}>
                        Type quickly in the lesson tab → load drops.{'\n'}
                        Press backspace repeatedly → load rises.{'\n'}
                        Stop typing for 5 seconds → load decays slowly.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ATTENTION HEATMAP */}
            {activeTab === 'heatmap' && (
              <div style={s.panelScroll}>
                <div style={s.panelHeader}>
                  <span style={s.panelComment}>// live session timeline — emotion + load + difficulty switches</span>
                </div>
                <AttentionHeatmap emotion={emotion} load={load} level={currentLevel} />
                <div style={s.infoBlock}>
                  <div style={s.infoLabel}>// what you're seeing</div>
                  <div style={s.infoText}>
                    The red line shows your cognitive load over time. Coloured dots show your detected emotion at each moment.
                    Dashed vertical lines mark every time the system switched difficulty level — labeled E (easy), M (medium), H (hard).
                    This timeline is your pervasive learning audit trail — a patent-novel contribution.
                  </div>
                </div>
              </div>
            )}

            {/* PERVASIVE CONTEXT */}
            {activeTab === 'context' && (
              <div style={s.panelScroll}>
                <div style={s.panelHeader}>
                  <span style={s.panelComment}>// ambient device signals + frustration prediction engine</span>
                </div>
                <div style={s.twoCol}>
                  <PervasiveContextPanel context={pervasiveContext} frustration={frustration} />
                  <div style={s.emotionInfo}>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// pervasive signals captured</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2, marginTop: 6 }}>
                        <div><span style={{ color: '#4ec9b0' }}>timeOfDay</span><span style={{ color: '#858585' }}>    → {pervasiveContext.timeOfDay}</span></div>
                        <div><span style={{ color: '#4ec9b0' }}>battery</span><span style={{ color: '#858585' }}>      → {pervasiveContext.battery !== null ? pervasiveContext.battery + '%' : 'unavailable'}</span></div>
                        <div><span style={{ color: '#4ec9b0' }}>sessionTime</span><span style={{ color: '#858585' }}>   → {pervasiveContext.sessionMinutes}m</span></div>
                        <div><span style={{ color: '#4ec9b0' }}>ambientStress</span><span style={{ color: '#858585' }}> → {pervasiveContext.ambientStress}%</span></div>
                      </div>
                    </div>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// frustration predictor</div>
                      <div style={s.infoText}>
                        Unlike existing systems that react after frustration peaks,
                        this engine predicts frustration 30–60 seconds early by detecting
                        a rising load trend + negative emotion drift pattern.
                        This proactive intervention is the core patent claim.
                      </div>
                    </div>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// current prediction</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2, marginTop: 6 }}>
                        <div><span style={{ color: '#9cdcfe' }}>risk</span><span style={{ color: '#d4d4d4' }}>  = </span><span style={{ color: frustration.risk > 60 ? '#f44747' : '#4ec9b0' }}>{frustration.risk}%</span></div>
                        <div><span style={{ color: '#9cdcfe' }}>trend</span><span style={{ color: '#d4d4d4' }}> = </span><span style={{ color: frustration.trend === 'rising' ? '#f44747' : '#4ec9b0' }}>"{frustration.trend}"</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LEARNER DNA */}
            {activeTab === 'dna' && (
              <div style={s.panelScroll}>
                <div style={s.panelHeader}>
                  <span style={s.panelComment}>// persistent cross-session learner profile stored in localStorage</span>
                </div>
                <div style={s.twoCol}>
                  <LearnerDNAPanel profile={profile} onReset={resetProfile} />
                  <div style={s.emotionInfo}>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// what is learner DNA?</div>
                      <div style={s.infoText}>
                        Every 5 seconds, the system snapshots your emotion, cognitive load,
                        and current level. After each session, it builds a persistent profile:
                        your best time of day to study, your dominant difficulty level,
                        and your average load patterns by hour.
                      </div>
                    </div>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// patent contribution</div>
                      <div style={s.infoText}>
                        On future sessions, the system pre-configures difficulty based on your
                        historical profile before you even start typing. No other adaptive
                        learning system uses a multi-session affective fingerprint for
                        pre-session configuration.
                      </div>
                    </div>
                    <div style={s.infoBlock}>
                      <div style={s.infoLabel}>// your profile</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2, marginTop: 6 }}>
                        <div><span style={{ color: '#9cdcfe' }}>sessions</span><span style={{ color: '#d4d4d4' }}>  = </span><span style={{ color: '#ce9178' }}>{profile.totalSessions}</span></div>
                        <div><span style={{ color: '#9cdcfe' }}>totalTime</span><span style={{ color: '#d4d4d4' }}> = </span><span style={{ color: '#ce9178' }}>{profile.totalMinutes}m</span></div>
                        <div><span style={{ color: '#9cdcfe' }}>bestTime</span><span style={{ color: '#d4d4d4' }}>  = </span><span style={{ color: '#ce9178' }}>"{profile.bestTimeOfDay || 'learning...'}"</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div style={s.statusBar}>
        <span style={s.statusItem}>Pervasive Learning Companion</span>
        <span style={s.statusSep}>│</span>
        <span style={{ ...s.statusItem, color: levelColor }}>Level: {currentLevel}</span>
        <span style={s.statusSep}>│</span>
        <span style={{ ...s.statusItem, color: loadColor }}>Load: {load}%</span>
        <span style={s.statusSep}>│</span>
        <span style={s.statusItem}>Emotion: {emotion}</span>
        <span style={s.statusSep}>│</span>
        <span style={{ ...s.statusItem, color: frustration.risk > 60 ? '#f44747' : '#4ec9b0' }}>
          Frustration Risk: {frustration.risk}%
        </span>
        <div style={{ flex: 1 }} />
        <span style={s.statusItem}>{pervasiveContext.timeOfDay} · {pervasiveContext.sessionMinutes}m session</span>
        {pervasiveContext.battery !== null && (
          <span style={{ ...s.statusItem, color: pervasiveContext.battery < 20 ? '#f44747' : '#858585' }}>
            🔋 {pervasiveContext.battery}%
          </span>
        )}
      </div>
    </div>
  );
}

const s = {
  app: { height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden', fontFamily: "'JetBrains Mono', monospace" },

  titleBar: { height: 28, background: '#3c3c3c', display: 'flex', alignItems: 'center', flexShrink: 0, borderBottom: '1px solid #252526', position: 'relative' },
  lights: { display: 'flex', gap: 6, padding: '0 12px', alignItems: 'center' },
  light: { width: 12, height: 12, borderRadius: '50%' },
  titleCenter: { position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: '#cccccc', whiteSpace: 'nowrap' },
  titleSep: { color: '#555' },
  titleRight: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' },
  alertPill: { fontSize: 10, padding: '2px 8px', borderRadius: 3, fontWeight: 600 },
  titleMeta: { fontSize: 11, color: '#555' },

  body: { flex: 1, display: 'flex', overflow: 'hidden' },

  sidebar: { width: 220, background: '#252526', borderRight: '1px solid #3c3c3c', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' },
  sidebarTitle: { fontSize: 10, fontWeight: 600, color: '#bdbdbd', padding: '12px 14px 6px', letterSpacing: 1 },
  sidebarSection: { display: 'flex', flexDirection: 'column' },
  sidebarFile: { display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px', cursor: 'pointer', transition: 'background 0.15s' },
  sidebarDivider: { height: 1, background: '#3c3c3c', margin: '8px 0' },
  logWrap: { flex: 1, overflow: 'auto', padding: '0 10px 10px' },
  logEmpty: { fontSize: 10, color: '#4e4e4e', padding: '4px 4px', fontFamily: "'JetBrains Mono', monospace" },
  logEntry: { display: 'flex', flexDirection: 'column', padding: '4px 6px', borderLeft: '2px solid #3c3c3c', marginBottom: 5 },
  logTime: { fontSize: 9, color: '#4e4e4e', marginBottom: 1 },
  logReason: { fontSize: 10, color: '#858585', marginTop: 1, lineHeight: 1.4 },

  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },

  tabBar: { display: 'flex', alignItems: 'stretch', background: '#2d2d2d', borderBottom: '1px solid #3c3c3c', flexShrink: 0, height: 36, overflow: 'hidden' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s', userSelect: 'none' },
  liveStats: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', flexShrink: 0 },

  panel: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  panelScroll: { flex: 1, overflow: 'auto', padding: '0 0 20px' },
  panelHeader: { padding: '10px 20px', borderBottom: '1px solid #2d2d2d', background: '#1e1e1e' },
  panelComment: { fontSize: 12, color: '#6a9955' },

  twoCol: { display: 'flex', gap: 0, flex: 1, overflow: 'hidden' },
  emotionInfo: { flex: 1, padding: '20px 24px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 },
  infoBlock: { display: 'flex', flexDirection: 'column', gap: 6 },
  infoLabel: { fontSize: 10, color: '#6a9955' },
  infoText: { fontSize: 13, color: '#858585', lineHeight: 1.7, whiteSpace: 'pre-line' },

  statusBar: { height: 22, background: '#007acc', display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 },
  statusItem: { fontSize: 11, color: '#fff', padding: '0 10px', whiteSpace: 'nowrap' },
  statusSep: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
};
