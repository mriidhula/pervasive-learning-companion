const http = require('http');
const https = require('https');

const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || '';
const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/claude') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const proxy = https.request(options, (apiRes) => {
      res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
      apiRes.pipe(res);
    });

    proxy.on('error', (err) => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: { message: err.message } }));
    });

    proxy.write(body);
    proxy.end();
  });
});

server.listen(PORT, () => {
  console.log(`✅ Proxy running at http://localhost:${PORT}`);
  console.log(`   API key: ${API_KEY ? API_KEY.slice(0,12) + '...' : '❌ NOT SET — add REACT_APP_ANTHROPIC_API_KEY to .env'}`);
});
