// Handler Build Version: 2026-05-08 10:45 UTC
console.log("Server bridge initialized - v1.0.5");

// Force populate environment variables before importing the handler
process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
process.env.SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
process.env.GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;

import handler from '../dist/server/index.js';

export default async function (req, res) {
  try {
    // Convert Node.js request to Web Request
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const url = new URL(req.url, `${protocol}://${host}`);
    
    const request = new Request(url.href, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
      // @ts-ignore
      duplex: 'half'
    });

    const response = await handler.fetch(request, process.env);

    // Convert Web Response to Node.js response
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const body = await response.arrayBuffer();
    res.end(Buffer.from(body));
  } catch (error) {
    console.error('Server Error:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
