import React from 'react';

function GaugeBar({ label, value, color, comment }) {
  return (
    <div style={styles.metricRow}>
      <div style={styles.metricTop}>
        <span style={styles.metricLabel}>{label}</span>
        <span style={{ ...styles.metricVal, color }}>{value}%</span>
      </div>
      <div style={styles.trackBg}>
        <div style={{ ...styles.trackFill, width: `${value}%`, background: color }} />
      </div>
      <div style={styles.comment}>{comment}</div>
    </div>
  );
}

export default function CognitiveLoadPanel({ load, metrics }) {
  const loadColor = load > 65 ? '#f44747' : load > 35 ? '#dcdcaa' : '#4ec9b0';
  const loadLabel = load > 65 ? 'HIGH' : load > 35 ? 'MEDIUM' : 'LOW';

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.dot} />
        <span style={styles.title}>cognitive_load.ts</span>
      </div>

      {/* Main load score */}
      <div style={styles.scoreWrap}>
        <div style={styles.scoreComment}>// unified stress index</div>
        <div style={styles.scoreRow}>
          <span style={styles.scoreLabel}>cognitiveLoad</span>
          <span style={styles.eq}> = </span>
          <span style={{ ...styles.scoreVal, color: loadColor }}>{load}</span>
          <span style={{ ...styles.loadTag, background: `${loadColor}20`, color: loadColor }}>{loadLabel}</span>
        </div>
        <div style={styles.loadBarBg}>
          <div style={{ ...styles.loadBarFill, width: `${load}%`, background: loadColor }} />
        </div>
      </div>

      <div style={styles.divider} />

      {/* Sub-metrics */}
      <div style={styles.metricsWrap}>
        <div style={styles.comment}>// contributing signals</div>
        <GaugeBar
          label="errorRate"
          value={metrics.errorRate}
          color="#f44747"
          comment={`// ${metrics.errorRate > 40 ? 'high backspace frequency' : 'normal error rate'}`}
        />
        <GaugeBar
          label="pauseFreq"
          value={metrics.pauseFrequency}
          color="#ce9178"
          comment={`// ${metrics.pauseFrequency > 40 ? 'hesitation detected' : 'consistent flow'}`}
        />
        <GaugeBar
          label="typingSpeed"
          value={metrics.typingSpeed}
          color="#569cd6"
          comment={`// ${metrics.typingSpeed} wpm equivalent`}
        />
        <GaugeBar
          label="backspaceRate"
          value={metrics.backspaceRate}
          color="#c586c0"
          comment={`// ${metrics.backspaceRate > 30 ? 'correction heavy' : 'fluent typing'}`}
        />
      </div>

      <div style={styles.divider} />

      {/* Adaptation engine status */}
      <div style={styles.engineWrap}>
        <div style={styles.comment}>// adaptation engine</div>
        <div style={styles.engineLine}>
          <span style={styles.keyword}>function</span>
          <span style={styles.fnName}> adapt</span>
          <span style={styles.punctuation}>(load, emotion) {'{'}</span>
        </div>
        <div style={{ ...styles.engineLine, paddingLeft: 16 }}>
          <span style={styles.keyword}>return </span>
          <span style={{ color: loadColor }}>
            {load > 65 ? '"simplify"' : load > 35 ? '"maintain"' : '"elevate"'}
          </span>
        </div>
        <div style={styles.engineLine}>
          <span style={styles.punctuation}>{'}'}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: '#252526',
    borderRight: '1px solid #3c3c3c',
    display: 'flex',
    flexDirection: 'column',
    width: 220,
    flexShrink: 0,
    overflow: 'hidden',
    fontFamily: "'JetBrains Mono', monospace",
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 12px',
    borderBottom: '1px solid #3c3c3c',
    background: '#2d2d2d',
  },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#dcdcaa', flexShrink: 0 },
  title: { fontSize: 11, color: '#dcdcaa' },
  scoreWrap: { padding: '12px 12px 8px' },
  scoreComment: { fontSize: 10, color: '#6a9955', marginBottom: 6 },
  scoreRow: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, flexWrap: 'wrap' },
  scoreLabel: { fontSize: 12, color: '#9cdcfe' },
  eq: { fontSize: 12, color: '#d4d4d4' },
  scoreVal: { fontSize: 20, fontWeight: 600, lineHeight: 1 },
  loadTag: {
    fontSize: 9, fontWeight: 700, padding: '2px 5px',
    borderRadius: 3, letterSpacing: 1, marginLeft: 4,
  },
  loadBarBg: { height: 5, background: '#3c3c3c', borderRadius: 3, overflow: 'hidden' },
  loadBarFill: { height: '100%', borderRadius: 3, transition: 'width 0.6s ease, background 0.6s ease' },
  divider: { height: 1, background: '#3c3c3c', margin: '0 12px' },
  metricsWrap: { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 },
  comment: { fontSize: 10, color: '#6a9955', marginBottom: 4 },
  metricRow: { display: 'flex', flexDirection: 'column', gap: 3 },
  metricTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 10, color: '#9cdcfe' },
  metricVal: { fontSize: 10, fontWeight: 600 },
  trackBg: { height: 3, background: '#3c3c3c', borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  engineWrap: { padding: '10px 12px' },
  engineLine: { fontSize: 11, lineHeight: 1.8 },
  keyword: { color: '#569cd6' },
  fnName: { color: '#dcdcaa' },
  punctuation: { color: '#d4d4d4' },
};
