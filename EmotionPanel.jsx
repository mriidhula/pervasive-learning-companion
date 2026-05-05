import React from 'react';

const EMOTION_COLORS = {
  happy: '#4ec9b0',
  sad: '#569cd6',
  angry: '#f44747',
  disgusted: '#ce9178',
  surprised: '#dcdcaa',
  fearful: '#c586c0',
  neutral: '#858585',
};

const EMOTION_ICONS = {
  happy: '😊', sad: '😔', angry: '😠',
  disgusted: '😒', surprised: '😮', fearful: '😨', neutral: '😐',
};

export default function EmotionPanel({ videoRef, emotion, emotionScores, cameraActive, error, onStart, modelsLoaded }) {
  const topEmotions = Object.entries(emotionScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerDot} />
        <span style={styles.headerTitle}>emotion_detector.js</span>
        <span style={{ ...styles.badge, background: cameraActive ? '#4ec9b020' : '#85858520', color: cameraActive ? '#4ec9b0' : '#858585' }}>
          {cameraActive ? '● LIVE' : '○ OFF'}
        </span>
      </div>

      {/* Video */}
      <div style={styles.videoWrap}>
        <video ref={videoRef} style={{ ...styles.video, opacity: cameraActive ? 1 : 0.2 }} muted playsInline />
        {!cameraActive && (
          <div style={styles.videoOverlay}>
            <div style={styles.cameraOff}>
              <span style={{ fontSize: 28 }}>📷</span>
              <span style={{ fontSize: 12, color: '#858585', marginTop: 6 }}>Camera off</span>
            </div>
          </div>
        )}
        {/* Current emotion badge */}
        {cameraActive && (
          <div style={{ ...styles.emotionBadge, borderColor: EMOTION_COLORS[emotion] || '#858585' }}>
            <span>{EMOTION_ICONS[emotion] || '😐'}</span>
            <span style={{ color: EMOTION_COLORS[emotion], fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {emotion}
            </span>
          </div>
        )}
      </div>

      {/* Start button */}
      {!cameraActive && (
        <button style={styles.startBtn} onClick={onStart}>
          {modelsLoaded ? '▶ Start Camera' : '⟳ Loading models...'}
        </button>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {/* Emotion bars */}
      {topEmotions.length > 0 && (
        <div style={styles.barsWrap}>
          <div style={styles.barsLabel}>// expression scores</div>
          {topEmotions.map(([name, score]) => (
            <div key={name} style={styles.barRow}>
              <span style={{ ...styles.barName, color: EMOTION_COLORS[name] || '#858585' }}>{name}</span>
              <div style={styles.barBg}>
                <div style={{
                  ...styles.barFill,
                  width: `${Math.round(score * 100)}%`,
                  background: EMOTION_COLORS[name] || '#858585',
                  opacity: 0.8,
                }} />
              </div>
              <span style={styles.barVal}>{Math.round(score * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    background: '#252526',
    borderRight: '1px solid #3c3c3c',
    display: 'flex',
    flexDirection: 'column',
    width: 240,
    flexShrink: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderBottom: '1px solid #3c3c3c',
    background: '#2d2d2d',
  },
  headerDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    background: '#4ec9b0',
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#4ec9b0',
    flex: 1,
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 3,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 0.5,
  },
  videoWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    background: '#1a1a1a',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  },
  videoOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cameraOff: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  emotionBadge: {
    position: 'absolute',
    bottom: 8, left: 8, right: 8,
    background: 'rgba(0,0,0,0.75)',
    border: '1px solid',
    borderRadius: 4,
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: "'JetBrains Mono', monospace",
  },
  startBtn: {
    margin: '10px 12px',
    padding: '7px 0',
    background: '#007acc',
    color: '#fff',
    border: 'none',
    borderRadius: 3,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
  },
  error: {
    margin: '0 12px 8px',
    padding: '6px 8px',
    background: '#f4474720',
    border: '1px solid #f4474740',
    borderRadius: 3,
    fontSize: 11,
    color: '#f44747',
    fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1.4,
  },
  barsWrap: {
    padding: '10px 12px',
    flex: 1,
    overflow: 'hidden',
  },
  barsLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#6a9955',
    marginBottom: 8,
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  barName: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    width: 62,
    flexShrink: 0,
  },
  barBg: {
    flex: 1,
    height: 4,
    background: '#3c3c3c',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.5s ease',
  },
  barVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#858585',
    width: 28,
    textAlign: 'right',
  },
};
