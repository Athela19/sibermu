#!/usr/bin/env node
// Node port of core.py (stdlib only, no dependencies).
// BM25 search engine for UI/UX style guides.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(SCRIPTS_DIR, "..", "data");
export const MAX_RESULTS = 3;

export const CSV_CONFIG = {
  style: {
    file: "styles.csv",
    search_cols: ["Style ID", "Style Category", "Aliases", "Keywords", "Best For", "Type", "AI Prompt Keywords"],
    output_cols: ["Style ID", "Style Category", "Aliases", "Status", "Parent Style ID", "Preferred Mode", "Type", "Keywords", "Primary Colors", "Effects & Animation", "Best For", "Light Mode ✓", "Dark Mode ✓", "Performance", "Accessibility", "Framework Compatibility", "Complexity", "AI Prompt Keywords", "CSS/Technical Keywords", "Implementation Checklist", "Design System Variables"],
  },
  color: {
    file: "colors.csv",
    search_cols: ["Product Type", "Notes"],
    output_cols: ["Product Type", "Primary", "On Primary", "Secondary", "On Secondary", "Accent", "On Accent", "Background", "Foreground", "Card", "Card Foreground", "Muted", "Muted Foreground", "Border", "Destructive", "On Destructive", "Ring", "Notes"],
  },
  chart: {
    file: "charts.csv",
    search_cols: ["Data Type", "Keywords", "Best Chart Type", "When to Use", "When NOT to Use", "Accessibility Notes"],
    output_cols: ["Data Type", "Keywords", "Best Chart Type", "Secondary Options", "When to Use", "When NOT to Use", "Data Volume Threshold", "Color Guidance", "Accessibility Grade", "Accessibility Risk", "Accessibility Notes", "A11y Fallback", "Library Recommendation", "Interactive Level"],
  },
  landing: {
    file: "landing.csv",
    search_cols: ["Pattern ID", "Pattern Name", "Aliases", "Keywords", "Conversion Optimization", "Section Order"],
    output_cols: ["Pattern ID", "Pattern Name", "Aliases", "Keywords", "Section Order", "Primary CTA Placement", "Color Strategy", "Conversion Optimization"],
  },
  product: {
    file: "products.csv",
    search_cols: ["Product Type", "Keywords", "Primary Style Recommendation", "Key Considerations"],
    output_cols: ["Product Type", "Keywords", "Primary Style Recommendation", "Secondary Styles", "Landing Page Pattern", "Dashboard Style (if applicable)", "Color Palette Focus"],
  },
  ux: {
    file: "ux-guidelines.csv",
    search_cols: ["Category", "Issue", "Description", "Platform"],
    output_cols: ["Category", "Issue", "Platform", "Description", "Do", "Don't", "Code Example Good", "Code Example Bad", "Severity"],
  },
  typography: {
    file: "typography.csv",
    search_cols: ["Font Pairing Name", "Category", "Mood/Style Keywords", "Best For", "Heading Font", "Body Font"],
    output_cols: ["Font Pairing Name", "Category", "Heading Font", "Body Font", "Mood/Style Keywords", "Best For", "Google Fonts URL", "CSS Import", "Tailwind Config", "Notes"],
  },
  icons: {
    file: "icons.csv",
    search_cols: ["Category", "Icon Name", "Keywords", "Best For", "Library"],
    output_cols: ["Category", "Icon Name", "Keywords", "Library", "Import Code", "Usage", "Best For", "Style", "Semantic Role", "Allowed Contexts"],
  },
  gsap: {
    file: "motion.csv",
    search_cols: ["Category", "Intensity Tier", "Keywords", "Trigger"],
    output_cols: ["Category", "Intensity Tier", "Trigger", "Duration", "Easing", "GSAP Snippet", "Framework Notes", "Do", "Don't", "Performance Notes"],
  },
  react: {
    file: "react-performance.csv",
    search_cols: ["Category", "Issue", "Keywords", "Description"],
    output_cols: ["Category", "Issue", "Platform", "Description", "Do", "Don't", "Code Example Good", "Code Example Bad", "Severity"],
  },
  web: {
    file: "app-interface.csv",
    search_cols: ["Category", "Issue", "Keywords", "Description"],
    output_cols: ["Category", "Issue", "Platform", "Description", "Do", "Don't", "Code Example Good", "Code Example Bad", "Severity"],
  },
  "google-fonts": {
    file: "google-fonts.csv",
    search_cols: ["Family", "Category", "Stroke", "Classifications", "Keywords", "Subsets", "Designers"],
    output_cols: ["Family", "Category", "Stroke", "Classifications", "Styles", "Variable Axes", "Subsets", "Designers", "Popularity Rank", "Google Fonts URL"],
  },
};

// Output columns whose content must never be hard-truncated for display.
export const UNTRUNCATED_COLS = new Set([
  "Code Example Good", "Code Example Bad", "Code Good", "Code Bad",
  "Implementation Checklist", "Design System Variables", "CSS Import",
  "Tailwind Config", "GSAP Snippet",
]);

export const STACK_CONFIG = {
  react: { file: "stacks/react.csv" },
  nextjs: { file: "stacks/nextjs.csv" },
  vue: { file: "stacks/vue.csv" },
  svelte: { file: "stacks/svelte.csv" },
  astro: { file: "stacks/astro.csv" },
  swiftui: { file: "stacks/swiftui.csv" },
  "react-native": { file: "stacks/react-native.csv" },
  flutter: { file: "stacks/flutter.csv" },
  nuxtjs: { file: "stacks/nuxtjs.csv" },
  "nuxt-ui": { file: "stacks/nuxt-ui.csv" },
  "html-tailwind": { file: "stacks/html-tailwind.csv" },
  shadcn: { file: "stacks/shadcn.csv" },
  "jetpack-compose": { file: "stacks/jetpack-compose.csv" },
  threejs: { file: "stacks/threejs.csv" },
  angular: { file: "stacks/angular.csv" },
  laravel: { file: "stacks/laravel.csv" },
  javafx: { file: "stacks/javafx.csv" },
  wpf: { file: "stacks/wpf.csv" },
  winui: { file: "stacks/winui.csv" },
  avalonia: { file: "stacks/avalonia.csv" },
  uno: { file: "stacks/uno.csv" },
  uwp: { file: "stacks/uwp.csv" },
};

const STACK_COLS = {
  search_cols: ["Category", "Guideline", "Description", "Do", "Don't", "Code Good", "Code Bad"],
  output_cols: ["Category", "Guideline", "Description", "Do", "Don't", "Code Good", "Code Bad", "Severity", "Docs URL", "Applies To", "Status", "Verified At"],
};

const WEB_STACK_CURRENT_MAJORS = {
  react: 19,
  nextjs: 16,
  vue: 3,
  svelte: 5,
  astro: 7,
  angular: 22,
  "html-tailwind": 4,
  nuxtjs: 4,
  "nuxt-ui": 4,
};
const WEB_STACKS = new Set([...Object.keys(WEB_STACK_CURRENT_MAJORS), "shadcn"]);
void WEB_STACKS;

const STACK_CURRENT_VERSIONS = {
  ...Object.fromEntries(Object.entries(WEB_STACK_CURRENT_MAJORS).map(([k, v]) => [k, [v]])),
  "react-native": [0, 86],
  flutter: [3, 44],
  swiftui: [16],
  "jetpack-compose": [1, 11],
  avalonia: [12],
  winui: [3],
  javafx: [26],
  threejs: [0, 185],
  laravel: [13],
};
const LEGACY_ONLY_STACKS = new Set(["uwp"]);
const STACK_CURRENT_APPLICABILITY = {
  react: "react 19.2.x",
  nextjs: "nextjs 16.2",
  vue: "vue 3.5.x",
  svelte: "svelte 5",
  astro: "astro 7.1.6",
  angular: "angular 22.x",
  "html-tailwind": "html-tailwind 4.3",
  shadcn: "shadcn cli 4",
  nuxtjs: "nuxtjs 4.5",
  "nuxt-ui": "nuxt-ui 4.10",
  "react-native": "react-native 0.86.x",
  flutter: "flutter 3.44.x",
  swiftui: "swiftui current",
  "jetpack-compose": "jetpack-compose 1.11.4",
  avalonia: "avalonia 12",
  uwp: "uwp legacy",
  winui: "winui current",
  wpf: "wpf current",
  uno: "uno current",
  javafx: "javafx 26",
  threejs: "threejs 0.185.1",
  laravel: "laravel 13.x",
};
void STACK_CURRENT_APPLICABILITY;

const STACK_QUERY_NAMES = {
  react: "react",
  nextjs: "next(?:\\.js|js)?",
  vue: "vue",
  svelte: "svelte",
  astro: "astro",
  angular: "angular",
  "html-tailwind": "tailwind(?:\\s*css)?",
  nuxtjs: "nuxt(?:\\.js|js)?",
  "nuxt-ui": "nuxt\\s*ui",
  "react-native": "react[\\s-]*native",
  flutter: "flutter",
  swiftui: "(?:ios|swiftui\\s+ios)",
  "jetpack-compose": "(?:jetpack\\s*)?compose",
  avalonia: "avalonia",
  winui: "winui",
  javafx: "javafx",
  threejs: "three(?:\\.js|js)?",
  laravel: "laravel",
};

export const AVAILABLE_STACKS = Object.keys(STACK_CONFIG);

const INDEX_VERSION = 2;
const SEARCH_CALIBRATION_VERSION = "2026-08-12-v1";

const DOMAIN_SCORE_FLOORS = {
  style: 4.3, landing: 4.0, product: 6.0, icons: 5.8,
  react: 3.3,
};
const SEARCH_THRESHOLDS = Object.fromEntries(
  Object.keys(CSV_CONFIG).map((domain) => [
    domain,
    {
      min_score: DOMAIN_SCORE_FLOORS[domain] ?? 0.0,
      min_margin: 0.0,
      min_coverage: domain === "landing" ? 0.5 : 0.0,
    },
  ])
);
const STACK_THRESHOLD = { min_score: 3.6, min_margin: 0.0, min_coverage: 1 / 3 };
const NO_THRESHOLD = { min_score: 0.0, min_margin: 0.0, min_coverage: 0.0 };
const STYLE_IDENTITY_FIELDS = ["Style ID", "Style Category", "Aliases"];
const LANDING_IDENTITY_FIELDS = ["Pattern ID", "Pattern Name", "Aliases"];
const DOMAIN_QUERY_REWRITES = {
  color: { color: null, palette: null, hex: null, rgb: null, token: null, semantic: null, destructive: null, muted: null, foreground: null },
  landing: { testimonial: "testimonials" },
  style: { css: null, implementation: null, variable: null, checklist: null, tailwind: null },
  ux: { ux: "accessibility", usability: "accessibility", wcag: "accessibility" },
  "google-fonts": { typography: "font" },
  icons: { lucide: null, symbol: null, glyph: null, pictogram: null },
  gsap: { gsap: "animation", quickto: null, scrolltrigger: "scroll", "flip plugin": null, splittext: null },
  react: { nextjs: "react", usecallback: "memoization", useeffect: "effects" },
  web: { aria: "accessibility", outline: "focus", semantic: null, autocomplete: "input", preconnect: null },
};

// ============ TOKENIZATION ============
const STOPWORDS = new Set([
  "to", "in", "on", "at", "is", "of", "by", "or", "an", "if", "no", "so",
  "do", "be", "we", "it", "as", "the", "and", "for", "are", "was",
]);

const SYNONYMS = {
  "q&a": "question answer",
  "e-commerce": "ecommerce",
  "dark-mode": "dark",
  darkmode: "dark",
  "light-mode": "light",
  lightmode: "light",
  a11y: "accessibility",
  nav: "navigation",
  "sign-up": "signup",
  "log-in": "login",
  colour: "color",
  colours: "colors",
  customisation: "customization",
  organisation: "organization",
  behaviour: "behavior",
  "ux/ui": "ux ui",
};

const WB = "[\\p{L}\\p{N}_]";

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SYNONYM_PATTERNS = Object.entries(SYNONYMS)
  .sort((a, b) => b[0].length - a[0].length)
  .map(([variant, canonical]) => [
    new RegExp(`(?<!${WB})${escapeRegExp(variant)}(?!${WB})`, "giu"),
    canonical,
  ]);

export function normalize(text) {
  let normalized = String(text);
  for (const [pattern, canonical] of SYNONYM_PATTERNS) {
    pattern.lastIndex = 0;
    normalized = normalized.replace(pattern, canonical);
  }
  return normalized;
}

// Python str() rendering for CSV values (None -> "None"), kept for parity.
export function pyStr(value) {
  if (value === null || value === undefined) return "None";
  return String(value);
}

// ============ BM25 IMPLEMENTATION ============
export class BM25 {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.corpus = [];
    this.docLengths = [];
    this.avgdl = 0;
    this.idf = new Map();
    this.docFreqs = new Map();
    this.N = 0;
    this.termFreqs = [];
  }

  tokenize(text) {
    text = normalize(String(text).toLowerCase());
    text = text.replace(/[^\p{L}\p{N}_\s]/gu, " ");
    return text.split(/\s+/).filter((w) => w.length >= 2 && !STOPWORDS.has(w));
  }

  fit(documents) {
    this.corpus = documents.map((doc) => this.tokenize(doc));
    this.N = this.corpus.length;
    if (this.N === 0) return;
    this.docLengths = this.corpus.map((doc) => doc.length);
    this.avgdl = this.docLengths.reduce((a, b) => a + b, 0) / this.N || 1.0;

    this.termFreqs = [];
    for (const doc of this.corpus) {
      const tf = new Map();
      for (const word of doc) tf.set(word, (tf.get(word) ?? 0) + 1);
      this.termFreqs.push(tf);
      for (const word of tf.keys()) {
        this.docFreqs.set(word, (this.docFreqs.get(word) ?? 0) + 1);
      }
    }

    for (const [word, freq] of this.docFreqs) {
      this.idf.set(word, Math.log((this.N - freq + 0.5) / (freq + 0.5) + 1));
    }
  }

  score(query) {
    const queryTokens = this.tokenize(query);
    const scores = [];
    for (let idx = 0; idx < this.N; idx++) {
      let s = 0;
      const docLen = this.docLengths[idx];
      const termFreqs = this.termFreqs[idx];
      for (const token of queryTokens) {
        if (this.idf.has(token)) {
          const tf = termFreqs.get(token) ?? 0;
          const idf = this.idf.get(token);
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * (1 - this.b + (this.b * docLen) / this.avgdl);
          s += (idf * numerator) / denominator;
        }
      }
      scores.push([idx, s]);
    }
    scores.sort((a, b) => b[1] - a[1]);
    return scores;
  }

  vocabulary() {
    return [...this.idf.keys()];
  }
}

// ============ difflib.SequenceMatcher PORT ============
// Faithful port of CPython's gestalt matcher (isjunk=None, autojunk=true).
class SequenceMatcher {
  constructor(a = "", b = "") {
    this.a = Array.from(String(a));
    this.b = Array.from(String(b));
    this.b2j = new Map();
    this.bjunk = new Set();
    this.matchingBlocks = null;
    this.chainB();
  }

  chainB() {
    const b = this.b;
    const b2j = this.b2j;
    for (let i = 0; i < b.length; i++) {
      const elt = b[i];
      if (!b2j.has(elt)) b2j.set(elt, []);
      b2j.get(elt).push(i);
    }
    // autojunk: purge chars appearing in >1% of a 200+ char sequence.
    const n = b.length;
    if (n >= 200) {
      const ntest = Math.floor(n / 100) + 1;
      for (const [elt, idxs] of [...b2j]) {
        if (idxs.length > ntest) b2j.delete(elt);
      }
    }
  }

  findLongestMatch(alo = 0, ahi = null, blo = 0, bhi = null) {
    const a = this.a;
    const b = this.b;
    const b2j = this.b2j;
    const isbjunk = (c) => this.bjunk.has(c);
    if (ahi === null) ahi = a.length;
    if (bhi === null) bhi = b.length;
    let besti = alo;
    let bestj = blo;
    let bestsize = 0;
    let j2len = new Map();
    for (let i = alo; i < ahi; i++) {
      const newj2len = new Map();
      const indices = b2j.get(a[i]);
      if (indices) {
        for (const j of indices) {
          if (j < blo) continue;
          if (j >= bhi) break;
          const k = (j2len.get(j - 1) ?? 0) + 1;
          newj2len.set(j, k);
          if (k > bestsize) {
            besti = i - k + 1;
            bestj = j - k + 1;
            bestsize = k;
          }
        }
      }
      j2len = newj2len;
    }
    while (besti > alo && bestj > blo && !isbjunk(b[bestj - 1]) && a[besti - 1] === b[bestj - 1]) {
      besti--; bestj--; bestsize++;
    }
    while (besti + bestsize < ahi && bestj + bestsize < bhi &&
      !isbjunk(b[bestj + bestsize]) && a[besti + bestsize] === b[bestj + bestsize]) {
      bestsize++;
    }
    while (besti > alo && bestj > blo && isbjunk(b[bestj - 1]) && a[besti - 1] === b[bestj - 1]) {
      besti--; bestj--; bestsize++;
    }
    while (besti + bestsize < ahi && bestj + bestsize < bhi &&
      isbjunk(b[bestj + bestsize]) && a[besti + bestsize] === b[bestj + bestsize]) {
      bestsize++;
    }
    return [besti, bestj, bestsize];
  }

  getMatchingBlocks() {
    if (this.matchingBlocks !== null) return this.matchingBlocks;
    const la = this.a.length;
    const lb = this.b.length;
    const queue = [[0, la, 0, lb]];
    const matchingBlocks = [];
    while (queue.length) {
      const [alo, ahi, blo, bhi] = queue.pop();
      const [i, j, k] = this.findLongestMatch(alo, ahi, blo, bhi);
      if (k) {
        matchingBlocks.push([i, j, k]);
        if (alo < i && blo < j) queue.push([alo, i, blo, j]);
        if (i + k < ahi && j + k < bhi) queue.push([i + k, ahi, j + k, bhi]);
      }
    }
    matchingBlocks.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
    let [i1, j1, k1] = [0, 0, 0];
    const nonAdjacent = [];
    for (const [i2, j2, k2] of matchingBlocks) {
      if (i1 + k1 === i2 && j1 + k1 === j2) {
        k1 += k2;
      } else {
        if (k1) nonAdjacent.push([i1, j1, k1]);
        [i1, j1, k1] = [i2, j2, k2];
      }
    }
    if (k1) nonAdjacent.push([i1, j1, k1]);
    nonAdjacent.push([la, lb, 0]);
    this.matchingBlocks = nonAdjacent;
    return nonAdjacent;
  }

  ratio() {
    const matches = this.getMatchingBlocks().reduce((sum, t) => sum + t[2], 0);
    return calculateRatio(matches, this.a.length + this.b.length);
  }
}

function calculateRatio(matches, length) {
  if (length) return (2.0 * matches) / length;
  return 1.0;
}

function seqRatio(a, b) {
  return new SequenceMatcher(a, b).ratio();
}

// ============ CSV / INDEX CACHE ============
// Minimal RFC-4180 reader matching Python's csv module defaults
// (delimiter ',', quotechar '"', doublequote, embedded newlines/CRLF).
function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => {
    // Python's csv reader skips truly blank lines.
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
    row = [];
  };
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; }
        else { inQuotes = false; i++; }
      } else { field += c; i++; }
    } else if (c === '"') {
      inQuotes = true; i++;
    } else if (c === ",") {
      pushField(); i++;
    } else if (c === "\r" || c === "\n") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      i++;
      pushField(); pushRow();
    } else {
      field += c; i++;
    }
  }
  if (inQuotes || field !== "" || row.length > 0) {
    pushField(); pushRow();
  }
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((r) => {
    const obj = {};
    for (let c = 0; c < header.length; c++) {
      // Missing trailing fields become null, mirroring DictReader's restval.
      obj[header[c]] = c < r.length ? r[c] : null;
    }
    return obj;
  });
}

const csvCache = new Map(); // filepath -> [signature, rows]
const bm25Cache = new Map(); // key -> [signature, index]

function fileSignature(filepath) {
  const stat = fs.statSync(filepath);
  return [stat.mtimeMs, stat.size];
}

function sigEqual(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

function loadCsvSnapshot(filepath, attempts = 3) {
  let signature = fileSignature(filepath);
  const cached = csvCache.get(filepath);
  if (cached && sigEqual(cached[0], signature)) {
    return [cached[1], signature];
  }
  for (let t = 0; t < attempts; t++) {
    const before = fileSignature(filepath);
    const text = fs.readFileSync(filepath, "utf8");
    const rows = parseCsvText(text);
    const after = fileSignature(filepath);
    if (sigEqual(before, after)) {
      csvCache.set(filepath, [after, rows]);
      return [rows, after];
    }
  }
  throw new Error(`File changed while reading: ${filepath}`);
}

function loadCsv(filepath) {
  return loadCsvSnapshot(filepath)[0];
}

function getBm25(filepath, searchCols, data, signature = null, cacheVariant = "") {
  const key = JSON.stringify([filepath, searchCols, INDEX_VERSION, cacheVariant]);
  if (signature === null) {
    const cachedRows = csvCache.get(filepath);
    signature = cachedRows && cachedRows[1] === data ? cachedRows[0] : fileSignature(filepath);
  }
  const cached = bm25Cache.get(key);
  if (cached && sigEqual(cached[0], signature)) {
    return cached[1];
  }
  const documents = data.map((row) => searchCols.map((col) => pyStr(row[col] ?? "")).join(" "));
  const index = new BM25();
  index.fit(documents);
  bm25Cache.set(key, [signature, index]);
  return index;
}

// ============ SEARCH FUNCTIONS ============
function queryCoverage(index, query) {
  const tokens = new Set(index.tokenize(query));
  if (tokens.size === 0) return 0.0;
  const vocabulary = new Set(index.vocabulary());
  let hits = 0;
  for (const token of tokens) if (vocabulary.has(token)) hits++;
  return hits / tokens.size;
}

function searchCsvDetailed(filepath, searchCols, outputCols, query, maxResults,
  threshold = null, routingDomain = null, rowFilter = null, cacheVariant = "") {
  if (!fs.existsSync(filepath)) {
    return [[], null, { reason: "missing-file" }];
  }
  let data;
  let signature;
  try {
    [data, signature] = loadCsvSnapshot(filepath);
  } catch {
    return [[], null, { reason: "read-error", error: `Unable to read search data: ${path.basename(filepath)}` }];
  }
  if (data.length === 0) {
    return [[], null, { reason: "empty-data" }];
  }
  if (rowFilter !== null && rowFilter !== undefined) {
    data = data.filter(rowFilter);
    if (data.length === 0) {
      return [[], null, { reason: "empty-data" }];
    }
  }
  const bm25 = getBm25(filepath, searchCols, data, signature, cacheVariant);
  const [searchQuery, rewrites] = rewriteQueryForDomain(query, routingDomain, bm25);
  const ranked = bm25.score(searchQuery);
  threshold = threshold || NO_THRESHOLD;
  const topScore = ranked.length ? ranked[0][1] : 0.0;
  const runnerUpScore = ranked.length > 1 ? ranked[1][1] : 0.0;
  const coverage = queryCoverage(bm25, searchQuery);
  const abstain = topScore <= threshold.min_score ||
    coverage < threshold.min_coverage ||
    (threshold.min_margin > 0 && topScore - runnerUpScore < threshold.min_margin);

  const results = [];
  if (!abstain) {
    for (const [idx, score] of ranked.slice(0, maxResults)) {
      if (score <= 0) continue;
      const row = data[idx];
      const projected = {};
      for (const col of outputCols) {
        if (col in row) projected[col] = row[col];
      }
      results.push(projected);
    }
  }
  const diagnostic = {
    normalized_query: normalize(query),
    search_query: searchQuery,
    query_rewrites: rewrites,
    top_score: topScore,
    runner_up_score: runnerUpScore,
    margin: topScore - runnerUpScore,
    token_coverage: coverage,
    abstained: abstain,
    calibration_version: SEARCH_CALIBRATION_VERSION,
    reason: abstain ? "low-confidence" : "matched",
  };
  return [results, bm25, diagnostic];
}

function passesThreshold(index, query, threshold) {
  const ranked = index.score(query);
  const topScore = ranked.length ? ranked[0][1] : 0.0;
  const runnerUpScore = ranked.length > 1 ? ranked[1][1] : 0.0;
  return topScore > threshold.min_score &&
    queryCoverage(index, query) >= threshold.min_coverage &&
    (threshold.min_margin <= 0 || topScore - runnerUpScore >= threshold.min_margin);
}

function suggestTerms(bm25, query, limit = 6, threshold = null) {
  if (bm25 === null || bm25 === undefined) return [];
  const queryTokens = new Set(bm25.tokenize(query));
  if (queryTokens.size === 0) return [];
  const candidates = [];
  for (const term of bm25.vocabulary()) {
    if (queryTokens.has(term)) continue;
    let similarity = 0;
    for (const token of queryTokens) {
      similarity = Math.max(similarity, seqRatio(token, term));
    }
    if (similarity >= 0.72 && (threshold == null || passesThreshold(bm25, term, threshold))) {
      candidates.push([-similarity, -(bm25.docFreqs.get(term) ?? 0), term]);
    }
  }
  candidates.sort((a, b) => a[0] - b[0] || a[1] - b[1] || (a[2] < b[2] ? -1 : a[2] > b[2] ? 1 : 0));
  return candidates.slice(0, limit).map((c) => c[2]);
}

function suggestIdentities(rows, query, fields, limit = 6) {
  const tokenizer = new BM25();
  const queryTokens = new Set(tokenizer.tokenize(query));
  if (queryTokens.size === 0) return [];
  const candidates = [];
  const seen = new Set();
  for (const row of rows) {
    for (const identity of rowIdentities(row, fields)) {
      const identityTokens = new Set(tokenizer.tokenize(identity));
      if (identityTokens.size === 0) continue;
      let similarity = 0;
      for (const source of queryTokens) {
        for (const target of identityTokens) {
          similarity = Math.max(similarity, seqRatio(source, target));
        }
      }
      if (similarity >= 0.72 && identity.toLowerCase() !== String(query).trim().toLowerCase()) {
        const key = `${-similarity}|${identityTokens.size}|${identity}`;
        if (!seen.has(key)) {
          seen.add(key);
          candidates.push([-similarity, identityTokens.size, identity]);
        }
      }
    }
  }
  candidates.sort((a, b) => a[0] - b[0] || a[1] - b[1] || (a[2] < b[2] ? -1 : a[2] > b[2] ? 1 : 0));
  return candidates.slice(0, limit).map((c) => c[2]);
}

function rowIdentities(row, fields) {
  const identities = [];
  for (const field of fields) {
    const values = field === "Aliases" ? String(row[field] ?? "").split("|") : [row[field] ?? ""];
    for (const value of values) {
      const v = String(value).trim();
      if (v) identities.push(v);
    }
  }
  return identities;
}

function loadProductKeywords() {
  const seed = ["saas", "ecommerce", "fintech", "healthcare", "gaming", "portfolio",
    "crypto", "fitness", "marketplace", "banking", "cybersecurity",
    "education", "travel", "restaurant", "real estate", "social media",
    "beauty", "spa", "salon", "wellness", "booking"];
  const filepath = path.join(DATA_DIR, CSV_CONFIG.product.file);
  if (!fs.existsSync(filepath)) return seed;
  let rows;
  try {
    rows = loadCsv(filepath);
  } catch {
    return seed;
  }
  const keywords = new Set(seed);
  for (const row of rows) {
    const label = String(row["Product Type"] ?? "").replace(/\([^)]*\)/g, "").trim().toLowerCase();
    if (label.length >= 4) keywords.add(label);
  }
  return [...keywords].sort((a, b) => b.length - a.length);
}

let domainKeywords = null;
let domainKeywordsSignature = null;

function getDomainKeywords() {
  const productPath = path.join(DATA_DIR, CSV_CONFIG.product.file);
  const signature = fs.existsSync(productPath) ? fileSignature(productPath) : null;
  if (domainKeywords !== null && sigEqual(domainKeywordsSignature, signature)) {
    return domainKeywords;
  }
  domainKeywords = {
    color: ["color", "palette", "hex", "rgb", "token", "semantic", "accent", "destructive", "muted", "foreground"],
    chart: ["time series", "chart", "graph", "visualization", "trend", "bar chart", "pie", "scatter", "heatmap", "funnel", "forecast"],
    landing: ["landing", "page", "cta", "conversion", "hero", "testimonial", "pricing", "section"],
    product: loadProductKeywords(),
    style: ["style", "design", "ui", "minimalism", "glassmorphism", "neumorphism", "brutalism", "dark mode", "flat", "aurora", "css", "implementation", "variable", "checklist", "tailwind"],
    ux: ["ux", "usability", "accessibility", "wcag", "touch", "scroll", "animation", "keyboard", "navigation", "mobile"],
    typography: ["font pairing", "typography pairing", "heading font", "body font"],
    "google-fonts": ["google font", "font family", "font weight", "font style", "variable font", "noto", "font for", "find font", "font subset", "font language", "monospace font", "serif font", "sans serif font", "display font", "handwriting font", "font", "typography", "serif", "sans"],
    icons: ["icon", "icons", "lucide", "phosphor", "heroicons", "symbol", "glyph", "pictogram", "svg icon"],
    gsap: ["gsap", "quickto", "scrolltrigger", "stagger", "magnetic cursor", "parallax", "page transition", "scroll reveal", "scroll-triggered", "scrollytelling", "flip plugin", "splittext", "shimmer", "skeleton loader"],
    react: ["react", "next.js", "nextjs", "suspense", "memo", "usecallback", "useeffect", "rerender", "bundle", "waterfall", "barrel", "dynamic import", "rsc", "server component"],
    web: ["aria", "focus", "outline", "semantic", "virtualize", "autocomplete", "form", "input type", "preconnect", "drag reorder", "single pointer", "touch target", "native accessibility"],
  };
  domainKeywordsSignature = signature;
  return domainKeywords;
}

function containsPhrase(text, phrase) {
  if (/[\p{L}\p{N}_]/u.test(phrase)) {
    return new RegExp(`(?<!${WB})${escapeRegExp(phrase)}(?!${WB})`, "u").test(text);
  }
  return text.includes(phrase);
}

function rewriteQueryForDomain(query, domain, index) {
  const keywords = getDomainKeywords();
  if (!domain || !(domain in keywords)) return [query, []];
  const normalized = normalize(query.toLowerCase());
  const vocabulary = new Set(index.vocabulary());
  const rewrites = [];
  const replacementTerms = [];
  for (const keyword of keywords[domain]) {
    if (!containsPhrase(normalized, keyword)) continue;
    const kwTokens = new Set(index.tokenize(keyword));
    let overlaps = false;
    for (const t of kwTokens) {
      if (vocabulary.has(t)) { overlaps = true; break; }
    }
    if (overlaps) continue;
    const replacement = (DOMAIN_QUERY_REWRITES[domain] || {})[keyword];
    if (replacement) {
      rewrites.push(`${keyword}->${replacement}`);
      replacementTerms.push(replacement);
    }
  }
  if (replacementTerms.length === 0) return [query, []];
  const uniq = [...new Set(replacementTerms)].sort();
  return [`${query} ${uniq.join(" ")}`, [...new Set(rewrites)].sort()];
}

const DOMAIN_TIEBREAK_ORDER = [
  "ux", "product", "style", "color", "typography", "google-fonts",
  "chart", "landing", "icons", "gsap", "react", "web",
];
const DOMAIN_TIEBREAK_RANK = Object.fromEntries(DOMAIN_TIEBREAK_ORDER.map((d, i) => [d, i]));

export function detectDomain(query, returnScores = false) {
  const queryLower = normalize(query.toLowerCase());
  const domainKeywords = getDomainKeywords();
  const scores = {};
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    let total = 0.0;
    for (const kw of keywords) {
      if (containsPhrase(queryLower, kw)) {
        const specificity = Math.max(1, kw.split(" ").length);
        total += domain !== "product" ? 2.0 * specificity : specificity;
      }
    }
    scores[domain] = total;
  }
  if (new RegExp(`(?<!${WB})#[0-9a-f]{3,8}(?!${WB})`, "iu").test(queryLower)) {
    scores.color += 2.0;
  }
  const ranked = Object.entries(scores).sort((a, b) =>
    b[1] - a[1] || (DOMAIN_TIEBREAK_RANK[a[0]] ?? 999) - (DOMAIN_TIEBREAK_RANK[b[0]] ?? 999));
  const [bestDomain, bestScore] = ranked[0];
  const result = bestScore > 0 ? bestDomain : "style";
  if (returnScores) {
    const runnerUp = ranked.length > 1 && ranked[1][1] > 0 ? ranked[1][0] : null;
    return [result, runnerUp];
  }
  return result;
}

function styleIdentity(rows, query, allowContained = true) {
  const folded = String(query ?? "").trim().toLowerCase();
  const queryTokens = new Set((normalize(folded).match(/[\p{L}\p{N}_]+/gu) || []));
  const genericTokens = new Set(["app", "design", "interface", "style", "system", "ui"]);
  const candidates = [];
  for (const row of rows) {
    const identities = rowIdentities(row, STYLE_IDENTITY_FIELDS);
    if (identities.some((id) => id.toLowerCase() === folded)) {
      return row;
    }
    if (!allowContained) continue;
    for (const identity of identities) {
      const identityTokens = new Set((normalize(identity.toLowerCase()).match(/[\p{L}\p{N}_]+/gu) || []));
      if (identityTokens.size > 0 && [...identityTokens].every((t) => queryTokens.has(t)) &&
        [...identityTokens].some((t) => t.length >= 4)) {
        const distinctive = [...identityTokens].filter((t) => !genericTokens.has(t));
        candidates.push([distinctive.length, identityTokens.size, identity.length, row]);
      }
    }
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
  const bestScore = candidates[0].slice(0, 3);
  const bestRows = new Map();
  for (const c of candidates) {
    if (c[0] === bestScore[0] && c[1] === bestScore[1] && c[2] === bestScore[2]) {
      bestRows.set(c[3]["Style ID"] ?? "", c[3]);
    }
  }
  return bestRows.size === 1 ? [...bestRows.values()][0] : null;
}

function exactRowIdentity(rows, query, fields) {
  const folded = String(query ?? "").trim().toLowerCase();
  const matches = [];
  for (const row of rows) {
    if (rowIdentities(row, fields).some((id) => id.toLowerCase() === folded)) {
      matches.push(row);
    }
  }
  return matches.length === 1 ? matches[0] : null;
}

function loadRowsOrEmpty(filepath) {
  try {
    return loadCsv(filepath);
  } catch {
    return [];
  }
}

function projectRow(row, columns) {
  const out = {};
  for (const column of columns) {
    if (column in row) out[column] = row[column];
  }
  return out;
}

function validMaxResults(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 20;
}

function exactMatchDiagnostic(query, reason) {
  return {
    normalized_query: normalize(query),
    search_query: query,
    query_rewrites: [],
    top_score: 0.0,
    runner_up_score: 0.0,
    margin: 0.0,
    token_coverage: 1.0,
    abstained: false,
    calibration_version: SEARCH_CALIBRATION_VERSION,
    reason,
  };
}

function styleSearchDestination(rows, matched) {
  if (!matched || (matched["Status"] ?? "active") !== "deprecated") {
    return [matched, null];
  }
  const parentId = String(matched["Parent Style ID"] ?? "").trim();
  if (parentId) {
    const parent = rows.find((row) => row["Style ID"] === parentId) ?? null;
    return [parent, null];
  }
  const domain = String(matched["Replacement Domain"] ?? "").trim();
  const replacementId = String(matched["Replacement ID"] ?? "").trim();
  if (domain === "style" && replacementId) {
    const replacement = rows.find((row) => row["Style ID"] === replacementId) ?? null;
    return [replacement, null];
  }
  if (domain && replacementId) {
    return [null, { domain, id: replacementId }];
  }
  return [null, null];
}

export function search(query, domain = null, maxResults = MAX_RESULTS, diagnostics = false) {
  if (!validMaxResults(maxResults)) {
    return { error: "max_results must be an integer from 1 to 20", domain: domain ?? null };
  }
  const autoDetected = domain === null || domain === undefined;
  let runnerUp = null;
  let styleRows = null;
  let exactStyle = null;
  let redirect = null;
  if (autoDetected) {
    const stylePath = path.join(DATA_DIR, CSV_CONFIG.style.file);
    styleRows = loadRowsOrEmpty(stylePath);
    const matchedStyle = styleIdentity(styleRows, query, false);
    if (matchedStyle !== null) {
      domain = "style";
      [exactStyle, redirect] = styleSearchDestination(styleRows, matchedStyle);
    } else {
      [domain, runnerUp] = detectDomain(query, true);
    }
  }

  const searchDomain = domain in CSV_CONFIG ? domain : "style";
  const config = CSV_CONFIG[searchDomain];
  const filepath = path.join(DATA_DIR, config.file);

  if (!fs.existsSync(filepath)) {
    return { error: `File not found: ${filepath}`, domain: domain ?? null };
  }

  let landingRows = null;
  if (searchDomain === "style" && exactStyle === null && redirect === null) {
    if (styleRows === null) {
      styleRows = loadRowsOrEmpty(filepath);
    }
    [exactStyle, redirect] = styleSearchDestination(styleRows, styleIdentity(styleRows, query));
  } else if (searchDomain === "landing") {
    landingRows = loadRowsOrEmpty(filepath);
    exactStyle = exactRowIdentity(landingRows, query, LANDING_IDENTITY_FIELDS);
  }

  let results;
  let bm25;
  let diagnostic;
  if (exactStyle !== null) {
    results = [projectRow(exactStyle, config.output_cols)];
    bm25 = null;
    diagnostic = exactMatchDiagnostic(query, "exact-identity");
  } else if (redirect !== null) {
    results = [];
    bm25 = null;
    diagnostic = {
      normalized_query: normalize(query),
      search_query: query,
      query_rewrites: [],
      abstained: true,
      calibration_version: SEARCH_CALIBRATION_VERSION,
      reason: "cross-domain-redirect",
    };
  } else {
    [results, bm25, diagnostic] = searchCsvDetailed(
      filepath, config.search_cols, config.output_cols, query,
      maxResults, SEARCH_THRESHOLDS[searchDomain], searchDomain,
      searchDomain === "style" ? (row) => (row["Status"] ?? "active") === "active" : null,
      searchDomain === "style" ? "active-only" : ""
    );
  }

  if (searchDomain === "icons" && containsPhrase(normalize(query.toLowerCase()), "lucide")) {
    results = [];
    diagnostic.abstained = true;
    diagnostic.reason = "unsupported-library";
  }

  const out = {
    domain,
    query,
    file: config.file,
    count: results.length,
    results,
  };
  if (autoDetected) {
    out.auto_detected = true;
    if (runnerUp) out.runner_up_domain = runnerUp;
  }
  if (redirect !== null) out.redirect = redirect;
  if (diagnostic.error) out.error = diagnostic.error;
  if (results.length === 0) {
    if (searchDomain === "landing") {
      out.suggestions = suggestIdentities(landingRows ?? [], query, LANDING_IDENTITY_FIELDS);
    } else {
      out.suggestions = suggestTerms(bm25, query, 6, SEARCH_THRESHOLDS[searchDomain]);
    }
  }
  if (diagnostics) out.diagnostics = diagnostic;
  return out;
}

function cmpVersions(requested, current) {
  const n = Math.min(requested.length, current.length);
  for (let i = 0; i < n; i++) {
    if (requested[i] !== current[i]) return requested[i] - current[i];
  }
  return 0;
}

function stackQueryRequestsLegacy(query, stack) {
  const normalized = normalize(String(query ?? "").toLowerCase());
  if (LEGACY_ONLY_STACKS.has(stack)) return true;

  const currentVersion = STACK_CURRENT_VERSIONS[stack];
  const stackName = STACK_QUERY_NAMES[stack];
  if (currentVersion !== undefined && stackName !== undefined) {
    const re = new RegExp(
      `\\b(?:${stackName})\\s*(?:sdk|ui)?\\s*(?:[@(]\\s*)?(?:v(?:ersion)?\\s*)?(\\d+)(?:\\.(\\d+))?\\s*\\)?`,
      "g"
    );
    const requestedVersions = [];
    for (const match of normalized.matchAll(re)) {
      const parts = [match[1], match[2]].filter((v) => v !== undefined).map(Number);
      requestedVersions.push(parts);
    }
    if (stack === "threejs") {
      for (const m of normalized.matchAll(/\br(\d+)\b/g)) {
        requestedVersions.push([0, Number(m[1])]);
      }
    }
    const migrationIntent = /\b(?:migrat\w*|upgrad\w*|replac\w*|instead|modern|current)\b/.test(normalized);
    if (requestedVersions.length > 0) {
      if (migrationIntent && requestedVersions.some((r) => cmpVersions(r, currentVersion.slice(0, r.length)) >= 0)) {
        return false;
      }
      return requestedVersions.every((r) => cmpVersions(r, currentVersion.slice(0, r.length)) < 0);
    }
  }
  if (/\b(?:migrat\w*|upgrad\w*|replac\w*|instead|modern|current)\b/.test(normalized)) {
    return false;
  }
  return /\b(?:legacy|deprecated)\b/.test(normalized);
}

function stackRowFilter(rows, query, stack) {
  const statuses = new Set(rows.map((row) => row["Status"] ?? "unverified"));
  const hasLegacy = statuses.has("deprecated");
  const requestsLegacy = stackQueryRequestsLegacy(query, stack);
  let statusFilter;
  let variant;
  if (hasLegacy && requestsLegacy) {
    statusFilter = (row) => row["Status"] === "deprecated";
    variant = "legacy-only";
  } else if (requestsLegacy && stack in STACK_CURRENT_VERSIONS) {
    return [(row) => false, "legacy-unavailable"];
  } else if (statuses.has("active")) {
    statusFilter = (row) => row["Status"] === "active";
    variant = "current-only";
  } else {
    statusFilter = (row) => (row["Status"] ?? "unverified") !== "deprecated";
    variant = "non-legacy";
  }

  if (stack !== "shadcn") return [statusFilter, variant];
  const normalized = normalize(String(query ?? "").toLowerCase());
  let requestedBase = null;
  if (normalized.includes("base ui")) requestedBase = "base";
  else if (normalized.includes("react aria")) requestedBase = "aria";
  else if (normalized.includes("radix") || normalized.includes("aschild")) requestedBase = "radix";
  else return [statusFilter, variant];

  const matchesBase = (row) => {
    const match = String(row["Applies To"] ?? "").toLowerCase().match(/\bbase=([^;]+)/);
    const bases = match ? match[1].split("|") : [];
    return statusFilter(row) && bases.includes(requestedBase);
  };
  return [matchesBase, `${variant};base=${requestedBase}`];
}

function exactStackIdentifier(rows, query, rowFilter) {
  const identifier = String(query ?? "").trim();
  if (identifier.length < 6 || /\s/.test(identifier)) return null;
  const pattern = new RegExp(`(?<![A-Za-z0-9_])${escapeRegExp(identifier)}(?![A-Za-z0-9_])`, "i");
  const fields = ["Guideline", "Description", "Do", "Don't", "Code Good", "Code Bad"];
  const matches = rows.filter((row) => rowFilter(row) &&
    fields.some((field) => pattern.test(String(row[field] ?? ""))));
  return matches.length === 1 ? matches[0] : null;
}

function legacySuccessorGuidance(rows, query, stack, rowFilter) {
  const normalized = normalize(String(query ?? "").toLowerCase());
  if (!LEGACY_ONLY_STACKS.has(stack) ||
    !/\b(?:brand new|new)\s+(?:app|application|project)\b/.test(normalized)) {
    return null;
  }
  const matches = rows.filter((row) => rowFilter(row) && /\b(?:prefer|choose|use)\b.*\bnew (?:apps?|projects?)\b/.test(
    [row["Guideline"] ?? "", row["Description"] ?? "", row["Do"] ?? ""].join(" ").toLowerCase()
  ));
  return matches.length === 1 ? matches[0] : null;
}

export function searchStack(query, stack, maxResults = MAX_RESULTS, diagnostics = false) {
  if (!validMaxResults(maxResults)) {
    return { error: "max_results must be an integer from 1 to 20", stack };
  }
  if (!(stack in STACK_CONFIG)) {
    return { error: `Unknown stack: ${stack}. Available: ${AVAILABLE_STACKS.join(", ")}` };
  }
  const filepath = path.join(DATA_DIR, STACK_CONFIG[stack].file);
  if (!fs.existsSync(filepath)) {
    return { error: `Stack file not found: ${filepath}`, stack };
  }
  const rows = loadRowsOrEmpty(filepath);
  const [rowFilter, cacheVariant] = stackRowFilter(rows, query, stack);
  const threshold = cacheVariant === "legacy-only" ? NO_THRESHOLD : STACK_THRESHOLD;
  const exact = legacySuccessorGuidance(rows, query, stack, rowFilter) ??
    exactStackIdentifier(rows, query, rowFilter);
  let results;
  let bm25;
  let diagnostic;
  if (exact !== null) {
    results = [projectRow(exact, STACK_COLS.output_cols)];
    bm25 = null;
    diagnostic = exactMatchDiagnostic(query, "exact-identifier");
  } else {
    [results, bm25, diagnostic] = searchCsvDetailed(
      filepath, STACK_COLS.search_cols, STACK_COLS.output_cols, query,
      maxResults, threshold, null, rowFilter, cacheVariant);
  }
  const out = {
    domain: "stack",
    stack,
    query,
    file: STACK_CONFIG[stack].file,
    count: results.length,
    results,
  };
  if (diagnostic.error) out.error = diagnostic.error;
  if (results.length === 0) {
    out.suggestions = suggestTerms(bm25, query, 6, threshold);
  }
  if (diagnostics) out.diagnostics = diagnostic;
  return out;
}
