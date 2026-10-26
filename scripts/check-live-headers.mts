/**
 * Read-only verification of the deployed response-header policy.
 *
 *   pnpm check:headers
 *   pnpm check:headers https://goha.enoch.et/
 *   pnpm check:headers http://127.0.0.1:8090/
 *
 * This checks the actual HTTP response. A meta tag in the HTML is not a
 * substitute and is reported separately.
 */
import { SECURITY_RESPONSE_HEADERS } from "../src/config/security";

const target =
  process.argv[2] ?? process.env.HEADER_CHECK_URL ?? "https://goha.enoch.et/";
const failures: string[] = [];

const response = await fetch(target, {
  method: "GET",
  redirect: "follow",
  headers: { "user-agent": "goha-header-check/1.0" },
  signal: AbortSignal.timeout(15_000),
});

if (!response.ok) {
  failures.push(`expected a 2xx response, got ${response.status}`);
}

function header(name: string): string | null {
  return response.headers.get(name);
}

for (const [name, expected] of Object.entries(SECURITY_RESPONSE_HEADERS)) {
  const actual = header(name);
  if (!actual) {
    failures.push(`${name}: missing`);
    continue;
  }

  if (name === "Content-Security-Policy") {
    for (const directive of [
      "frame-ancestors 'none'",
      "script-src-attr 'none'",
      "object-src 'none'",
    ]) {
      if (!actual.includes(directive)) {
        failures.push(`${name}: missing "${directive}" (got: ${actual})`);
      }
    }
    if (actual.includes("unsafe-eval")) {
      failures.push(`${name}: contains unsafe-eval`);
    }
    continue;
  }

  if (name === "Strict-Transport-Security") {
    const maxAge = Number(actual.match(/max-age=(\d+)/)?.[1] ?? 0);
    if (!Number.isFinite(maxAge) || maxAge < 31_536_000) {
      failures.push(`${name}: max-age is below one year (got: ${actual})`);
    }
    if (!/includesubdomains/i.test(actual)) {
      failures.push(`${name}: missing includeSubDomains (got: ${actual})`);
    }
    if (/preload/i.test(actual)) {
      failures.push(`${name}: preload is not approved by this policy`);
    }
    continue;
  }

  if (actual !== expected) {
    failures.push(`${name}: expected "${expected}", got "${actual}"`);
  }
}

const meta = (await response.text()).match(
  /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/i
);
if (!meta) failures.push("HTML: no meta CSP fallback found");

console.info(`Header check: ${target}`);
for (const [name, value] of Object.entries(SECURITY_RESPONSE_HEADERS)) {
  console.info(`  ${name}: ${header(name) ?? "(missing)"}`);
}
console.info(`  meta CSP fallback: ${meta ? "present" : "missing"}`);

if (failures.length > 0) {
  console.error("\nFAIL");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.info("\nPASS — effective headers match the approved policy.");
}
