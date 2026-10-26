/**
 * Ethiopian-language evidence check.
 *
 * A scraped record only belongs in the index when the record ITSELF shows an
 * Ethiopian connection: its name part, its declared language fields, its
 * tags, or its text. The OWNER/HANDLE must never count as evidence — HF
 * search matches author names too (e.g. "geezyforeezy" matches "geez").
 *
 * Two marker groups:
 *  - LANGUAGE_NAME_MARKERS: plain substrings (long enough to be safe)
 *  - LANGUAGE_CODE_RE: short ISO codes, only matched on word boundaries
 */

export const LANGUAGE_NAME_MARKERS = [
  "amharic",
  "tigrinya",
  "tigre",
  "oromo",
  "afaan",
  "geez",
  "ge-ez",
  "somali",
  "ethiopia",
  "ethiopian",
  "ethio",
  "wolaytta",
  "wolaitta",
  "welayta",
  "sidama",
  "sidaamu",
  "habesha",
  "አማርኛ",
  "ትግርኛ",
  "ግዕዝ",
  "ኢትዮጵያ",
];

/* ISO 639 codes: am (Amharic), ti/tir (Tigrinya), om/orm/gax (Oromo),
   so/som (Somali), gez (Ge'ez), wal (Wolaytta), sid (Sidaamu Afoo). */
export const LANGUAGE_CODE_RES = [
  /\bamh?\b/,
  /\btir?\b/,
  /\borm\b/,
  /\bgax\b/,
  /\bsom?\b/,
  /\bgez\b/,
  /\bwal\b/,
  /\bsid\b/,
];

const CODE_WHITELIST = [
  "am",
  "amh",
  "ti",
  "tir",
  "om",
  "orm",
  "gax",
  "so",
  "som",
  "gz",
  "gez",
  "wal",
  "sid",
];

/**
 * @param {object} record — normalized shape
 *   name: the name part only (id after "/", or repo/space name)
 *   tags: string[] (lowercased by the caller or here)
 *   languages: declared language codes/names (HF `language`, cardData.language, confirmed_languages…)
 *   descriptions: free-text fields worth scanning (description, desc, topics joined…)
 * @returns {boolean} true when the record itself shows Ethiopian evidence
 */
export function hasLanguageEvidence(record) {
  const name = (record.name || "").toLowerCase();
  const tags = (record.tags || []).map((t) => String(t).toLowerCase());
  const languages = (record.languages || []).map((l) =>
    String(l).toLowerCase()
  );
  const descriptions = (record.descriptions || []).map((d) =>
    String(d || "").toLowerCase()
  );

  const nameHit =
    LANGUAGE_NAME_MARKERS.some((m) => name.includes(m)) ||
    LANGUAGE_CODE_RES.some((re) => re.test(name));

  const langHit = languages.some(
    (l) =>
      CODE_WHITELIST.includes(l) ||
      LANGUAGE_NAME_MARKERS.some((m) => l.includes(m))
  );

  const tagHit =
    tags.some(
      (t) =>
        CODE_WHITELIST.includes(t) ||
        LANGUAGE_NAME_MARKERS.some((m) => t.includes(m))
    ) || tags.some((t) => LANGUAGE_CODE_RES.some((re) => re.test(t)));

  /* Only scan free text with long markers — short codes ("am", "so")
     substring-match too many English words. */
  const descHit = descriptions.some((d) =>
    LANGUAGE_NAME_MARKERS.filter((m) => m.length >= 5).some((m) =>
      d.includes(m)
    )
  );

  return nameHit || langHit || tagHit || descHit;
}
