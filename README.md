# Pervasive Learning Companion v2

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create your `.env` file:
   ```
   cp .env.example .env
   ```
   Open `.env` and paste your Anthropic API key (from console.anthropic.com → API Keys):
   ```
   REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
   ```

## Running

You need **two terminals** open in the project folder:

**Terminal 1 — proxy server:**
```
node server.js
```
You should see: `✅ Proxy running at http://localhost:3001`

**Terminal 2 — React app:**
```
npm start
```

Then open http://localhost:3000

## Emotion → Difficulty mapping

| Emotion            | Load   | Level  |
|--------------------|--------|--------|
| sad / fearful      | any    | easy   |
| angry / disgusted  | any    | easy   |
| any                | > 65%  | easy   |
| happy / surprised  | < 35%  | hard   |
| neutral            | normal | medium |
