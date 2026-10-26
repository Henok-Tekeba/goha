import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";

import {
  fetchTextLimited,
  MAX_RESPONSE_BYTES,
  ResponseTooLargeError,
} from "./http.mjs";

let server;
let baseUrl;

before(async () => {
  server = createServer((request, response) => {
    if (request.url === "/ok") {
      response.writeHead(200, { "content-type": "text/plain" });
      response.end("hello");
      return;
    }
    if (request.url === "/too-large-header") {
      response.writeHead(200, { "content-length": "2048" });
      response.end("x".repeat(2048));
      return;
    }
    if (request.url === "/too-large-stream") {
      response.writeHead(200, { "content-type": "text/plain" });
      response.write("x".repeat(128));
      response.end("y".repeat(128));
      return;
    }
    if (request.url === "/slow") {
      setTimeout(() => {
        response.writeHead(200, { "content-type": "text/plain" });
        response.end("late");
      }, 250);
      return;
    }
    response.writeHead(404);
    response.end();
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
});

test("returns a bounded text response", async () => {
  assert.equal(await fetchTextLimited(`${baseUrl}/ok`), "hello");
});

test("rejects an oversized declared response", async () => {
  await assert.rejects(
    fetchTextLimited(`${baseUrl}/too-large-header`, { maxBytes: 100 }),
    ResponseTooLargeError
  );
});

test("rejects an oversized streamed response without content-length", async () => {
  await assert.rejects(
    fetchTextLimited(`${baseUrl}/too-large-stream`, { maxBytes: 100 }),
    ResponseTooLargeError
  );
});

test("times out a stalled response", async () => {
  await assert.rejects(
    fetchTextLimited(`${baseUrl}/slow`, {
      timeoutMs: 50,
      retries: 1,
    }),
    (error) => error.name === "TimeoutError" || /aborted/i.test(error.message)
  );
});

test("the default limit is finite and reasonable", () => {
  assert.equal(MAX_RESPONSE_BYTES, 10 * 1024 * 1024);
});
