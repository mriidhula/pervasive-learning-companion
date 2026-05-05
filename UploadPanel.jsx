import React, { useState, useRef, useCallback } from 'react';

const s = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#1e1e1e' },
  header: { padding: '12px 16px', borderBottom: '1px solid #3c3c3c', flexShrink: 0 },
  comment: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6a9955' },
  body: { flex: 1, overflow: 'auto', padding: '24px' },
  dropzone: {
    border: '2px dashed #3c3c3c', borderRadius: 8, padding: '40px 24px',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 24,
  },
  dropzoneActive: { border: '2px dashed #007acc', background: '#007acc10' },
  uploadIcon: { fontSize: 40, marginBottom: 12 },
  uploadTitle: { fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#d4d4d4', marginBottom: 6 },
  uploadSub: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#858585' },
  fileTypes: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 },
  fileTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: '3px 8px', borderRadius: 3, border: '1px solid #3c3c3c', color: '#858585' },
  fileInfo: { background: '#252526', border: '1px solid #3c3c3c', borderRadius: 6, padding: '14px 16px', marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" },
  fileName: { fontSize: 13, color: '#d4d4d4', marginBottom: 4 },
  fileSize: { fontSize: 11, color: '#858585' },
  orDivider: { textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#4e4e4e', margin: '16px 0' },
  textArea: { width: '100%', background: '#0d0d0d', border: '1px solid #3c3c3c', borderRadius: 4, color: '#d4d4d4', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: '10px 12px', resize: 'vertical', outline: 'none', marginBottom: 8, lineHeight: 1.6, boxSizing: 'border-box' },
  generateBtn: { width: '100%', background: '#007acc', color: '#fff', border: 'none', borderRadius: 4, padding: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, cursor: 'pointer', fontWeight: 600, marginBottom: 12 },
  generateBtnDisabled: { background: '#3c3c3c', cursor: 'not-allowed', color: '#858585' },
  progressWrap: { height: 3, background: '#3c3c3c', borderRadius: 2, marginBottom: 12 },
  progressBar: { height: 3, background: '#007acc', borderRadius: 2, transition: 'width 0.3s ease' },
  statusBox: { background: '#0d0d0d', border: '1px solid #3c3c3c', borderRadius: 4, padding: '12px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#858585', minHeight: 60 },
  statusLine: { marginBottom: 4, lineHeight: 1.5 },
  successBox: { background: '#4ec9b010', border: '1px solid #4ec9b040', borderRadius: 6, padding: '14px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginTop: 16 },
  clearBtn: { marginTop: 12, background: 'transparent', border: '1px solid #3c3c3c', color: '#858585', borderRadius: 3, padding: '6px 14px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: 'pointer' },
};

const SYSTEM_PROMPT = `You are an adaptive learning content generator. Given study material, generate 3 lesson versions at different difficulty levels. Respond with ONLY valid JSON, no markdown, no backticks, no explanation.`;

const PROMPT_SUFFIX = `
Based on the study material above, respond with ONLY this JSON (no markdown, no backticks):
{"topic":"Main topic name (3-6 words)","lessons":{"easy":{"level":"easy","label":"Simplified","topic":"Simple title","content":"Beginner explanation, max 200 words, use \\n for line breaks and \\n• for bullets","question":"Simple recall question","hint":"Helpful hint","codeExample":"// simple example or key concept"},"medium":{"level":"medium","label":"Standard","topic":"Standard title","content":"Intermediate explanation, max 250 words","question":"Comprehension question","hint":"Hint","codeExample":"// intermediate example"},"hard":{"level":"hard","label":"Advanced","topic":"Advanced title","content":"In-depth technical explanation, max 300 words","question":"Analytical or design question","hint":"Technical hint","codeExample":"// advanced example"}}}`;

export default function UploadPanel({ onLessonsGenerated }) {
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [statusLines, setStatusLines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generated, setGenerated] = useState(null);
  const inputRef = useRef();

  const addStatus = (msg) => setStatusLines(prev => [...prev, msg]);

  const handleFile = useCallback((f) => {
    setFile(f);
    setStatusLines([]);
    setGenerated(null);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const generateLessons = async () => {
    if (!file && !pastedText.trim()) return;
    setLoading(true);
    setProgress(10);
    setStatusLines([]);
    setGenerated(null);

    try {
      let messages = [];

      if (file && file.type === 'application/pdf') {
        addStatus('📄 Reading PDF...');
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setProgress(30);
        messages = [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
            { type: 'text', text: PROMPT_SUFFIX }
          ]
        }];
      } else {
        const text = pastedText.trim() || (file ? `Study material from file: ${file.name}` : '');
        addStatus('📄 Preparing content...');
        setProgress(30);
        messages = [{ role: 'user', content: text + '\n\n' + PROMPT_SUFFIX }];
      }

      addStatus('🤖 Generating adaptive lessons with Claude...');
      setProgress(50);

      const response = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      setProgress(80);

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`);
      }
      if (!data.content || !data.content.length) {
        throw new Error(`Empty response from API: ${JSON.stringify(data).slice(0, 300)}`);
      }

      addStatus('📝 Parsing lessons...');

      const raw = data.content.map(b => b.text || '').join('').trim();
      const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(clean);

      setProgress(100);
      addStatus('✅ Lessons generated successfully!');
      setGenerated(parsed);
      onLessonsGenerated(parsed.lessons, parsed.topic);

    } catch (err) {
      addStatus(`❌ Error: ${err.message}`);
      console.error('UploadPanel error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (b) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
  const canGenerate = (file || pastedText.trim()) && !loading;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.comment}>// upload study material — pdf, pptx, docx, or paste text</span>
      </div>
      <div style={s.body}>

        <div
          style={{ ...s.dropzone, ...(dragging ? s.dropzoneActive : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div style={s.uploadIcon}>📂</div>
          <div style={s.uploadTitle}>Drop your study material here</div>
          <div style={s.uploadSub}>or click to browse</div>
          <div style={s.fileTypes}>
            {['.pdf', '.pptx', '.docx', '.txt'].map(t => <span key={t} style={s.fileTag}>{t}</span>)}
          </div>
          <input ref={inputRef} type="file" style={{ display: 'none' }} accept=".pdf,.pptx,.docx,.txt,.md"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
        </div>

        {file && (
          <div style={s.fileInfo}>
            <div style={s.fileName}>📄 {file.name}</div>
            <div style={s.fileSize}>{fmt(file.size)}</div>
          </div>
        )}

        <div style={s.orDivider}>── or paste text content ──</div>

        <textarea
          style={s.textArea} rows={5}
          placeholder="// Paste lecture notes, textbook content, or any study material here..."
          value={pastedText}
          onChange={e => setPastedText(e.target.value)}
        />

        <button
          style={{ ...s.generateBtn, ...(!canGenerate ? s.generateBtnDisabled : {}) }}
          onClick={generateLessons}
          disabled={!canGenerate}
        >
          {loading ? '⏳ Generating lessons...' : '▶ Generate Adaptive Lessons'}
        </button>

        {loading && (
          <div style={s.progressWrap}>
            <div style={{ ...s.progressBar, width: `${progress}%` }} />
          </div>
        )}

        {statusLines.length > 0 && (
          <div style={s.statusBox}>
            {statusLines.map((msg, i) => <div key={i} style={s.statusLine}>{msg}</div>)}
          </div>
        )}

        {generated && (
          <div style={s.successBox}>
            <div style={{ color: '#4ec9b0', fontSize: 13, marginBottom: 8 }}>
              ✓ Topic: <span style={{ color: '#d4d4d4' }}>{generated.topic}</span>
            </div>
            {['easy', 'medium', 'hard'].map(lvl => (
              <div key={lvl} style={{ fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: { easy: '#4ec9b0', medium: '#dcdcaa', hard: '#c586c0' }[lvl] }}>[{lvl.toUpperCase()}]</span>
                <span style={{ color: '#858585' }}> {generated.lessons[lvl]?.topic}</span>
              </div>
            ))}
            <button style={s.clearBtn} onClick={() => { setFile(null); setPastedText(''); setGenerated(null); setStatusLines([]); setProgress(0); }}>
              ↺ Upload new material
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
