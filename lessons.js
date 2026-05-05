// Default fallback content when no material is uploaded
export const defaultLessons = {
  easy: {
    level: 'easy',
    label: 'Simplified',
    topic: 'Upload study material to begin',
    content: `Welcome! Upload a PDF, PowerPoint, or Word document using the Upload tab.\n\nThe system will:\n• Extract your study material\n• Generate questions at 3 difficulty levels\n• Adapt in real-time based on your emotions and focus`,
    question: 'What type of study material would you like to upload?',
    hint: 'Use the Upload tab in the sidebar to get started.',
    codeExample: `// Adaptive learning system\nconst adapt = (emotion, load) => {\n  if (['sad','fearful','angry'].includes(emotion)) return 'easy';\n  if (emotion === 'happy' && load < 35) return 'hard';\n  return 'medium';\n};`,
  },
  medium: {
    level: 'medium',
    label: 'Standard',
    topic: 'Upload study material to begin',
    content: `Welcome! Upload a PDF, PowerPoint, or Word document using the Upload tab.\n\nThe system will:\n• Extract your study material\n• Generate questions at 3 difficulty levels\n• Adapt in real-time based on your emotions and focus`,
    question: 'What topic would you like to study today?',
    hint: 'Use the Upload tab in the sidebar to get started.',
    codeExample: `// Adaptive learning system\nconst adapt = (emotion, load) => {\n  if (['sad','fearful','angry'].includes(emotion)) return 'easy';\n  if (emotion === 'happy' && load < 35) return 'hard';\n  return 'medium';\n};`,
  },
  hard: {
    level: 'hard',
    label: 'Advanced',
    topic: 'Upload study material to begin',
    content: `Welcome! Upload a PDF, PowerPoint, or Word document using the Upload tab.\n\nThe system will:\n• Extract your study material\n• Generate questions at 3 difficulty levels\n• Adapt in real-time based on your emotions and focus`,
    question: 'What advanced topic would you like to explore?',
    hint: 'Use the Upload tab in the sidebar to get started.',
    codeExample: `// Adaptive learning system\nconst adapt = (emotion, load) => {\n  if (['sad','fearful','angry'].includes(emotion)) return 'easy';\n  if (emotion === 'happy' && load < 35) return 'hard';\n  return 'medium';\n};`,
  },
};

export function getLessonLevel(emotion, cognitiveLoad) {
  if (cognitiveLoad > 65) return 'easy';
  if (['angry', 'disgusted', 'sad', 'fearful'].includes(emotion)) return 'easy';
  if ((emotion === 'happy' || emotion === 'surprised') && cognitiveLoad < 35) return 'hard';
  if (emotion === 'happy') return 'medium';
  return 'medium';
}

export function getEmotionAdvice(emotion, load) {
  if (load > 65)
    return { message: 'High cognitive load — reducing complexity', color: '#ce9178', icon: '🧠', levelChange: 'easy' };
  if (emotion === 'angry' || emotion === 'disgusted')
    return { message: 'Frustration detected — switching to easy mode', color: '#f44747', icon: '⚠', levelChange: 'easy' };
  if (emotion === 'sad' || emotion === 'fearful')
    return { message: 'Low confidence — switching to easy mode', color: '#dcdcaa', icon: '💡', levelChange: 'easy' };
  if (emotion === 'happy' && load < 35)
    return { message: 'High engagement — increasing to hard mode', color: '#4ec9b0', icon: '🚀', levelChange: 'hard' };
  if (emotion === 'surprised')
    return { message: 'Re-orienting — holding at medium', color: '#569cd6', icon: '👀', levelChange: 'medium' };
  return { message: 'Optimal learning state — medium difficulty', color: '#6a9955', icon: '✓', levelChange: 'medium' };
}

export const lessons = defaultLessons;
