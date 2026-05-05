import React, { useEffect, useRef, useState } from 'react';

const MAX_POINTS = 60;
const EMOTION_COLORS = {
  happy: '#4ec9b0', neutral: '#858585', sad: '#569cd6',
  angry: '#f44747', disgusted: '#ce9178', surprised: '#dcdcaa', fearful: '#c586c0',
};
const LEVEL_COLORS = { easy: '#4ec9b0', medium: '#dcdcaa', hard: '#c586c0' };

export default function AttentionHeatmap({ emotion, load, level }) {
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    setPoints(prev => {
      const next = [...prev, { emotion, load, level, time: Date.now() }];
      return next.slice(-MAX_POINTS);
    });
  }, [emotion, load, level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const padL = 8, padR = 8, padT = 8, padB = 20;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    // Grid lines
    ctx.strokeStyle = '#2d2d2d';
    ctx.lineWidth = 0.5;
    [25, 50, 75].forEach(y => {
      const yPos = padT + chartH - (y / 100) * chartH;
      ctx.beginPath();
      ctx.moveTo(padL, yPos);
      ctx.lineTo(W - padR, yPos);
      ctx.stroke();
    });

    // Load area fill
    ctx.beginPath();
    points.forEach((pt, i) => {
      const x = padL + (i / (MAX_POINTS - 1)) * chartW;
      const y = padT + chartH - (pt.load / 100) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    const lastX = padL + ((points.length - 1) / (MAX_POINTS - 1)) * chartW;
    ctx.lineTo(lastX, padT + chartH);
    ctx.lineTo(padL, padT + chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, 'rgba(244,71,71,0.25)');
    grad.addColorStop(1, 'rgba(244,71,71,0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Load line
    ctx.beginPath();
    ctx.strokeStyle = '#f44747';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    points.forEach((pt, i) => {
      const x = padL + (i / (MAX_POINTS - 1)) * chartW;
      const y = padT + chartH - (pt.load / 100) * chartH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Emotion dots
    points.forEach((pt, i) => {
      const x = padL + (i / (MAX_POINTS - 1)) * chartW;
      const y = padT + chartH - (pt.load / 100) * chartH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = EMOTION_COLORS[pt.emotion] || '#858585';
      ctx.fill();
    });

    // Level change markers
    let prevLevel = null;
    points.forEach((pt, i) => {
      if (pt.level !== prevLevel && prevLevel !== null) {
        const x = padL + (i / (MAX_POINTS - 1)) * chartW;
        ctx.strokeStyle = LEVEL_COLORS[pt.level] || '#858585';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + chartH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Level label
        ctx.fillStyle = LEVEL_COLORS[pt.level] || '#858585';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(pt.level[0].toUpperCase(), x + 2, padT + 10);
      }
      prevLevel = pt.level;
    });

    // Y axis labels
    ctx.fillStyle = '#4e4e4e';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ['100', '75', '50', '25', '0'].forEach((label, i) => {
      ctx.fillText(label, 0, padT + (i / 4) * chartH + 3);
    });

  }, [points]);

  const latest = points[points.length - 1];

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.dot} />
        <span style={styles.title}>attention_heatmap.tsx</span>
        <span style={styles.pts}>{points.length}/{MAX_POINTS} pts</span>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <span style={styles.legendComment}>// signal legend</span>
        <div style={styles.legendItems}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendLine, background: '#f44747' }} />
            <span style={styles.legendLabel}>cognitive load</span>
          </div>
          {['happy', 'angry', 'sad', 'neutral'].map(e => (
            <div key={e} style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: EMOTION_COLORS[e] }} />
              <span style={{ ...styles.legendLabel, color: EMOTION_COLORS[e] }}>{e}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={styles.canvasWrap}>
        <canvas ref={canvasRef} width={440} height={110} style={styles.canvas} />
      </div>

      {/* Current readout */}
      {latest && (
        <div style={styles.readout}>
          <div style={styles.readoutItem}>
            <span style={styles.readoutLabel}>load</span>
            <span style={{ color: latest.load > 65 ? '#f44747' : latest.load > 35 ? '#dcdcaa' : '#4ec9b0', fontWeight: 600 }}>
              {latest.load}%
            </span>
          </div>
          <div style={styles.readoutItem}>
            <span style={styles.readoutLabel}>emotion</span>
            <span style={{ color: EMOTION_COLORS[latest.emotion] || '#858585' }}>{latest.emotion}</span>
          </div>
          <div style={styles.readoutItem}>
            <span style={styles.readoutLabel}>level</span>
            <span style={{ color: LEVEL_COLORS[latest.level] }}>{latest.level}</span>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    background: '#252526',
    borderTop: '1px solid #3c3c3c',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px',
    borderBottom: '1px solid #3c3c3c',
    background: '#2d2d2d',
  },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#569cd6', flexShrink: 0 },
  title: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#569cd6', flex: 1 },
  pts: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#4e4e4e' },
  legend: { padding: '6px 12px 2px' },
  legendComment: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#6a9955' },
  legendItems: { display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4 },
  legendLine: { width: 16, height: 2, borderRadius: 1 },
  legendDot: { width: 6, height: 6, borderRadius: '50%' },
  legendLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#858585' },
  canvasWrap: { padding: '4px 12px' },
  canvas: { width: '100%', height: 110, display: 'block' },
  readout: {
    display: 'flex', gap: 20, padding: '4px 12px 8px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  readoutItem: { display: 'flex', gap: 6, alignItems: 'center' },
  readoutLabel: { fontSize: 10, color: '#4e4e4e' },
};
