/**
 * CSV injection (formula injection) guard.
 *
 * Model names, organisation names and source labels come from third-party
 * registries. A value such as `=HYPERLINK("https://…")` is plain text on the
 * page but can become a formula when the CSV export is opened in Excel,
 * Numbers or Google Sheets. Prefixing those cells with an apostrophe keeps the
 * value visible while forcing spreadsheet applications to treat it as text.
 */
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function csvEscape(value: string | number | null | undefined): string {
  let text = String(value ?? "");

  if (typeof value !== "number" && FORMULA_PREFIX.test(text)) {
    text = `'${text}`;
  }

  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
