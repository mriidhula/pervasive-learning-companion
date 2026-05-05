import React, { useState } from 'react';

const LEVEL_COLORS = { easy: '#4ec9b0', medium: '#dcdcaa', hard: '#c586c0' };

export default function LearnerDNAPanel({ profile, onReset }) {
  const [expanded, setExpanded] = useState(false);

  const recentSessions = profile.sessionHistory.slice(-5).reverse();
  const levelDist = profile.levelHistory.reduce((acc, l) => {
    acc[l] = (acc[l] || 0) + 1; return acc;
  }, {});
  const total = profile.levelHistory.length || 1;

  return (
    <div style={styles.panel}>
      <div style={styles.header} onClick={() => setExpanded(e => !e)}>
        <span style={styles.dot} />
        <span style={styles.title}>learner_dna.json</span>
        <span style={styles.arrow}>{expanded ? '▾' : '▸'}</span>
      </div>

      <div style={styles.body}>
        {/* Summary stats */}
        <div style={styles.section}>
          <div style={styles.comment}>// persistent profile</div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>sessions</span>
            <span style={styles.statVal}>{profile.totalSessions}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>totalTime</span>
            <span style={styles.statVal}>{profile.totalMinutes}m</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>bestTime</span>
            <span style={{ ...styles.statVal, color: '#dcdcaa' }}>
              {profile.bestTimeOfDay || 'learning...'}
            </span>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Level distribution */}
        <div style={styles.section}>
          <div style={styles.comment}>// level distribution</div>
          {['easy', 'medium', 'hard'].map(lvl => (
            <div key={lvl} style={styles.distRow}>
              <span style={{ ...styles.distLabel, color: LEVEL_COLORS[lvl] }}>{lvl}</span>
              <div style={styles.distBg}>
                <div style={{
                  ...styles.distFill,
                  width: `${Math.round(((levelDist[lvl] || 0) / total) * 100)}%`,
                  background: LEVEL_COLORS[lvl],
                }} />
              </div>
              <span style={styles.distPct}>
                {Math.round(((levelDist[lvl] || 0) / total) * 100)}%
              </span>
            </div>
          ))}
        </div>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <>
            <div style={styles.divider} />
            <div style={styles.section}>
              <div style={styles.comment}>// recent sessions</div>
              {recentSessions.map((s, i) => (
                <div key={i} style={styles.sessionRow}>
                  <span style={styles.sessionDate}>{s.date}</span>
                  <span style={{ ...styles.sessionLevel, color: LEVEL_COLORS[s.dominantLevel] }}>
                    {s.dominantLevel[0].toUpperCase()}
                  </span>
                  <span style={styles.sessionLoad}>{s.avgLoad}% load</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={styles.divider} />

        <div style={styles.section}>
          <button style={styles.resetBtn} onClick={onReset}>
            ↺ reset profile
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: '#252526',
    borderTop: '1px solid #3c3c3c',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    fontFamily: "'JetBrains Mono', monospace",
    maxHeight: 280,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', cursor: 'pointer',
    borderBottom: '1px solid #3c3c3c',
    background: '#2d2d2d',
  },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#ce9178', flexShrink: 0 },
  title: { fontSize: 11, color: '#ce9178', flex: 1 },
  arrow: { fontSize: 10, color: '#858585' },
  body: { overflow: 'auto', flex: 1 },
  section: { padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5 },
  comment: { fontSize: 10, color: '#6a9955', marginBottom: 2 },
  divider: { height: 1, background: '#3c3c3c' },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#9cdcfe' },
  statVal: { fontSize: 11, color: '#d4d4d4', fontWeight: 500 },
  distRow: { display: 'flex', alignItems: 'center', gap: 6 },
  distLabel: { fontSize: 10, width: 44, flexShrink: 0 },
  distBg: { flex: 1, height: 3, background: '#3c3c3c', borderRadius: 2, overflow: 'hidden' },
  distFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  distPct: { fontSize: 10, color: '#858585', width: 28, textAlign: 'right' },
  sessionRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '2px 0', fontSize: 10,
  },
  sessionDate: { color: '#4e4e4e', flex: 1 },
  sessionLevel: { fontWeight: 600, width: 12 },
  sessionLoad: { color: '#858585' },
  resetBtn: {
    background: 'transparent', border: '1px solid #3c3c3c',
    color: '#858585', fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, padding: '4px 8px', borderRadius: 3,
    cursor: 'pointer', textAlign: 'left',
  },
};
