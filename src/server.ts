import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(error) {
  const message = error?.message || "Unknown Server Error";
  const stack = error?.stack || "No stack trace available";

  return new Response(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Server Error</title>
        <style>
          body { font-family: monospace; padding: 2rem; background: #1a1a1a; color: #ff4d4d; }
          pre { background: #000; padding: 1rem; border-radius: 4px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Server Error</h1>
        <p><strong>Message:</strong> ${message}</p>
        <pre>${stack}</pre>
        <hr/>
        <button onclick="location.reload()">Try Again</button>
      </body>
    </html>
  `, {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      
      if (response.status >= 500) {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
           const body = await response.clone().text();
           console.error("SSR Error Payload:", body);
        }
      }
      
      return response;
    } catch (error: any) {
      console.error("Fatal Fetch Error:", error);
      return brandedErrorResponse(error);
    }
  },
};
