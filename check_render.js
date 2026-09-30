const https = require('https');

function check() {
  https.get('https://url-shortner-lrbt.onrender.com/health', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('TIMESTAMP:', new Date().toISOString());
      console.log('RENDER HEALTH:', res.statusCode, body);
    });
  }).on('error', err => {
    console.error('FETCH ERROR:', err.message);
  });
}

check();
