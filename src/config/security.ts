/**
 * Baseline CSP for the static export.
 *
 * GitHub Pages cannot send response headers, so this is delivered as a
 * `<meta http-equiv>` policy. A meta policy cannot express `frame-ancestors`
 * or `report-uri`; those require the host/proxy to send a real
 * `Content-Security-Policy` header (see SECURITY.md).
 *
 * Next.js emits inline bootstrap scripts, so `script-src` has to allow
 * `'unsafe-inline'`. `script-src-attr 'none'` still blocks inline event
 * handlers, and the markdown sanitizer removes markup that could execute in
 * the first place. `style-src 'unsafe-inline'` is required by React inline
 * styles and the chart components.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://gc.zgo.at",
  "script-src-attr 'none'",
  "connect-src 'self' https://*.goatcounter.com",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

/**
 * Full response-header policy for a host/proxy that can send headers.
 *
 * It deliberately extends the meta policy rather than replacing it: both
 * policies are enforced when present, and the header adds the directives a
 * <meta> element cannot express. Keep the common prefix generated from the
 * same constant so the two can never drift.
 */
export const CONTENT_SECURITY_POLICY_HEADER = `${CONTENT_SECURITY_POLICY}; frame-ancestors 'none'`;

export const SECURITY_RESPONSE_HEADERS = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY_HEADER,
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)",
} as const;

export type SecurityResponseHeader = keyof typeof SECURITY_RESPONSE_HEADERS;
