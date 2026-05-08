import handler from '../dist/server/index.js';

export default async function (request) {
  // TanStack Start build outputs a fetch handler.
  // The Vercel Node.js runtime (as of recent versions) supports the Web Request/Response API.
  return handler.fetch(request);
}
