import React, { useState, useEffect } from 'react';

const LEVEL_COLORS = { easy: '#4ec9b0', medium: '#dcdcaa', hard: '#c586c0' };
const LEVEL_NUMS = { easy: 1, medium: 2, hard: 3 };

function CodeBlock({ code }) {
  return (
    <div style={styles.codeBlock}>
      <div style={styles.codeLang}>javascript</div>
      <pre style={styles.codePre}>{code}</pre>
    </div>
  );
}

function LineNumber({ n }) {
  return <span style={styles.lineNum}>{n}</span>;
}

export default function LessonEditor({ lesson, advice, isTransitioning, onManualOverride }) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [prevLevel, setPrevLevel] = useState(lesson.level);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (lesson.level !== prevLevel) {
      setFlash(true);
      setPrevLevel(lesson.level);
      setTimeout(() => setFlash(false), 800);
    }
  }, [lesson.level]);

  const color = LEVEL_COLORS[lesson.level];
  const lines = lesson.content.split('\n');

  return (
    <div style={{ ...styles.editor, opacity: isTransitioning ? 0.6 : 1, transition: 'opacity 0.3s' }}>
      {/* Tab bar */}
      <div style={styles.tabBar}>
        <div style={{ ...styles.tab, ...styles.tabActive }}>
          <span style={{ color }}>●</span>
          <span style={styles.tabName}>lesson_{lesson.level}.md</span>
        </div>
        <div style={styles.tab}>
          <span style={styles.tabName}>answer.js</span>
        </div>
        <div style={styles.tab}>
          <span style={styles.tabName}>context_engine.ts</span>
        </div>
        <div style={styles.tabSpacer} />
        {/* Manual override buttons */}
        {['easy', 'medium', 'hard'].map(lvl => (
          <button
            key={lvl}
            onClick={() => onManualOverride(lvl)}
            style={{
              ...styles.overrideBtn,
              background: lesson.level === lvl ? `${LEVEL_COLORS[lvl]}25` : 'transparent',
              color: lesson.level === lvl ? LEVEL_COLORS[lvl] : '#858585',
              border: `1px solid ${lesson.level === lvl ? LEVEL_COLORS[lvl] + '60' : '#3c3c3c'}`,
            }}
          >
            {lvl}
          </button>
        ))}
        {/* Adaptation badge */}
        <div style={{ ...styles.adaptBadge, background: `${color}15`, border: `1px solid ${color}40`, color }}>
          {advice.icon} {advice.message}
        </div>
      </div>

      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.bcItem}>pervasive-learning</span>
        <span style={styles.bcSep}>›</span>
        <span style={styles.bcItem}>modules</span>
        <span style={styles.bcSep}>›</span>
        <span style={{ ...styles.bcItem, color }}>lesson_{lesson.level}.md</span>
        <span style={styles.bcSep}>›</span>
        <span style={styles.bcItem}>{lesson.topic}</span>
      </div>

      <div style={styles.editorBody}>
        {/* Line numbers + content */}
        <div style={styles.lineNums}>
          {Array.from({ length: Math.max(lines.length + 20, 30) }, (_, i) => (
            <LineNumber key={i} n={i + 1} />
          ))}
        </div>

        <div style={styles.content}>
          {/* Level indicator */}
          <div style={{ ...styles.levelTag, background: `${color}20`, border: `1px solid ${color}40` }}>
            <span style={{ color, fontWeight: 600 }}>
              {'//'.padEnd(2)} DIFFICULTY LEVEL {LEVEL_NUMS[lesson.level]} — {lesson.label.toUpperCase()}
            </span>
          </div>

          {/* Topic heading */}
          <div style={styles.heading}>
            <span style={styles.hash}># </span>
            <span style={styles.headingText}>{lesson.topic}</span>
          </div>

          {/* Content */}
          <div style={styles.textBlock}>
            {lines.map((line, i) => (
              <div key={i} style={styles.textLine}>
                {line.startsWith('•') ? (
                  <span><span style={{ color: '#569cd6' }}>•</span>{line.slice(1)}</span>
                ) : line.match(/^\d\./) ? (
                  <span><span style={{ color: '#ce9178' }}>{line.slice(0, 2)}</span>{line.slice(2)}</span>
                ) : line}
              </div>
            ))}
          </div>

          {/* Code example */}
          <CodeBlock code={lesson.codeExample} />

          {/* Question */}
          <div style={styles.questionWrap}>
            <div style={styles.questionLabel}>
              <span style={{ color: '#c586c0' }}>?? </span>
              <span style={{ color: '#c586c0', fontWeight: 500 }}>Exercise</span>
            </div>
            <div style={styles.questionText}>{lesson.question}</div>
            <div style={styles.hint}>
              <span style={{ color: '#6a9955' }}>{'// hint: '}</span>
              <span style={{ color: '#858585' }}>{lesson.hint}</span>
            </div>
          </div>

          {/* Answer area */}
          <div style={styles.answerWrap}>
            <div style={styles.answerLabel}>
              <span style={{ color: '#dcdcaa' }}>your_answer</span>
              <span style={{ color: '#d4d4d4' }}> = </span>
              <span style={{ color: '#ce9178' }}>`</span>
            </div>
            <textarea
              style={styles.textarea}
              value={answer}
              onChange={e => { setAnswer(e.target.value); setSubmitted(false); }}
              placeholder="// Type your answer here..."
              rows={4}
            />
            <span style={{ color: '#ce9178', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>`;</span>
          </div>

          {!submitted ? (
            <button style={styles.submitBtn} onClick={() => setSubmitted(true)}>
              ▶ Run & Submit
            </button>
          ) : (
            <div style={styles.successMsg}>
              <span style={{ color: '#4ec9b0' }}>✓ Answer recorded</span>
              <span style={{ color: '#858585' }}> — system adapting to your response...</span>
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={styles.statusBar}>
        <span style={styles.statusItem}>Ln 1, Col 1</span>
        <span style={styles.statusItem}>UTF-8</span>
        <span style={styles.statusItem}>Markdown</span>
        <div style={styles.statusSpacer} />
        <span style={{ ...styles.statusItem, background: `${color}30`, color, padding: '0 8px' }}>
          Level: {lesson.label}
        </span>
        <span style={styles.statusItem}>Pervasive Learning Companion v1.0</span>
      </div>
    </div>
  );
}

const styles = {
  editor: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1e1e1e' },
  tabBar: {
    display: 'flex', alignItems: 'center',
    background: '#2d2d2d',
    borderBottom: '1px solid #3c3c3c',
    height: 36, flexShrink: 0, overflow: 'hidden',
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '0 14px', height: '100%',
    borderRight: '1px solid #3c3c3c',
    cursor: 'pointer', color: '#858585', fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
  },
  tabActive: { background: '#1e1e1e', color: '#d4d4d4', borderTop: '1px solid #007acc' },
  tabName: { fontSize: 12 },
  tabSpacer: { flex: 1 },
  overrideBtn: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, padding: '3px 10px',
    borderRadius: 3, cursor: 'pointer',
    marginLeft: 4, transition: 'all 0.2s',
    textTransform: 'uppercase', letterSpacing: 0.5,
    fontWeight: 500,
  },
  adaptBadge: {
    fontSize: 11, padding: '3px 10px', borderRadius: 3,
    fontFamily: "'JetBrains Mono', monospace",
    margin: '0 10px', flexShrink: 0,
    transition: 'all 0.5s ease',
  },
  breadcrumb: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 16px', background: '#1e1e1e',
    borderBottom: '1px solid #2d2d2d', flexShrink: 0,
  },
  bcItem: { fontSize: 11, color: '#858585', fontFamily: "'JetBrains Mono', monospace" },
  bcSep: { fontSize: 11, color: '#4e4e4e' },
  editorBody: { flex: 1, display: 'flex', overflow: 'auto' },
  lineNums: {
    display: 'flex', flexDirection: 'column',
    padding: '16px 8px', background: '#1e1e1e',
    borderRight: '1px solid #2d2d2d', userSelect: 'none', flexShrink: 0,
  },
  lineNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, color: '#4e4e4e', lineHeight: '1.6',
    textAlign: 'right', minWidth: 28, display: 'block',
  },
  content: { flex: 1, padding: '16px 24px', overflow: 'auto' },
  levelTag: {
    padding: '6px 12px', borderRadius: 3, marginBottom: 16,
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
    transition: 'all 0.5s ease',
  },
  heading: { marginBottom: 14 },
  hash: { color: '#569cd6', fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600 },
  headingText: { color: '#d4d4d4', fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500 },
  textBlock: { marginBottom: 20 },
  textLine: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, color: '#d4d4d4', lineHeight: 1.7, marginBottom: 2,
  },
  codeBlock: {
    background: '#0d0d0d', border: '1px solid #3c3c3c',
    borderRadius: 4, marginBottom: 20, overflow: 'hidden',
  },
  codeLang: {
    padding: '4px 12px', background: '#2d2d2d',
    fontSize: 10, color: '#858585',
    fontFamily: "'JetBrains Mono', monospace",
    borderBottom: '1px solid #3c3c3c',
  },
  codePre: {
    padding: '14px 16px', margin: 0,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, color: '#d4d4d4', lineHeight: 1.7,
    overflow: 'auto', whiteSpace: 'pre',
  },
  questionWrap: {
    background: '#252526', border: '1px solid #3c3c3c',
    borderRadius: 4, padding: '12px 14px', marginBottom: 16,
  },
  questionLabel: { marginBottom: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 },
  questionText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, color: '#d4d4d4', lineHeight: 1.6, marginBottom: 8,
  },
  hint: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11 },
  answerWrap: { marginBottom: 12 },
  answerLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, marginBottom: 4,
  },
  textarea: {
    width: '100%', background: '#0d0d0d',
    border: '1px solid #3c3c3c', borderRadius: 3,
    color: '#ce9178', fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, padding: '10px 12px', resize: 'vertical',
    lineHeight: 1.6, outline: 'none',
  },
  submitBtn: {
    background: '#007acc', color: '#fff',
    border: 'none', borderRadius: 3,
    padding: '7px 20px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, cursor: 'pointer', fontWeight: 500,
  },
  successMsg: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, padding: '6px 0',
  },
  statusBar: {
    display: 'flex', alignItems: 'center', gap: 0,
    background: '#007acc', height: 22, flexShrink: 0,
  },
  statusItem: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: '#fff', padding: '0 10px',
    height: '100%', display: 'flex', alignItems: 'center',
  },
  statusSpacer: { flex: 1 },
};
