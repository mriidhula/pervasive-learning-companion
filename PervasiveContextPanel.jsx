import React from 'react';

const TIME_ICONS = { morning: '🌅', afternoon: '☀️', evening: '🌆', night: '🌙' };

function ContextRow({ label, value, sub, color, barVal }) {
  return (
    <div style={styles.row}>
      <div style={styles.rowTop}>
        <span style={styles.label}>{label}</span>
        <span style={{ ...styles.value, color: color || 'var(--vsc-text)' }}>{value}</span>
      </div>
      {sub && <div style={styles.sub}>{sub}</div>}
      {barVal !== undefined && (
        <div style={styles.barBg}>
          <div style={{ ...styles.barFill, width: `${barVal}%`, background: color || '#569cd6' }} />
        </div>
      )}
    </div>
  );
}

export default function PervasiveContextPanel({ context, frustration }) {
  const stressColor = context.ambientStress > 40 ? '#f44747' : context.ambientStress > 20 ? '#dcdcaa' : '#4ec9b0';
  const riskColor = frustration.risk > 60 ? '#f44747' : frustration.risk > 35 ? '#dcdcaa' : '#4ec9b0';
  const batteryColor = context.battery !== null
    ? context.battery < 20 ? '#f44747' : context.battery < 40 ? '#dcdcaa' : '#4ec9b0'
    : '#858585';

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.dot} />
        <span style={styles.title}>pervasive_context.ts</span>
      </div>

      <div style={styles.body}>
        {/* Context signals */}
        <div style={styles.section}>
          <div style={styles.comment}>// ambient signals</div>

          <ContextRow
            label="timeOfDay"
            value={`${TIME_ICONS[context.timeOfDay]} ${context.timeOfDay}`}
            sub={`${context.hour}:00 hrs`}
            color="#dcdcaa"
          />
          <ContextRow
            label="battery"
            value={context.battery !== null ? `${context.battery}%` : 'n/a'}
            color={batteryColor}
            barVal={context.battery ?? 100}
          />
          <ContextRow
            label="sessionTime"
            value={`${context.sessionMinutes}m`}
            sub={context.sessionMinutes > 40 ? 'consider a break' : 'active'}
            color={context.sessionMinutes > 40 ? '#dcdcaa' : '#4ec9b0'}
          />
          <ContextRow
            label="ambientStress"
            value={`${context.ambientStress}%`}
            color={stressColor}
            barVal={context.ambientStress}
          />
        </div>

        <div style={styles.divider} />

        {/* Frustration prediction */}
        <div style={styles.section}>
          <div style={styles.comment}>// frustration predictor</div>

          <ContextRow
            label="risk"
            value={`${frustration.risk}%`}
            color={riskColor}
            barVal={frustration.risk}
          />
          <ContextRow
            label="trend"
            value={frustration.trend}
            color={frustration.trend === 'rising' ? '#f44747' : frustration.trend === 'falling' ? '#4ec9b0' : '#858585'}
          />

          {frustration.warning && (
            <div style={{ ...styles.alert, borderColor: riskColor + '60', background: riskColor + '15' }}>
              <span style={{ color: riskColor, fontSize: 10 }}>⚠ </span>
              <span style={{ color: riskColor, fontSize: 10 }}>{frustration.message}</span>
            </div>
          )}

          {!frustration.warning && frustration.risk < 30 && (
            <div style={{ ...styles.alert, borderColor: '#4ec9b060', background: '#4ec9b015' }}>
              <span style={{ color: '#4ec9b0', fontSize: 10 }}>✓ Optimal state</span>
            </div>
          )}
        </div>

        <div style={styles.divider} />

        {/* Context recommendation */}
        <div style={styles.section}>
          <div style={styles.comment}>// context recommendation</div>
          <div style={styles.recWrap}>
            <span style={styles.keyword}>suggest</span>
            <span style={styles.punct}>(</span>
            <span style={{
              color: context.recommendation === 'easy' ? '#4ec9b0' : context.recommendation === 'hard' ? '#c586c0' : '#dcdcaa',
              fontWeight: 600,
            }}>
              "{context.recommendation}"
            </span>
            <span style={styles.punct}>)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: '#252526',
    borderLeft: '1px solid #3c3c3c',
    display: 'flex',
    flexDirection: 'column',
    width: 200,
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
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#c586c0', flexShrink: 0 },
  title: { fontSize: 11, color: '#c586c0' },
  body: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' },
  section: { padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 },
  comment: { fontSize: 10, color: '#6a9955', marginBottom: 2 },
  divider: { height: 1, background: '#3c3c3c', margin: '0 12px' },
  row: { display: 'flex', flexDirection: 'column', gap: 2 },
  rowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 10, color: '#9cdcfe' },
  value: { fontSize: 11, fontWeight: 500 },
  sub: { fontSize: 10, color: '#4e4e4e' },
  barBg: { height: 3, background: '#3c3c3c', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  alert: {
    border: '1px solid',
    borderRadius: 3,
    padding: '5px 7px',
    lineHeight: 1.4,
  },
  recWrap: { fontSize: 12, lineHeight: 2 },
  keyword: { color: '#569cd6' },
  punct: { color: '#d4d4d4' },
};
