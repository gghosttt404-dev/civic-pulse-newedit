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
