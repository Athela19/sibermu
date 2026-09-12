#!/usr/bin/env node
// Node port of design_system.py (stdlib only, no dependencies).
// Design System Generator - aggregates search results and applies reasoning
// to generate comprehensive design system recommendations.

import fs from "node:fs";
import path from "node:path";
import { search, DATA_DIR } from "./core.mjs";
import { applyDecisionRules, parseDecisionRules } from "./reasoning_contract.mjs";

// ============ CONFIGURATION ============
const REASONING_FILE = "ui-reasoning.csv";

const SEARCH_CONFIG = {
  product: { max_results: 1 },
  style: { max_results: 3 },
  color: { max_results: 5 },
  landing: { max_results: 2 },
  typography: { max_results: 2 },
};

const SEMANTIC_COLOR_ENTRIES = [
  ["Primary", "primary", "--color-primary"],
  ["On Primary", "on_primary", "--color-on-primary"],
  ["Secondary", "secondary", "--color-secondary"],
  ["On Secondary", "on_secondary", "--color-on-secondary"],
  ["Accent/CTA", "accent", "--color-accent"],
  ["On Accent/CTA", "on_accent", "--color-on-accent"],
  ["Background", "background", "--color-background"],
  ["Foreground", "foreground", "--color-foreground"],
  ["Card", "card", "--color-card"],
  ["Card Foreground", "card_foreground", "--color-card-foreground"],
  ["Muted", "muted", "--color-muted"],
  ["Muted Foreground", "muted_foreground", "--color-muted-foreground"],
  ["Border", "border", "--color-border"],
  ["Destructive", "destructive", "--color-destructive"],
  ["On Destructive", "on_destructive", "--color-on-destructive"],
  ["Ring", "ring", "--color-ring"],
];

// ============ DESIGN DIALS (1-10) ============
const DIAL_TIERS = {
  variance: [
    [1, 3, { label: "Centered / Minimal", style_keywords: ["Minimalism", "Exaggerated Minimalism", "centered", "symmetric", "grid-based"] }],
    [4, 7, { label: "Balanced / Modern", style_keywords: ["modern", "structured", "balanced"] }],
    [8, 10, { label: "Bold / Asymmetric", style_keywords: ["Brutalism", "Bento Grids", "asymmetric", "experimental"] }],
  ],
  motion: [
    [1, 3, { label: "Subtle", tier: "Subtle" }],
    [4, 7, { label: "Standard", tier: "Standard" }],
    [8, 10, { label: "Complex", tier: "Complex" }],
  ],
  density: [
    [1, 3, { label: "Spacious", spacing: { xs: "4px", sm: "8px", md: "24px", lg: "32px", xl: "48px", "2xl": "64px", "3xl": "96px" } }],
    [4, 7, { label: "Standard", spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px", "2xl": "48px", "3xl": "64px" } }],
    [8, 10, { label: "Dense / Dashboard", spacing: { xs: "2px", sm: "4px", md: "8px", lg: "12px", xl: "16px", "2xl": "24px", "3xl": "32px" } }],
  ],
};

function resolveDial(dialName, value) {
  if (value === null || value === undefined) return null;
  value = Math.max(1, Math.min(10, parseInt(value, 10)));
  for (const [lo, hi, info] of DIAL_TIERS[dialName]) {
    if (lo <= value && value <= hi) {
      return { ...info, value };
    }
  }
  return null;
}

// ============ COLOR MODE RESOLUTION ============
const DARK_PRIMARY_MARKERS = [
  "dark mode primary", "dark primary", "dark-only", "dark only",
  "dark preferred", "dark focused", "dark-first", "dark rich",
  "light mode only as exception",
];

const DARK_QUERY_MARKERS = [
  "dark mode", "dark theme", "dark ui", "dark-mode", "darkmode",
  "night mode", "midnight", "oled",
];

const DARK_ANTI_PATTERN_MARKERS = ["dark mode", "dark modes", "dark theme"];

const DARK_BACKGROUND_MAX_LUMINANCE = 0.18;

function relativeLuminance(hexColor) {
  if (!hexColor) return null;
  let value = String(hexColor).trim().replace(/^#+/, "");
  // Python lstrip("#") strips ALL leading '#'; keep parity for weird inputs.
  if (value.length === 3) {
    value = [...value].map((c) => c + c).join("");
  }
  if (value.length !== 6) return null;
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function paletteIsDark(palette) {
  const luminance = relativeLuminance((palette || {}).Background ?? "");
  return luminance !== null && luminance < DARK_BACKGROUND_MAX_LUMINANCE;
}

function contrastRatio(first, second) {
  const l1 = relativeLuminance(first);
  const l2 = relativeLuminance(second);
  if (l1 === null || l2 === null) return null;
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function styleIsDarkPrimary(style) {
  if (!style || Object.keys(style).length === 0) return false;
  const preferredMode = String(style["Preferred Mode"] ?? "").trim().toLowerCase();
  if (preferredMode === "dark" || preferredMode === "light") {
    return preferredMode === "dark";
  }
  if (style["Light Mode ✓"] === "not-recommended" && style["Dark Mode ✓"] === "supported") {
    return true;
  }
  const declared = `${style["Light Mode ✓"] ?? ""} ${style["Dark Mode ✓"] ?? ""}`.toLowerCase();
  return DARK_PRIMARY_MARKERS.some((marker) => declared.includes(marker));
}

function queryWantsDark(query) {
  const lowered = (query || "").toLowerCase();
  return DARK_QUERY_MARKERS.some((marker) => lowered.includes(marker));
}

function resolveColorMode(query, style) {
  if (queryWantsDark(query) || styleIsDarkPrimary(style)) return "dark";
  return "light";
}

function deriveDarkPalette(palette) {
  const derived = { ...palette };
  const background = "#0F172A";
  const ringCandidates = [palette.Ring, palette.Accent, palette.Primary, "#60A5FA"];
  const ring = ringCandidates.find((c) => (contrastRatio(c, background) ?? 0) >= 3) ?? "#60A5FA";
  Object.assign(derived, {
    Background: background,
    Foreground: "#F8FAFC",
    Card: "#111827",
    "Card Foreground": "#F8FAFC",
    Muted: "#1E293B",
    "Muted Foreground": "#CBD5E1",
    Border: "#334155",
    Ring: ring,
    _mode_derivation: "derived-dark",
  });
  return derived;
}

function selectPaletteForMode(palettes, mode, category = null) {
  if (!palettes || palettes.length === 0) return {};
  const categoryPalette = palettes.find((p) => p["Product Type"] === category) ?? null;
  if (categoryPalette) {
    if (mode === "dark" && !paletteIsDark(categoryPalette)) {
      return deriveDarkPalette(categoryPalette);
    }
    return categoryPalette;
  }
  if (mode === "dark") {
    for (const palette of palettes) {
      if (paletteIsDark(palette)) return palette;
    }
  }
  return palettes[0];
}

function filterAntiPatternsForMode(antiPatterns, mode) {
  if (mode !== "dark" || !antiPatterns) return antiPatterns;
  const kept = String(antiPatterns)
    .split("+")
    .map((clause) => clause.trim())
    .filter((clause) => clause && !DARK_ANTI_PATTERN_MARKERS.some((m) => clause.toLowerCase().includes(m)));
  return kept.join(" + ");
}

// Minimal RFC-4180 reader (same dialect as core.mjs) for the generator's
// direct CSV loads.
function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const pushField = () => { row.push(field); field = ""; };
  const pushRow = () => {
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
      obj[header[c]] = c < r.length ? r[c] : null;
    }
    return obj;
  });
}

function loadCsvFile(filepath) {
  if (!fs.existsSync(filepath)) return [];
  try {
    return parseCsvText(fs.readFileSync(filepath, "utf8"));
  } catch {
    return [];
  }
}

// ============ DESIGN SYSTEM GENERATOR ============
export class DesignSystemGenerator {
  constructor() {
    this.reasoningData = this.loadReasoning();
    this.styleData = this.loadStyles();
    this.styleLookup = DesignSystemGenerator.buildStyleLookup(this.styleData);
    this.landingLookup = this.loadLandingPatterns();
  }

  loadReasoning() {
    return loadCsvFile(path.join(DATA_DIR, REASONING_FILE));
  }

  loadStyles() {
    return loadCsvFile(path.join(DATA_DIR, "styles.csv"));
  }

  loadLandingPatterns() {
    const rows = loadCsvFile(path.join(DATA_DIR, "landing.csv"));
    const lookup = {};
    for (const row of rows) {
      const identities = [row["Pattern ID"] ?? "", row["Pattern Name"] ?? ""];
      identities.push(...String(row.Aliases ?? "").split("|"));
      for (const identity of identities) {
        if (String(identity).trim()) {
          lookup[String(identity).trim().toLowerCase()] = row;
        }
      }
    }
    return lookup;
  }

  static buildStyleLookup(styles) {
    const lookup = {};
    for (const style of styles) {
      const keys = [style["Style ID"] ?? "", style["Style Category"] ?? ""];
      keys.push(...String(style.Aliases ?? "").split("|"));
      for (const key of keys) {
        if (String(key).trim()) {
          lookup[String(key).trim().toLowerCase()] = style;
        }
      }
    }
    return lookup;
  }

  resolveStyle(reference) {
    let style = this.styleLookup[String(reference ?? "").trim().toLowerCase()] ?? {};
    const seen = new Set();
    while (style && Object.keys(style).length > 0 && (style.Status ?? "active") === "deprecated") {
      const styleId = style["Style ID"] ?? "";
      const parentId = style["Parent Style ID"] ?? "";
      if (!parentId || seen.has(styleId)) return {};
      seen.add(styleId);
      style = this.styleLookup[String(parentId).toLowerCase()] ?? {};
    }
    return style;
  }

  multiDomainSearch(query, category, reasoning, stylePriority = null) {
    const results = {};
    const constraints = (reasoning.constraints || [])
      .map((item) => String(item).replace(/-/g, " "))
      .join(" ");
    const resolvedQuery = [query, category, constraints].filter(Boolean).join(" ");
    for (const [domain, config] of Object.entries(SEARCH_CONFIG)) {
      if (domain === "style" && stylePriority) {
        const priorityQuery = stylePriority.slice(0, 2).join(" ");
        results[domain] = search(`${resolvedQuery} ${priorityQuery}`, domain, config.max_results);
      } else if (domain === "color") {
        results[domain] = search(`${reasoning.color_mood ?? ""} ${resolvedQuery}`, domain, config.max_results);
      } else if (domain === "landing") {
        const pattern = reasoning.pattern ?? "";
        const landingQuery = String(pattern).toLowerCase() in this.landingLookup
          ? pattern
          : `${pattern} ${resolvedQuery}`;
        results[domain] = search(landingQuery || query, domain, config.max_results);
      } else if (domain === "typography") {
        results[domain] = search(`${reasoning.typography_mood ?? ""} ${resolvedQuery}`, domain, config.max_results);
      } else {
        results[domain] = search(query, domain, config.max_results);
      }
    }
    return results;
  }

  findReasoningRule(category) {
    const categoryLower = String(category).trim().toLowerCase();
    for (const rule of this.reasoningData) {
      if (String(rule.UI_Category ?? "").trim().toLowerCase() === categoryLower) {
        return rule;
      }
    }
    return {};
  }

  applyReasoning(category, query) {
    const rule = this.findReasoningRule(category);
    if (!rule || Object.keys(rule).length === 0) {
      return {
        pattern: "Hero + Features + CTA",
        style_priority: ["Minimalism", "Flat Design"],
        color_mood: "Professional",
        typography_mood: "Clean",
        key_effects: "Subtle hover transitions",
        anti_patterns: "",
        decision_rules: {},
        activated_rules: [],
        constraints: [],
        preferred_mode: null,
        is_default: true,
        severity: "MEDIUM",
      };
    }
    const decisionRules = parseDecisionRules(rule.Decision_Rules ?? "{}");
    const applied = applyDecisionRules(decisionRules, query);
    const stylePriority = String(rule.Style_Priority ?? "").split("+").map((s) => s.trim());
    const appliedStyleNames = applied.style_ids.map(
      (styleId) => this.resolveStyle(styleId)["Style Category"] ?? styleId
    );
    return {
      pattern: applied.pattern || rule.Recommended_Pattern || "",
      style_priority: [...appliedStyleNames, ...stylePriority],
      color_mood: rule.Color_Mood ?? "",
      typography_mood: rule.Typography_Mood ?? "",
      key_effects: rule.Key_Effects ?? "",
      anti_patterns: rule.Anti_Patterns ?? "",
      decision_rules: decisionRules,
      activated_rules: applied.activated,
      constraints: applied.constraints,
      preferred_mode: applied.mode,
      is_default: false,
      severity: rule.Severity ?? "MEDIUM",
    };
  }

  selectBestMatch(results, priorityKeywords) {
    if (!results || results.length === 0) return {};
    if (!priorityKeywords || priorityKeywords.length === 0) return results[0];
    for (const priority of priorityKeywords) {
      const resolved = this.resolveStyle(priority);
      if (resolved && Object.keys(resolved).length > 0 && (resolved.Status ?? "active") !== "deprecated") {
        return { ...resolved };
      }
    }
    const scored = [];
    for (const result of results) {
      const resultStr = pyRepr(result).toLowerCase();
      let score = 0;
      for (const kw of priorityKeywords) {
        const kwTokens = new Set(String(kw).toLowerCase().match(/[a-z0-9]+/g) || []);
        const nameTokens = new Set(String(result["Style Category"] ?? "").toLowerCase().match(/[a-z0-9]+/g) || []);
        if (kwTokens.size > 0 && [...kwTokens].every((t) => nameTokens.has(t))) {
          score += 10;
        } else if ([...kwTokens].some((t) =>
          new Set(String(result.Keywords ?? "").toLowerCase().match(/[a-z0-9]+/g) || []).has(t))) {
          score += 3;
        } else if ([...kwTokens].some((token) => resultStr.includes(token))) {
          score += 1;
        }
      }
      scored.push([score, result]);
    }
    scored.sort((a, b) => b[0] - a[0]);
    return scored.length > 0 && scored[0][0] > 0 ? scored[0][1] : results[0];
  }

  extractResults(searchResult) {
    return (searchResult || {}).results || [];
  }

  generate(query, projectName = null, variance = null, motion = null, density = null) {
    const varianceInfo = resolveDial("variance", variance);
    const motionInfo = resolveDial("motion", motion);
    const densityInfo = resolveDial("density", density);

    // Step 1: First search product to get category
    const productResult = search(query, "product", 1);
    const productResults = productResult.results || [];
    let category = "General";
    if (productResults.length > 0) {
      category = productResults[0]["Product Type"] ?? "General";
    }

    // Step 2: Get reasoning rules for this category
    const reasoning = this.applyReasoning(category, query);
    const stylePriority = reasoning.style_priority || [];

    let effectiveStylePriority = stylePriority;
    if (varianceInfo) {
      effectiveStylePriority = [...varianceInfo.style_keywords, ...stylePriority];
    }

    // Step 3: Multi-domain search with style priority hints
    const searchResults = this.multiDomainSearch(query, category, reasoning, effectiveStylePriority);
    searchResults.product = productResult; // Reuse product search

    // Step 4: Select best matches from each domain using priority
    const styleResults = this.extractResults(searchResults.style);
    const colorResults = this.extractResults(searchResults.color);
    const typographyResults = this.extractResults(searchResults.typography);
    const landingResults = this.extractResults(searchResults.landing);

    const bestStyle = this.selectBestMatch(styleResults, effectiveStylePriority);
    const colorMode = reasoning.preferred_mode || resolveColorMode(query, bestStyle);
    const bestColor = selectPaletteForMode(colorResults, colorMode, category);
    const bestTypography = typographyResults.length > 0 ? typographyResults[0] : {};
    const bestLanding = landingResults.find((row) => row["Pattern Name"] === reasoning.pattern) ??
      (landingResults.length > 0 ? landingResults[0] : {});

    let motionSnippet = {};
    if (motionInfo) {
      const motionResult = search(`${query} ${motionInfo.tier}`, "gsap", 5);
      const motionMatches = motionResult.results || [];
      const tiered = motionMatches.filter((m) => m["Intensity Tier"] === motionInfo.tier);
      if (tiered.length > 0) motionSnippet = tiered[0];
      else if (motionMatches.length > 0) motionSnippet = motionMatches[0];
    }

    // Step 5: Build final recommendation
    const styleEffects = bestStyle["Effects & Animation"] ?? "";
    const reasoningEffects = reasoning.key_effects ?? "";
    const combinedEffects = styleEffects || reasoningEffects;

    return {
      project_name: projectName || String(query).toUpperCase(),
      category,
      pattern: {
        name: bestLanding["Pattern Name"] ?? reasoning.pattern ?? "Hero + Features + CTA",
        sections: bestLanding["Section Order"] ?? "Hero > Features > CTA",
        cta_placement: bestLanding["Primary CTA Placement"] ?? "Above fold",
        color_strategy: bestLanding["Color Strategy"] ?? "",
        conversion: bestLanding["Conversion Optimization"] ?? "",
      },
      style: {
        id: bestStyle["Style ID"] ?? "minimalism-and-swiss-style",
        name: bestStyle["Style Category"] ?? "Minimalism",
        type: bestStyle.Type ?? "General",
        effects: styleEffects,
        keywords: bestStyle.Keywords ?? "",
        best_for: bestStyle["Best For"] ?? "",
        performance: bestStyle.Performance ?? "",
        accessibility: bestStyle.Accessibility ?? "",
        light_mode: bestStyle["Light Mode ✓"] ?? "",
        dark_mode: bestStyle["Dark Mode ✓"] ?? "",
      },
      colors: {
        primary: bestColor.Primary ?? "#2563EB",
        on_primary: bestColor["On Primary"] ?? "",
        secondary: bestColor.Secondary ?? "#3B82F6",
        on_secondary: bestColor["On Secondary"] ?? "",
        accent: bestColor.Accent ?? "#F97316",
        on_accent: bestColor["On Accent"] ?? "",
        background: bestColor.Background ?? "#F8FAFC",
        foreground: bestColor.Foreground ?? "#1E293B",
        card: bestColor.Card ?? "",
        card_foreground: bestColor["Card Foreground"] ?? "",
        muted: bestColor.Muted ?? "",
        muted_foreground: bestColor["Muted Foreground"] ?? "",
        border: bestColor.Border ?? "",
        destructive: bestColor.Destructive ?? "",
        on_destructive: bestColor["On Destructive"] ?? "",
        ring: bestColor.Ring ?? "",
        notes: bestColor.Notes ?? "",
        // Keep legacy keys for backward compat in MASTER.md
        cta: bestColor.Accent ?? "#F97316",
        text: bestColor.Foreground ?? "#1E293B",
        on_cta: bestColor["On Accent"] ?? "",
      },
      typography: {
        heading: bestTypography["Heading Font"] ?? "Inter",
        body: bestTypography["Body Font"] ?? "Inter",
        mood: bestTypography["Mood/Style Keywords"] ?? reasoning.typography_mood ?? "",
        best_for: bestTypography["Best For"] ?? "",
        google_fonts_url: bestTypography["Google Fonts URL"] ?? "",
        css_import: bestTypography["CSS Import"] ?? "",
      },
      key_effects: combinedEffects,
      anti_patterns: filterAntiPatternsForMode(reasoning.anti_patterns ?? "", colorMode),
      decision_rules: reasoning.decision_rules ?? {},
      activated_rules: reasoning.activated_rules ?? [],
      constraints: reasoning.constraints ?? [],
      reasoning_default: reasoning.is_default ?? false,
      source_identities: {
        product: productResults.length > 0 ? category : null,
        reasoning: !reasoning.is_default ? category : null,
        style: bestStyle["Style ID"] || bestStyle["Style Category"],
        color: bestColor["Product Type"],
        typography: bestTypography["Font Pairing Name"],
        landing: bestLanding["Pattern Name"],
      },
      source_derivations: {
        color_mode: bestColor._mode_derivation,
      },
      severity: reasoning.severity ?? "MEDIUM",
      dials: {
        variance: varianceInfo ? varianceInfo.value : null,
        variance_label: varianceInfo ? varianceInfo.label : null,
        motion: motionInfo ? motionInfo.value : null,
        motion_label: motionInfo ? motionInfo.label : null,
        density: densityInfo ? densityInfo.value : null,
        density_label: densityInfo ? densityInfo.label : null,
      },
      motion_snippet: motionSnippet,
      spacing_scale: densityInfo ? densityInfo.spacing : null,
    };
  }
}

// Approximate Python's str(dict) for flat string dicts (keyword matching only).
function pyRepr(obj) {
  const parts = [];
  for (const [k, v] of Object.entries(obj ?? {})) {
    parts.push(`'${String(k).replace(/'/g, "\\'")}': '${String(v ?? "None").replace(/'/g, "\\'")}'`);
  }
  return `{${parts.join(", ")}}`;
}

// ============ OUTPUT FORMATTERS ============
const BOX_WIDTH = 90; // Wider box for more content

function hexToAnsi(hexColor) {
  if (!hexColor || !String(hexColor).startsWith("#")) return "";
  const colorterm = process.env.COLORTERM ?? "";
  if (colorterm !== "truecolor" && colorterm !== "24bit") return "";
  const hex = String(hexColor).slice(1);
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `\x1b[38;2;${r};${g};${b}m██\x1b[0m `;
}

function ansiLjust(s, width) {
  const visibleLen = String(s).replace(/\x1b\[[0-9;]*m/g, "").length;
  const pad = width - visibleLen;
  return s + " ".repeat(Math.max(0, pad));
}

function sectionHeader(name, width) {
  const label = `─── ${name} `;
  const fill = "─".repeat(width - label.length - 1);
  return `├${label}${fill}┤`;
}

function wrapText(text, prefix, width) {
  if (!text) return [];
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = prefix;
  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width - 2) {
      currentLine += (currentLine !== prefix ? " " : "") + word;
    } else {
      if (currentLine !== prefix) lines.push(currentLine);
      currentLine = prefix + word;
    }
  }
  if (currentLine !== prefix) lines.push(currentLine);
  return lines;
}

const padBox = (s) => String(s).padEnd(BOX_WIDTH) + "│";

export function formatAsciiBox(designSystem) {
  const project = designSystem.project_name ?? "PROJECT";
  const pattern = designSystem.pattern || {};
  const style = designSystem.style || {};
  const colors = designSystem.colors || {};
  const typography = designSystem.typography || {};
  const effects = designSystem.key_effects ?? "";
  const antiPatterns = designSystem.anti_patterns ?? "";
  const dials = designSystem.dials || {};
  const motionSnippet = designSystem.motion_snippet || {};

  const lines = [];
  const w = BOX_WIDTH - 1;

  lines.push("╔" + "═".repeat(w) + "╗");
  lines.push(ansiLjust(`║  TARGET: ${project} - RECOMMENDED DESIGN SYSTEM`, BOX_WIDTH) + "║");
  lines.push("╚" + "═".repeat(w) + "╝");
  lines.push("┌" + "─".repeat(w) + "┐");

  if (["variance", "motion", "density"].some((k) => dials[k] !== null && dials[k] !== undefined)) {
    lines.push(sectionHeader("DESIGN DIALS", BOX_WIDTH + 1));
    if (dials.variance !== null && dials.variance !== undefined) {
      lines.push(padBox(`│  Variance: ${dials.variance}/10 — ${dials.variance_label}`));
    }
    if (dials.motion !== null && dials.motion !== undefined) {
      lines.push(padBox(`│  Motion:   ${dials.motion}/10 — ${dials.motion_label}`));
    }
    if (dials.density !== null && dials.density !== undefined) {
      lines.push(padBox(`│  Density:  ${dials.density}/10 — ${dials.density_label}`));
    }
  }

  lines.push(sectionHeader("PATTERN", BOX_WIDTH + 1));
  lines.push(padBox(`│  Name: ${pattern.name ?? ""}`));
  if (pattern.conversion) {
    lines.push(padBox(`│     Conversion: ${pattern.conversion ?? ""}`));
  }
  if (pattern.cta_placement) {
    lines.push(padBox(`│     CTA: ${pattern.cta_placement ?? ""}`));
  }
  lines.push(padBox("│     Sections:"));
  const sections = String(pattern.sections ?? "").split(" > ").map((s) => s.trim()).filter(Boolean);
  sections.forEach((section, i) => {
    lines.push(padBox(`│       ${i + 1}. ${section}`));
  });

  lines.push(sectionHeader("STYLE", BOX_WIDTH + 1));
  lines.push(padBox(`│  Name: ${style.name ?? ""}`));
  const light = style.light_mode ?? "";
  const dark = style.dark_mode ?? "";
  if (light || dark) {
    lines.push(padBox(`│     Mode Support: Light ${light}  Dark ${dark}`));
  }
  if (style.keywords) {
    for (const line of wrapText(`Keywords: ${style.keywords ?? ""}`, "│     ", BOX_WIDTH)) {
      lines.push(padBox(line));
    }
  }
  if (style.best_for) {
    for (const line of wrapText(`Best For: ${style.best_for ?? ""}`, "│     ", BOX_WIDTH)) {
      lines.push(padBox(line));
    }
  }
  if (style.performance || style.accessibility) {
    lines.push(padBox(`│     Performance: ${style.performance ?? ""} | Accessibility: ${style.accessibility ?? ""}`));
  }

  lines.push(sectionHeader("COLORS", BOX_WIDTH + 1));
  for (const [label, key, cssVar] of SEMANTIC_COLOR_ENTRIES) {
    const hexVal = colors[key] ?? "";
    if (!hexVal) continue;
    const swatch = hexToAnsi(hexVal);
    const content = `│     ${swatch}${(label + ":").padEnd(14)} ${String(hexVal).padEnd(10)} (${cssVar})`;
    lines.push(ansiLjust(content, BOX_WIDTH) + "│");
  }
  if (colors.notes) {
    for (const line of wrapText(`Notes: ${colors.notes ?? ""}`, "│     ", BOX_WIDTH)) {
      lines.push(padBox(line));
    }
  }

  lines.push(sectionHeader("TYPOGRAPHY", BOX_WIDTH + 1));
  lines.push(padBox(`│  ${typography.heading ?? ""} / ${typography.body ?? ""}`));
  if (typography.mood) {
    for (const line of wrapText(`Mood: ${typography.mood ?? ""}`, "│     ", BOX_WIDTH)) {
      lines.push(padBox(line));
    }
  }
  if (typography.best_for) {
    for (const line of wrapText(`Best For: ${typography.best_for ?? ""}`, "│     ", BOX_WIDTH)) {
      lines.push(padBox(line));
    }
  }
  if (typography.google_fonts_url) {
    lines.push(padBox(`│     Google Fonts: ${typography.google_fonts_url ?? ""}`));
  }
  if (typography.css_import) {
    lines.push(padBox(`│     CSS Import: ${String(typography.css_import ?? "").slice(0, 70)}...`));
  }

  if (effects) {
    lines.push(sectionHeader("KEY EFFECTS", BOX_WIDTH + 1));
    for (const line of wrapText(effects, "│     ", BOX_WIDTH)) {
      lines.push(padBox(line));
    }
  }

  if (motionSnippet && Object.keys(motionSnippet).length > 0) {
    lines.push(sectionHeader("MOTION", BOX_WIDTH + 1));
    lines.push(padBox(`│  ${motionSnippet.Category ?? ""} (${motionSnippet["Intensity Tier"] ?? ""})`));
    lines.push(padBox(`│     Trigger: ${motionSnippet.Trigger ?? ""} | Duration: ${motionSnippet.Duration ?? ""} | Easing: ${motionSnippet.Easing ?? ""}`));
    for (const line of wrapText(`GSAP: ${motionSnippet["GSAP Snippet"] ?? ""}`, "│     ", BOX_WIDTH)) {
      lines.push(padBox(line));
    }
    if (motionSnippet["Framework Notes"]) {
      for (const line of wrapText(`Framework: ${motionSnippet["Framework Notes"] ?? ""}`, "│     ", BOX_WIDTH)) {
        lines.push(padBox(line));
      }
    }
  }

  if (antiPatterns) {
    lines.push(sectionHeader("AVOID", BOX_WIDTH + 1));
    for (const line of wrapText(antiPatterns, "│     ", BOX_WIDTH)) {
      lines.push(padBox(line));
    }
  }

  lines.push(sectionHeader("PRE-DELIVERY CHECKLIST", BOX_WIDTH + 1));
  const checklistItems = [
    "[ ] No emojis as icons (use SVG: Heroicons/Lucide)",
    "[ ] cursor-pointer on all clickable elements",
    "[ ] Hover states with smooth transitions (150-300ms)",
    "[ ] Light mode: text contrast 4.5:1 minimum",
    "[ ] Focus states visible for keyboard nav",
    "[ ] prefers-reduced-motion respected",
    "[ ] Responsive: 375px, 768px, 1024px, 1440px",
  ];
  for (const item of checklistItems) {
    lines.push(padBox(`│     ${item}`));
  }

  lines.push("└" + "─".repeat(w) + "┘");

  return lines.join("\n");
}

export function formatMarkdown(designSystem) {
  const project = designSystem.project_name ?? "PROJECT";
  const pattern = designSystem.pattern || {};
  const style = designSystem.style || {};
  const colors = designSystem.colors || {};
  const typography = designSystem.typography || {};
  const effects = designSystem.key_effects ?? "";
  const antiPatterns = designSystem.anti_patterns ?? "";
  const dials = designSystem.dials || {};
  const motionSnippet = designSystem.motion_snippet || {};

  const lines = [];
  lines.push(`## Design System: ${project}`);
  lines.push("");

  if (["variance", "motion", "density"].some((k) => dials[k] !== null && dials[k] !== undefined)) {
    lines.push("### Design Dials");
    if (dials.variance !== null && dials.variance !== undefined) {
      lines.push(`- **Variance:** ${dials.variance}/10 — ${dials.variance_label}`);
    }
    if (dials.motion !== null && dials.motion !== undefined) {
      lines.push(`- **Motion:** ${dials.motion}/10 — ${dials.motion_label}`);
    }
    if (dials.density !== null && dials.density !== undefined) {
      lines.push(`- **Density:** ${dials.density}/10 — ${dials.density_label}`);
    }
    lines.push("");
  }

  lines.push("### Pattern");
  lines.push(`- **Name:** ${pattern.name ?? ""}`);
  if (pattern.conversion) {
    lines.push(`- **Conversion Focus:** ${pattern.conversion ?? ""}`);
  }
  if (pattern.cta_placement) {
    lines.push(`- **CTA Placement:** ${pattern.cta_placement ?? ""}`);
  }
  if (pattern.color_strategy) {
    lines.push(`- **Color Strategy:** ${pattern.color_strategy ?? ""}`);
  }
  lines.push(`- **Sections:** ${pattern.sections ?? ""}`);
  lines.push("");

  lines.push("### Style");
  lines.push(`- **Name:** ${style.name ?? ""}`);
  const light = style.light_mode ?? "";
  const dark = style.dark_mode ?? "";
  if (light || dark) {
    lines.push(`- **Mode Support:** Light ${light} | Dark ${dark}`);
  }
  if (style.keywords) {
    lines.push(`- **Keywords:** ${style.keywords ?? ""}`);
  }
  if (style.best_for) {
    lines.push(`- **Best For:** ${style.best_for ?? ""}`);
  }
  if (style.performance || style.accessibility) {
    lines.push(`- **Performance:** ${style.performance ?? ""} | **Accessibility:** ${style.accessibility ?? ""}`);
  }
  lines.push("");

  lines.push("### Colors");
  lines.push("| Role | Hex | CSS Variable |");
  lines.push("|------|-----|--------------|");
  for (const [label, key, cssVar] of SEMANTIC_COLOR_ENTRIES) {
    const hexVal = colors[key] ?? "";
    if (hexVal) {
      lines.push(`| ${label} | \`${hexVal}\` | \`${cssVar}\` |`);
    }
  }
  if (colors.notes) {
    lines.push(`\n*Notes: ${colors.notes ?? ""}*`);
  }
  lines.push("");

  lines.push("### Typography");
  lines.push(`- **Heading:** ${typography.heading ?? ""}`);
  lines.push(`- **Body:** ${typography.body ?? ""}`);
  if (typography.mood) {
    lines.push(`- **Mood:** ${typography.mood ?? ""}`);
  }
  if (typography.best_for) {
    lines.push(`- **Best For:** ${typography.best_for ?? ""}`);
  }
  if (typography.google_fonts_url) {
    lines.push(`- **Google Fonts:** ${typography.google_fonts_url ?? ""}`);
  }
  if (typography.css_import) {
    lines.push(`- **CSS Import:**`);
    lines.push(`\`\`\`css`);
    lines.push(`${typography.css_import ?? ""}`);
    lines.push(`\`\`\``);
  }
  lines.push("");

  if (effects) {
    lines.push("### Key Effects");
    lines.push(`${effects}`);
    lines.push("");
  }

  if (motionSnippet && Object.keys(motionSnippet).length > 0) {
    lines.push("### Motion");
    lines.push(`**${motionSnippet.Category ?? ""}** (${motionSnippet["Intensity Tier"] ?? ""}) — Trigger: ${motionSnippet.Trigger ?? ""} | Duration: ${motionSnippet.Duration ?? ""} | Easing: \`${motionSnippet.Easing ?? ""}\``);
    lines.push("```js");
    lines.push(motionSnippet["GSAP Snippet"] ?? "");
    lines.push("```");
    if (motionSnippet["Framework Notes"]) {
      lines.push(`*Framework notes: ${motionSnippet["Framework Notes"] ?? ""}*`);
    }
    const motionDo = motionSnippet.Do ?? "";
    const motionDont = motionSnippet["Don't"] ?? "";
    if (motionDo) {
      lines.push(`- ✅ ${motionDo}`);
    }
    if (motionDont) {
      lines.push(`- ❌ ${motionDont}`);
    }
    lines.push("");
  }

  if (antiPatterns) {
    lines.push("### Avoid (Anti-patterns)");
    const newlineBullet = "\n- ";
    lines.push(`- ${String(antiPatterns).replace(/ \+ /g, newlineBullet)}`);
    lines.push("");
  }

  lines.push("### Pre-Delivery Checklist");
  lines.push("- [ ] No emojis as icons (use SVG: Heroicons/Lucide)");
  lines.push("- [ ] cursor-pointer on all clickable elements");
  lines.push("- [ ] Hover states with smooth transitions (150-300ms)");
  lines.push("- [ ] Light mode: text contrast 4.5:1 minimum");
  lines.push("- [ ] Focus states visible for keyboard nav");
  lines.push("- [ ] prefers-reduced-motion respected");
  lines.push("- [ ] Responsive: 375px, 768px, 1024px, 1440px");
  lines.push("");

  return lines.join("\n");
}

// ============ MAIN ENTRY POINT ============
export function generateDesignSystem(query, projectName = null, outputFormat = "ascii",
  { persist = false, page = null, outputDir = null, variance = null, motion = null, density = null, force = false } = {}) {
  const generator = new DesignSystemGenerator();
  const designSystem = generator.generate(query, projectName, variance, motion, density);

  let persistenceResult = null;
  if (persist) {
    persistenceResult = persistDesignSystem(designSystem, page, outputDir, query, force);
  }

  const text = outputFormat === "markdown" ? formatMarkdown(designSystem) : formatAsciiBox(designSystem);

  return {
    text,
    design_system: designSystem,
    persistence: persistenceResult,
  };
}

// ============ PERSISTENCE FUNCTIONS ============
export function safeSlug(name, fallback = "default") {
  const slug = String(name).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function writePersistedFile(filePath, content, force) {
  const dir = path.dirname(filePath);
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.${process.pid}.tmp`);
  try {
    const fd = fs.openSync(tmpPath, "w");
    try {
      fs.writeFileSync(fd, content, "utf8");
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    if (force) {
      fs.renameSync(tmpPath, filePath);
      return;
    }
    // Publish only if the destination is absent (exclusive, race-safe).
    try {
      fs.linkSync(tmpPath, filePath);
    } finally {
      try {
        fs.unlinkSync(tmpPath);
      } catch {
        // Already moved or removed; nothing to clean up.
      }
    }
    if (!fs.existsSync(filePath)) {
      // linkSync succeeded only when the target was absent; reaching here
      // without the file means a lost race — mirror FileExistsError.
      const err = new Error("EEXIST");
      err.code = "EEXIST";
      throw err;
    }
  } catch (error) {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {
      // Ignore cleanup errors.
    }
    throw error;
  }
}

function isExistsError(error) {
  return error && (error.code === "EEXIST" || /already exists/i.test(error.message));
}

export function persistDesignSystem(designSystem, page = null, outputDir = null,
  pageQuery = null, force = false) {
  const baseDir = outputDir ? path.resolve(outputDir) : process.cwd();

  const projectName = designSystem.project_name || "default";
  const projectSlug = safeSlug(projectName);

  const designSystemDir = path.join(baseDir, "design-system", projectSlug);
  const pagesDir = path.join(designSystemDir, "pages");

  const masterFile = path.join(designSystemDir, "MASTER.md");

  const createdFiles = [];

  fs.mkdirSync(designSystemDir, { recursive: true });
  fs.mkdirSync(pagesDir, { recursive: true });

  const masterContent = formatMasterMd(designSystem);
  try {
    writePersistedFile(masterFile, masterContent, force);
    createdFiles.push(masterFile);
  } catch (error) {
    if (isExistsError(error)) {
      if (!page) {
        return {
          status: "skipped_exists",
          design_system_dir: designSystemDir,
          master_file: masterFile,
          created_files: [],
          message: `${masterFile} already exists and was not modified. Read it first to check for prior design decisions, then re-run with force=True / --force to overwrite.`,
        };
      }
    } else {
      throw error;
    }
  }

  if (page) {
    const pageFile = path.join(pagesDir, `${safeSlug(page, "page")}.md`);
    const pageContent = formatPageOverrideMd(designSystem, page, pageQuery);
    try {
      writePersistedFile(pageFile, pageContent, force);
      createdFiles.push(pageFile);
    } catch (error) {
      if (isExistsError(error)) {
        if (createdFiles.length === 0) {
          return {
            status: "skipped_exists",
            design_system_dir: designSystemDir,
            master_file: masterFile,
            created_files: [],
            message: `${pageFile} already exists and was not modified.`,
          };
        }
      } else {
        throw error;
      }
    }
  }

  return {
    status: "success",
    design_system_dir: designSystemDir,
    master_file: masterFile,
    created_files: createdFiles,
  };
}

// Note on writePersistedFile parity: Python uses os.link (exclusive create)
// and raises FileExistsError when the destination exists. Node's fs.linkSync
// throws EEXIST in the same situation, mapped above to the same statuses.
// A subtle difference: if two writers race, the loser still sees EEXIST.

export function formatMasterMd(designSystem) {
  const project = designSystem.project_name ?? "PROJECT";
  const pattern = designSystem.pattern || {};
  const style = designSystem.style || {};
  const colors = designSystem.colors || {};
  const typography = designSystem.typography || {};
  const effects = designSystem.key_effects ?? "";
  const antiPatterns = designSystem.anti_patterns ?? "";
  const dials = designSystem.dials || {};
  const motionSnippet = designSystem.motion_snippet || {};
  const spacingScale = designSystem.spacing_scale;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const lines = [];

  lines.push("# Design System Master File");
  lines.push("");
  lines.push("> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.");
  lines.push("> If that file exists, its rules **override** this Master file.");
  lines.push("> If not, strictly follow the rules below.");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`**Project:** ${project}`);
  lines.push(`**Generated:** ${timestamp}`);
  lines.push(`**Category:** ${designSystem.category ?? "General"}`);
  if (["variance", "motion", "density"].some((k) => dials[k] !== null && dials[k] !== undefined)) {
    const dialParts = [];
    if (dials.variance !== null && dials.variance !== undefined) {
      dialParts.push(`Variance ${dials.variance}/10 (${dials.variance_label})`);
    }
    if (dials.motion !== null && dials.motion !== undefined) {
      dialParts.push(`Motion ${dials.motion}/10 (${dials.motion_label})`);
    }
    if (dials.density !== null && dials.density !== undefined) {
      dialParts.push(`Density ${dials.density}/10 (${dials.density_label})`);
    }
    lines.push(`**Design Dials:** ${dialParts.join(" | ")}`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("## Global Rules");
  lines.push("");

  lines.push("### Color Palette");
  lines.push("");
  lines.push("| Role | Hex | CSS Variable |");
  lines.push("|------|-----|--------------|");
  for (const [label, key, cssVar] of SEMANTIC_COLOR_ENTRIES) {
    const hexVal = colors[key] ?? "";
    if (hexVal) {
      lines.push(`| ${label} | \`${hexVal}\` | \`${cssVar}\` |`);
    }
  }
  lines.push("");
  if (colors.notes) {
    lines.push(`**Color Notes:** ${colors.notes ?? ""}`);
    lines.push("");
  }

  lines.push("### Typography");
  lines.push("");
  lines.push(`- **Heading Font:** ${typography.heading ?? "Inter"}`);
  lines.push(`- **Body Font:** ${typography.body ?? "Inter"}`);
  if (typography.mood) {
    lines.push(`- **Mood:** ${typography.mood ?? ""}`);
  }
  if (typography.google_fonts_url) {
    lines.push(`- **Google Fonts:** [${typography.heading ?? ""} + ${typography.body ?? ""}](${typography.google_fonts_url ?? ""})`);
  }
  lines.push("");
  if (typography.css_import) {
    lines.push("**CSS Import:**");
    lines.push("```css");
    lines.push(`${typography.css_import ?? ""}`);
    lines.push("```");
    lines.push("");
  }

  const defaultSpacing = DIAL_TIERS.density[1][2].spacing; // mid-tier = the historical defaults
  const scale = spacingScale || defaultSpacing;
  const spacingUsage = {
    xs: "Tight gaps", sm: "Icon gaps, inline spacing", md: "Standard padding",
    lg: "Section padding", xl: "Large gaps", "2xl": "Section margins", "3xl": "Hero padding",
  };
  lines.push("### Spacing Variables");
  lines.push("");
  if (spacingScale) {
    lines.push(`*Density: ${dials.density}/10 — ${dials.density_label}*`);
    lines.push("");
  }
  lines.push("| Token | Value | Usage |");
  lines.push("|-------|-------|-------|");
  for (const token of ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"]) {
    const pxValue = scale[token];
    const remValue = Number(pxValue.replace(/px$/, "")) / 16;
    const remStr = Number.isInteger(remValue) ? String(remValue) : String(remValue);
    lines.push(`| \`--space-${token}\` | \`${pxValue}\` / \`${remStr}rem\` | ${spacingUsage[token]} |`);
  }
  lines.push("");

  lines.push("### Shadow Depths");
  lines.push("");
  lines.push("| Level | Value | Usage |");
  lines.push("|-------|-------|-------|");
  lines.push("| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |");
  lines.push("| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |");
  lines.push("| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |");
  lines.push("| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |");
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Component Specs");
  lines.push("");

  lines.push("### Buttons");
  lines.push("");
  lines.push("```css");
  lines.push("/* Primary Button */");
  lines.push(".btn-primary {");
  lines.push(`  background: ${colors.cta ?? "#F97316"};`);
  lines.push("  color: white;");
  lines.push("  padding: 12px 24px;");
  lines.push("  border-radius: 8px;");
  lines.push("  font-weight: 600;");
  lines.push("  transition: all 200ms ease;");
  lines.push("  cursor: pointer;");
  lines.push("}");
  lines.push("");
  lines.push(".btn-primary:hover {");
  lines.push("  opacity: 0.9;");
  lines.push("  transform: translateY(-1px);");
  lines.push("}");
  lines.push("");
  lines.push("/* Secondary Button */");
  lines.push(".btn-secondary {");
  lines.push(`  background: transparent;`);
  lines.push(`  color: ${colors.primary ?? "#2563EB"};`);
  lines.push(`  border: 2px solid ${colors.primary ?? "#2563EB"};`);
  lines.push("  padding: 12px 24px;");
  lines.push("  border-radius: 8px;");
  lines.push("  font-weight: 600;");
  lines.push("  transition: all 200ms ease;");
  lines.push("  cursor: pointer;");
  lines.push("}");
  lines.push("```");
  lines.push("");

  lines.push("### Cards");
  lines.push("");
  lines.push("```css");
  lines.push(".card {");
  lines.push(`  background: ${colors.background ?? "#FFFFFF"};`);
  lines.push("  border-radius: 12px;");
  lines.push("  padding: 24px;");
  lines.push("  box-shadow: var(--shadow-md);");
  lines.push("  transition: all 200ms ease;");
  lines.push("  cursor: pointer;");
  lines.push("}");
  lines.push("");
  lines.push(".card:hover {");
  lines.push("  box-shadow: var(--shadow-lg);");
  lines.push("  transform: translateY(-2px);");
  lines.push("}");
  lines.push("```");
  lines.push("");

  lines.push("### Inputs");
  lines.push("");
  lines.push("```css");
  lines.push(".input {");
  lines.push("  padding: 12px 16px;");
  lines.push("  border: 1px solid #E2E8F0;");
  lines.push("  border-radius: 8px;");
  lines.push("  font-size: 16px;");
  lines.push("  transition: border-color 200ms ease;");
  lines.push("}");
  lines.push("");
  lines.push(".input:focus {");
  lines.push(`  border-color: ${colors.primary ?? "#2563EB"};`);
  lines.push("  outline: none;");
  lines.push(`  box-shadow: 0 0 0 3px ${colors.primary ?? "#2563EB"}20;`);
  lines.push("}");
  lines.push("```");
  lines.push("");

  lines.push("### Modals");
  lines.push("");
  lines.push("```css");
  lines.push(".modal-overlay {");
  lines.push("  background: rgba(0, 0, 0, 0.5);");
  lines.push("  backdrop-filter: blur(4px);");
  lines.push("}");
  lines.push("");
  lines.push(".modal {");
  lines.push("  background: white;");
  lines.push("  border-radius: 16px;");
  lines.push("  padding: 32px;");
  lines.push("  box-shadow: var(--shadow-xl);");
  lines.push("  max-width: 500px;");
  lines.push("  width: 90%;");
  lines.push("}");
  lines.push("```");
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Style Guidelines");
  lines.push("");
  lines.push(`**Style:** ${style.name ?? "Minimalism"}`);
  lines.push("");
  if (style.keywords) {
    lines.push(`**Keywords:** ${style.keywords ?? ""}`);
    lines.push("");
  }
  if (style.best_for) {
    lines.push(`**Best For:** ${style.best_for ?? ""}`);
    lines.push("");
  }
  if (effects) {
    lines.push(`**Key Effects:** ${effects}`);
    lines.push("");
  }

  lines.push("### Page Pattern");
  lines.push("");
  lines.push(`**Pattern Name:** ${pattern.name ?? ""}`);
  lines.push("");
  if (pattern.conversion) {
    lines.push(`- **Conversion Strategy:** ${pattern.conversion ?? ""}`);
  }
  if (pattern.cta_placement) {
    lines.push(`- **CTA Placement:** ${pattern.cta_placement ?? ""}`);
  }
  lines.push(`- **Section Order:** ${pattern.sections ?? ""}`);
  lines.push("");

  if (motionSnippet && Object.keys(motionSnippet).length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Motion");
    lines.push("");
    lines.push(`**${motionSnippet.Category ?? ""}** (${motionSnippet["Intensity Tier"] ?? ""}) — Trigger: ${motionSnippet.Trigger ?? ""} | Duration: ${motionSnippet.Duration ?? ""} | Easing: \`${motionSnippet.Easing ?? ""}\``);
    lines.push("");
    lines.push("```js");
    lines.push(motionSnippet["GSAP Snippet"] ?? "");
    lines.push("```");
    lines.push("");
    if (motionSnippet["Framework Notes"]) {
      lines.push(`**Framework notes:** ${motionSnippet["Framework Notes"] ?? ""}`);
      lines.push("");
    }
    const motionDo = motionSnippet.Do ?? "";
    const motionDont = motionSnippet["Don't"] ?? "";
    if (motionDo) {
      lines.push(`- ✅ ${motionDo}`);
    }
    if (motionDont) {
      lines.push(`- ❌ ${motionDont}`);
    }
    if (motionSnippet["Performance Notes"]) {
      lines.push(`- ⚡ ${motionSnippet["Performance Notes"] ?? ""}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Anti-Patterns (Do NOT Use)");
  lines.push("");
  if (antiPatterns) {
    const antiList = String(antiPatterns).split("+").map((a) => a.trim());
    for (const anti of antiList) {
      if (anti) {
        lines.push(`- ❌ ${anti}`);
      }
    }
  }
  lines.push("");
  lines.push("### Additional Forbidden Patterns");
  lines.push("");
  lines.push("- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)");
  lines.push("- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer");
  lines.push("- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout");
  lines.push("- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio");
  lines.push("- ❌ **Instant state changes** — Always use transitions (150-300ms)");
  lines.push("- ❌ **Invisible focus states** — Focus states must be visible for a11y");
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Pre-Delivery Checklist");
  lines.push("");
  lines.push("Before delivering any UI code, verify:");
  lines.push("");
  lines.push("- [ ] No emojis used as icons (use SVG instead)");
  lines.push("- [ ] All icons from consistent icon set (Heroicons/Lucide)");
  lines.push("- [ ] `cursor-pointer` on all clickable elements");
  lines.push("- [ ] Hover states with smooth transitions (150-300ms)");
  lines.push("- [ ] Light mode: text contrast 4.5:1 minimum");
  lines.push("- [ ] Focus states visible for keyboard navigation");
  lines.push("- [ ] `prefers-reduced-motion` respected");
  lines.push("- [ ] Responsive: 375px, 768px, 1024px, 1440px");
  lines.push("- [ ] No content hidden behind fixed navbars");
  lines.push("- [ ] No horizontal scroll on mobile");
  lines.push("");

  return lines.join("\n");
}

export function formatPageOverrideMd(designSystem, pageName, pageQuery = null) {
  const project = designSystem.project_name ?? "PROJECT";
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const pageTitle = String(pageName).replace(/-/g, " ").replace(/_/g, " ").split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

  const pageOverrides = generateIntelligentOverrides(pageName, pageQuery, designSystem);

  const lines = [];

  lines.push(`# ${pageTitle} Page Overrides`);
  lines.push("");
  lines.push(`> **PROJECT:** ${project}`);
  lines.push(`> **Generated:** ${timestamp}`);
  lines.push(`> **Page Type:** ${pageOverrides.page_type ?? "General"}`);
  lines.push("");
  lines.push("> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).");
  lines.push("> Only deviations from the Master are documented here. For all other rules, refer to the Master.");
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("## Page-Specific Rules");
  lines.push("");

  lines.push("### Layout Overrides");
  lines.push("");
  const layout = pageOverrides.layout || {};
  if (Object.keys(layout).length > 0) {
    for (const [key, value] of Object.entries(layout)) {
      lines.push(`- **${key}:** ${value}`);
    }
  } else {
    lines.push("- No overrides — use Master layout");
  }
  lines.push("");

  lines.push("### Spacing Overrides");
  lines.push("");
  const spacing = pageOverrides.spacing || {};
  if (Object.keys(spacing).length > 0) {
    for (const [key, value] of Object.entries(spacing)) {
      lines.push(`- **${key}:** ${value}`);
    }
  } else {
    lines.push("- No overrides — use Master spacing");
  }
  lines.push("");

  lines.push("### Typography Overrides");
  lines.push("");
  const typography = pageOverrides.typography || {};
  if (Object.keys(typography).length > 0) {
    for (const [key, value] of Object.entries(typography)) {
      lines.push(`- **${key}:** ${value}`);
    }
  } else {
    lines.push("- No overrides — use Master typography");
  }
  lines.push("");

  lines.push("### Color Overrides");
  lines.push("");
  const colors = pageOverrides.colors || {};
  if (Object.keys(colors).length > 0) {
    for (const [key, value] of Object.entries(colors)) {
      lines.push(`- **${key}:** ${value}`);
    }
  } else {
    lines.push("- No overrides — use Master colors");
  }
  lines.push("");

  lines.push("### Component Overrides");
  lines.push("");
  const components = pageOverrides.components || [];
  if (components.length > 0) {
    for (const comp of components) {
      lines.push(`- ${comp}`);
    }
  } else {
    lines.push("- No overrides — use Master component specs");
  }
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Page-Specific Components");
  lines.push("");
  const uniqueComponents = pageOverrides.unique_components || [];
  if (uniqueComponents.length > 0) {
    for (const comp of uniqueComponents) {
      lines.push(`- ${comp}`);
    }
  } else {
    lines.push("- No unique components for this page");
  }
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Recommendations");
  lines.push("");
  const recommendations = pageOverrides.recommendations || [];
  if (recommendations.length > 0) {
    for (const rec of recommendations) {
      lines.push(`- ${rec}`);
    }
  }
  lines.push("");

  return lines.join("\n");
}

export function generateIntelligentOverrides(pageName, pageQuery, designSystem) {
  void designSystem;
  const pageLower = String(pageName).toLowerCase();
  const queryLower = String(pageQuery ?? "").toLowerCase();
  const combinedContext = `${pageLower} ${queryLower}`;

  const styleSearch = search(combinedContext, "style", 1);
  const uxSearch = search(combinedContext, "ux", 3);
  const landingSearch = search(combinedContext, "landing", 1);

  const styleResults = styleSearch.results || [];
  const uxResults = uxSearch.results || [];
  const landingResults = landingSearch.results || [];

  const pageType = detectPageType(combinedContext, styleResults);

  const layout = {};
  const spacing = {};
  const typography = {};
  const colors = {};
  const components = [];
  const uniqueComponents = [];
  let recommendations = [];

  if (styleResults.length > 0) {
    const style = styleResults[0];
    const keywords = String(style.Keywords ?? "");

    if (["data", "dense", "dashboard", "grid"].some((kw) => keywords.toLowerCase().includes(kw))) {
      layout["Max Width"] = "1400px or full-width";
      layout.Grid = "12-column grid for data flexibility";
      spacing["Content Density"] = "High — optimize for information display";
    } else if (["minimal", "simple", "clean", "single"].some((kw) => keywords.toLowerCase().includes(kw))) {
      layout["Max Width"] = "800px (narrow, focused)";
      layout.Layout = "Single column, centered";
      spacing["Content Density"] = "Low — focus on clarity";
    } else {
      layout["Max Width"] = "1200px (standard)";
      layout.Layout = "Full-width sections, centered content";
    }

    const effects = style["Effects & Animation"] ?? "";
    if (effects) {
      recommendations.push(`Effects: ${effects}`);
    }
  }

  for (const ux of uxResults) {
    const category = ux.Category ?? "";
    const doText = ux.Do ?? "";
    const dontText = ux["Don't"] ?? "";
    if (doText) {
      recommendations.push(`${category}: ${doText}`);
    }
    if (dontText) {
      components.push(`Avoid: ${dontText}`);
    }
  }

  if (landingResults.length > 0) {
    const landing = landingResults[0];
    const sections = landing["Section Order"] ?? "";
    const ctaPlacement = landing["Primary CTA Placement"] ?? "";
    const colorStrategy = landing["Color Strategy"] ?? "";

    if (sections) {
      layout.Sections = sections;
    }
    if (ctaPlacement) {
      recommendations.push(`CTA Placement: ${ctaPlacement}`);
    }
    if (colorStrategy) {
      colors.Strategy = colorStrategy;
    }
  }

  if (Object.keys(layout).length === 0) {
    layout["Max Width"] = "1200px";
    layout.Layout = "Responsive grid";
  }

  if (recommendations.length === 0) {
    recommendations = [
      "Refer to MASTER.md for all design rules",
      "Add specific overrides as needed for this page",
    ];
  }

  return {
    page_type: pageType,
    layout,
    spacing,
    typography,
    colors,
    components,
    unique_components: uniqueComponents,
    recommendations,
  };
}

export function detectPageType(context, styleResults) {
  const contextLower = String(context).toLowerCase();

  const pagePatterns = [
    [["dashboard", "admin", "analytics", "data", "metrics", "stats", "monitor", "overview"], "Dashboard / Data View"],
    [["checkout", "payment", "cart", "purchase", "order", "billing"], "Checkout / Payment"],
    [["settings", "profile", "account", "preferences", "config"], "Settings / Profile"],
    [["landing", "marketing", "homepage", "hero", "home", "promo"], "Landing / Marketing"],
    [["login", "signin", "signup", "register", "auth", "password"], "Authentication"],
    [["pricing", "plans", "subscription", "tiers", "packages"], "Pricing / Plans"],
    [["blog", "article", "post", "news", "content", "story"], "Blog / Article"],
    [["product", "item", "detail", "pdp", "shop", "store"], "Product Detail"],
    [["search", "results", "browse", "filter", "catalog", "list"], "Search Results"],
    [["empty", "404", "error", "not found", "zero"], "Empty State"],
  ];

  for (const [keywords, pageType] of pagePatterns) {
    if (keywords.some((kw) => contextLower.includes(kw))) {
      return pageType;
    }
  }

  if (styleResults && styleResults.length > 0) {
    const styleName = String(styleResults[0]["Style Category"] ?? "").toLowerCase();
    void styleName;
    const bestFor = String(styleResults[0]["Best For"] ?? "").toLowerCase();

    if (bestFor.includes("dashboard") || bestFor.includes("data")) {
      return "Dashboard / Data View";
    } else if (bestFor.includes("landing") || bestFor.includes("marketing")) {
      return "Landing / Marketing";
    }
  }

  return "General";
}
