import React, { useState } from 'react';

const files = [
  { name: 'emotion_detector.js', icon: '📷', color: '#4ec9b0' },
  { name: 'cognitive_load.ts', icon: '🧠', color: '#dcdcaa' },
  { name: 'context_engine.ts', icon: '⚡', color: '#c586c0' },
  { name: 'lesson_easy.md', icon: '📄', color: '#4ec9b0' },
  { name: 'lesson_medium.md', icon: '📄', color: '#dcdcaa' },
  { name: 'lesson_hard.md', icon: '📄', color: '#c586c0' },
  { name: 'adaptation_log.json', icon: '📊', color: '#569cd6' },
];

export default function Sidebar({ currentLesson, adaptationLog }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={styles.sidebar}>
      {/* Activity bar */}
      <div style={styles.activityBar}>
        {['⊞', '🔍', '⎇', '🐛', '⬡'].map((icon, i) => (
          <div key={i} style={{ ...styles.activityIcon, opacity: i === 0 ? 1 : 0.4 }}>{icon}</div>
        ))}
      </div>

      {/* Explorer */}
      <div style={styles.explorer}>
        <div style={styles.explorerTitle}>EXPLORER</div>

        <div style={styles.folderRow} onClick={() => setExpanded(e => !e)}>
          <span style={styles.arrow}>{expanded ? '▾' : '▸'}</span>
          <span style={styles.folderName}>PERVASIVE-LEARNING-COMPANION</span>
        </div>

        {expanded && (
          <>
            <div style={styles.subFolder}>
              <span style={styles.arrow}>▾</span>
              <span style={styles.folderName}>src</span>
            </div>
            {files.map(f => (
              <div key={f.name} style={{
                ...styles.fileRow,
                background: f.name.includes(currentLesson) ? '#37373d' : 'transparent',
              }}>
                <span style={{ fontSize: 12 }}>{f.icon}</span>
                <span style={{ ...styles.fileName, color: f.color }}>{f.name}</span>
              </div>
            ))}
          </>
        )}

        <div style={styles.divider} />

        {/* Adaptation log */}
        <div style={styles.explorerTitle}>ADAPTATION LOG</div>
        <div style={styles.logWrap}>
          {adaptationLog.slice(-8).reverse().map((entry, i) => (
            <div key={i} style={styles.logEntry}>
              <span style={styles.logTime}>{entry.time}</span>
              <span style={{ color: entry.color, fontSize: 10 }}>{entry.level}</span>
              <span style={styles.logReason}>{entry.reason}</span>
            </div>
          ))}
          {adaptationLog.length === 0 && (
            <div style={styles.logEmpty}>// No adaptations yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: { display: 'flex', flexShrink: 0 },
  activityBar: {
    width: 44, background: '#333333',
    borderRight: '1px solid #3c3c3c',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    paddingTop: 8, gap: 4,
  },
  activityIcon: {
    width: 36, height: 36, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 16, cursor: 'pointer', borderRadius: 4,
    color: '#d4d4d4',
  },
  explorer: {
    width: 200, background: '#252526',
    borderRight: '1px solid #3c3c3c',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  explorerTitle: {
    fontSize: 10, fontWeight: 600, color: '#bdbdbd',
    padding: '12px 12px 6px',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 0.8,
  },
  folderRow: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '2px 12px', cursor: 'pointer',
    '&:hover': { background: '#2a2d2e' },
  },
  subFolder: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '2px 20px', cursor: 'pointer',
  },
  arrow: { fontSize: 10, color: '#858585', width: 10, flexShrink: 0 },
  folderName: { fontSize: 11, color: '#d4d4d4', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 },
  fileRow: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '2px 28px', cursor: 'pointer',
    transition: 'background 0.2s',
  },
  fileName: { fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
  divider: { height: 1, background: '#3c3c3c', margin: '8px 0' },
  logWrap: { flex: 1, overflow: 'auto', padding: '0 8px 8px' },
  logEntry: {
    display: 'flex', flexDirection: 'column',
    padding: '4px 6px', borderLeft: '2px solid #3c3c3c',
    marginBottom: 4,
    fontFamily: "'JetBrains Mono', monospace",
  },
  logTime: { fontSize: 9, color: '#4e4e4e', marginBottom: 1 },
  logReason: { fontSize: 10, color: '#858585', marginTop: 1 },
  logEmpty: { fontSize: 10, color: '#4e4e4e', fontFamily: "'JetBrains Mono', monospace", padding: '4px 6px' },
};
