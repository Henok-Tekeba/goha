/**
 * Bounded HTTP helpers for the scraper.
 *
 * The scraper runs in CI with repository-write credentials. A third-party
 * registry or XML feed must not be able to hang the job indefinitely or make
 * it buffer an unbounded response.
 */
export const DEFAULT_TIMEOUT_MS = 30_000;
export const MAX_RESPONSE_BYTES = 10 * 1024 * 1024;

export class ResponseTooLargeError extends Error {
  constructor(url, limit) {
    super(`Response from ${url} exceeds ${limit} bytes`);
    this.name = "ResponseTooLargeError";
  }
}

async function readLimitedText(response, url, maxBytes) {
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) {
    await response.body?.cancel();
    throw new ResponseTooLargeError(url, maxBytes);
  }

  if (!response.body) {
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > maxBytes) {
      throw new ResponseTooLargeError(url, maxBytes);
    }
    return text;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new ResponseTooLargeError(url, maxBytes);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks).toString("utf8");
}

export async function fetchTextLimited(
  url,
  {
    retries = 3,
    headers = {},
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxBytes = MAX_RESPONSE_BYTES,
    retryDelayMs = 2000,
    fetchImpl = fetch,
  } = {}
) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchImpl(url, {
        headers: { "User-Agent": "goha-et-scraper/1.0", ...headers },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await readLimitedText(response, url, maxBytes);
    } catch (error) {
      if (error instanceof ResponseTooLargeError) throw error;
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelayMs * attempt)
        );
      }
    }
  }

  throw lastError ?? new Error(`Could not fetch ${url}`);
}
