#!/usr/bin/env node
// Node port of reasoning_contract.py (stdlib only, no dependencies).
// Closed, non-executable grammar for design-system decision rules.

export const CONDITION_SIGNALS = {
  if_booking: ["booking", "appointment", "calendar"],
  if_boutique: ["boutique"],
  if_casual: ["casual", "playful"],
  if_checkout: ["checkout", "payment", "purchase"],
  if_children: ["child", "children", "kids"],
  if_collaboration: ["collaboration", "multiplayer", "co-edit"],
  if_competitive: ["competitive", "leaderboard"],
  if_content_focused: ["content", "article", "reading", "documentation"],
  if_conversion_focused: ["conversion", "sales", "signup", "purchase"],
  if_creative_field: ["creative", "artist", "portfolio"],
  if_crop_focused: ["crop", "farm", "agriculture"],
  if_dashboard: ["dashboard", "operations", "monitoring"],
  if_data_heavy: ["data heavy", "data-heavy", "analytics", "large dataset"],
  if_delivery: ["delivery", "courier", "shipping"],
  if_discovery_focused: ["discover", "discovery", "browse", "directory"],
  if_engagement_metric: ["engagement", "retention", "contribution"],
  if_experience_focused: ["experience", "immersive", "journey"],
  if_gamification: ["gamification", "badges", "streak"],
  if_health: ["health", "medical", "patient"],
  if_hero_needed: ["hero", "showcase", "launch"],
  if_large_dataset: ["large dataset", "thousands", "millions"],
  if_light_mode_needed: ["light mode", "light theme"],
  if_low_performance: ["low performance", "low-end", "slow device"],
  if_luxury: ["luxury", "premium", "high-end"],
  if_medication: ["medication", "medicine", "prescription"],
  if_meditation: ["meditation", "breathing", "mindfulness"],
  if_minimal_portfolio: ["minimal portfolio", "simple portfolio"],
  if_mobile: ["mobile", "phone", "tablet", "ios", "android"],
  if_personalized: ["personalized", "personalised", "recommendation"],
  if_pre_launch: ["pre-launch", "prelaunch", "coming soon", "waitlist"],
  if_salary_focused: ["salary", "compensation", "pay range"],
  if_team_collaboration: ["team collaboration", "team workspace"],
  if_trust_needed: ["trust", "secure", "verified", "authority"],
  if_ux_focused: ["ux", "usability", "accessibility", "accessible"],
  if_video_ready: ["video ready", "product video", "demo video"],
};

const ALLOWED_CONDITIONS = new Set(["must_have", ...Object.keys(CONDITION_SIGNALS)]);
const ACTION_PREFIXES = new Set(["constraint", "style", "pattern", "mode"]);
const TOKEN_ACTION_PREFIXES = new Set(["constraint", "style"]);
const TOKEN_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Approximate Python's Unicode \w boundaries (\\w is ASCII-only in JS).
const WB = "[\\p{L}\\p{N}_]";

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const CONDITION_PATTERNS = {};
for (const [condition, signals] of Object.entries(CONDITION_SIGNALS)) {
  CONDITION_PATTERNS[condition] = signals.map(
    (signal) => new RegExp(`(?<!${WB})${escapeRegExp(signal)}(?!${WB})`, "iu")
  );
}

export function parseDecisionRules(raw) {
  let rules;
  try {
    rules = JSON.parse(raw || "{}");
  } catch (error) {
    throw new Error(`invalid decision-rule JSON: ${error.message}`);
  }
  // Detect duplicate keys like Python's object_pairs_hook variant.
  if (rules === null || typeof rules !== "object" || Array.isArray(rules)) {
    throw new Error("decision rules must be a JSON object");
  }
  // Duplicate-key detection: re-scan raw text for repeated keys at depth 1.
  detectDuplicateKeys(raw || "{}");
  for (const [condition, actions] of Object.entries(rules)) {
    if (!ALLOWED_CONDITIONS.has(condition)) {
      throw new Error(`unknown decision-rule condition: ${condition}`);
    }
    if (!Array.isArray(actions) || actions.length === 0) {
      throw new Error(`${condition} must map to a non-empty action array`);
    }
    for (const action of actions) {
      validateAction(action);
    }
    if (new Set(actions).size !== actions.length) {
      throw new Error(`${condition} contains duplicate actions`);
    }
  }
  return rules;
}

function detectDuplicateKeys(raw) {
  // Minimal top-level duplicate-key check mirroring object_pairs_hook.
  let depth = 0;
  let inStr = false;
  let esc = false;
  let start = -1;
  const topKeys = [];
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') {
      inStr = true;
      if (depth === 1 && start === -1) start = i;
    } else if (c === "{") {
      depth++;
      if (depth === 1) start = -1;
    } else if (c === "}") {
      depth--;
    } else if (c === ":" && depth === 1 && start !== -1) {
      try {
        topKeys.push(JSON.parse(raw.slice(start, i)));
      } catch {
        // Ignore; JSON.parse below reports the real syntax error.
      }
      start = -1;
    }
  }
  const seenKeys = new Set();
  for (const k of topKeys) {
    if (seenKeys.has(k)) {
      throw new Error(`duplicate decision-rule key: ${k}`);
    }
    seenKeys.add(k);
  }
}

function validateAction(action) {
  if (typeof action !== "string" || !action.includes(":")) {
    throw new Error(`action must use a known prefix: ${action}`);
  }
  const idx = action.indexOf(":");
  const prefix = action.slice(0, idx);
  const value = action.slice(idx + 1);
  if (!ACTION_PREFIXES.has(prefix)) {
    throw new Error(`unknown decision-rule action: ${action}`);
  }
  if (TOKEN_ACTION_PREFIXES.has(prefix) && !TOKEN_RE.test(value)) {
    throw new Error(`invalid ${prefix} action value: ${value}`);
  }
  if (prefix === "pattern" && !value.trim()) {
    throw new Error("pattern action must name a pattern");
  }
  if (prefix === "mode" && value !== "dark" && value !== "light") {
    throw new Error("mode action must be dark or light");
  }
}

export function applyDecisionRules(rules, query) {
  const normalized = String(query ?? "").toLowerCase();
  const result = { activated: [], style_ids: [], constraints: [], pattern: null, mode: null };
  for (const [condition, actions] of Object.entries(rules)) {
    const patterns = CONDITION_PATTERNS[condition] || [];
    const active =
      condition === "must_have" || patterns.some((pattern) => pattern.test(normalized));
    if (!active) continue;
    result.activated.push({ condition, actions: [...actions] });
    for (const action of actions) {
      const idx = action.indexOf(":");
      const prefix = action.slice(0, idx);
      const value = action.slice(idx + 1);
      if (prefix === "style" && !result.style_ids.includes(value)) {
        result.style_ids.push(value);
      } else if (prefix === "constraint" && !result.constraints.includes(value)) {
        result.constraints.push(value);
      } else if (prefix === "pattern") {
        result.pattern = value;
      } else if (prefix === "mode") {
        result.mode = value;
      }
    }
  }
  return result;
}
