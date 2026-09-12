#!/usr/bin/env node
// Node port of search.py (stdlib only, no dependencies).
// UI/UX Pro Max Search - BM25 search engine for UI/UX style guides
// Usage: node search.mjs "<query>" [--domain <domain>] [--stack <stack>] [--max-results 3]
//        node search.mjs "<query>" --design-system [-p "Project Name"]
//        node search.mjs "<query>" --design-system --persist [-p "Project Name"] --output-dir "<project-root>" [--page "dashboard"]
//        node search.mjs "<query>" --design-system --variance 8 --motion 9 --density 7

import { CSV_CONFIG, AVAILABLE_STACKS, MAX_RESULTS, UNTRUNCATED_COLS, search, searchStack, pyStr } from "./core.mjs";
import { generateDesignSystem } from "./design_system.mjs";

const TRUNCATE_AT = 300;
const PROG = "search.mjs";

function fail(message) {
  process.stderr.write(`${PROG}: error: ${message}\n`);
  process.exit(2);
}

function parseIntArg(name, raw, min, max) {
  if (!/^[+-]?\d+$/.test(raw)) {
    fail(`argument ${name}: invalid integer value: '${raw}'`);
  }
  const value = parseInt(raw, 10);
  if (value < min || value > max) {
    fail(`argument ${name}: invalid choice: ${value} (choose from ${min}-${max})`);
  }
  return value;
}

function parseArgs(argv) {
  const args = {
    query: null,
    domain: null,
    stack: null,
    maxResults: MAX_RESULTS,
    json: false,
    full: false,
    designSystem: false,
    projectName: null,
    format: "ascii",
    persist: false,
    page: null,
    outputDir: null,
    force: false,
    variance: null,
    motion: null,
    density: null,
  };
  const domainChoices = Object.keys(CSV_CONFIG);
  // Short flags. Note: -ds is a two-letter short for --design-system.
  const SHORTS_WITH_VALUE = { d: "domain", s: "stack", n: "maxResults", f: "format", p: "projectName", o: "outputDir" };
  const SHORTS_FLAG = { ds: "designSystem" };

  let i = 0;
  let positionalDone = false;
  let queryParts = [];
  const takeValue = (name) => {
    if (i + 1 >= argv.length) fail(`argument ${name}: expected one argument`);
    i++;
    return argv[i];
  };
  while (i < argv.length) {
    const arg = argv[i];
    if (!positionalDone && arg === "--") {
      positionalDone = true;
      i++;
      continue;
    }
    if (!positionalDone && arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      const name = eq === -1 ? arg : arg.slice(0, eq);
      const inline = eq === -1 ? null : arg.slice(eq + 1);
      const valueOf = (flag) => (inline !== null ? inline : takeValue(flag));
      switch (name) {
        case "--domain": {
          const v = valueOf(name);
          if (!domainChoices.includes(v)) {
            fail(`argument --domain: invalid choice: '${v}' (choose from ${domainChoices.map((c) => `'${c}'`).join(", ")})`);
          }
          args.domain = v;
          break;
        }
        case "--stack": {
          const v = valueOf(name);
          if (!AVAILABLE_STACKS.includes(v)) {
            fail(`argument --stack: invalid choice: '${v}' (choose from ${AVAILABLE_STACKS.map((c) => `'${c}'`).join(", ")})`);
          }
          args.stack = v;
          break;
        }
        case "--max-results":
          args.maxResults = parseIntArg(name, valueOf(name), 1, 20);
          break;
        case "--json":
          if (inline !== null) fail(`argument --json: ignored explicit argument '${inline}'`);
          args.json = true;
          break;
        case "--full":
          if (inline !== null) fail(`argument --full: ignored explicit argument '${inline}'`);
          args.full = true;
          break;
        case "--design-system":
          if (inline !== null) fail(`argument --design-system: ignored explicit argument '${inline}'`);
          args.designSystem = true;
          break;
        case "--project-name":
          args.projectName = valueOf(name);
          break;
        case "--format": {
          const v = valueOf(name);
          if (v !== "ascii" && v !== "markdown") {
            fail(`argument --format: invalid choice: '${v}' (choose from 'ascii', 'markdown')`);
          }
          args.format = v;
          break;
        }
        case "--persist":
          if (inline !== null) fail(`argument --persist: ignored explicit argument '${inline}'`);
          args.persist = true;
          break;
        case "--page":
          args.page = valueOf(name);
          break;
        case "--output-dir":
          args.outputDir = valueOf(name);
          break;
        case "--force":
          if (inline !== null) fail(`argument --force: ignored explicit argument '${inline}'`);
          args.force = true;
          break;
        case "--variance":
          args.variance = parseIntArg(name, valueOf(name), 1, 10);
          break;
        case "--motion":
          args.motion = parseIntArg(name, valueOf(name), 1, 10);
          break;
        case "--density":
          args.density = parseIntArg(name, valueOf(name), 1, 10);
          break;
        default:
          fail(`unrecognized arguments: ${arg}`);
      }
      i++;
      continue;
    }
    if (!positionalDone && arg.startsWith("-") && arg.length > 1) {
      const short = arg.slice(1);
      if (short in SHORTS_FLAG) {
        args[SHORTS_FLAG[short]] = true;
        i++;
        continue;
      }
      if (short in SHORTS_WITH_VALUE) {
        const key = SHORTS_WITH_VALUE[short];
        i++;
        if (i >= argv.length) fail(`argument -${short}: expected one argument`);
        const v = argv[i];
        if (key === "domain" && !domainChoices.includes(v)) {
          fail(`argument -${short}: invalid choice: '${v}' (choose from ${domainChoices.map((c) => `'${c}'`).join(", ")})`);
        } else if (key === "stack" && !AVAILABLE_STACKS.includes(v)) {
          fail(`argument -${short}: invalid choice: '${v}' (choose from ${AVAILABLE_STACKS.map((c) => `'${c}'`).join(", ")})`);
        } else if (key === "maxResults") {
          args.maxResults = parseIntArg(`-${short}`, v, 1, 20);
          i++;
          continue;
        } else if (key === "format" && v !== "ascii" && v !== "markdown") {
          fail(`argument -${short}: invalid choice: '${v}' (choose from 'ascii', 'markdown')`);
        }
        args[key] = v;
        i++;
        continue;
      }
      fail(`unrecognized arguments: ${arg}`);
    }
    queryParts.push(arg);
    i++;
  }
  if (queryParts.length === 0) {
    fail("the following arguments are required: query");
  }
  // argparse with a single positional consumes exactly one argument; extras error.
  if (queryParts.length > 1) {
    fail(`unrecognized arguments: ${queryParts.slice(1).join(" ")}`);
  }
  args.query = queryParts[0];
  return args;
}

function formatOutput(result, full = false) {
  if ("error" in result && result.error) {
    return `Error: ${result.error}`;
  }
  const output = [];
  if (result.stack) {
    output.push("## UI Pro Max Stack Guidelines");
    output.push(`**Stack:** ${result.stack} | **Query:** ${result.query}`);
  } else {
    output.push("## UI Pro Max Search Results");
    let domainNote = result.domain;
    if (result.auto_detected) {
      domainNote += " (auto-detected";
      if (result.runner_up_domain) {
        domainNote += `, runner-up: ${result.runner_up_domain}`;
      }
      domainNote += ")";
    }
    output.push(`**Domain:** ${domainNote} | **Query:** ${result.query}`);
  }
  output.push(`**Source:** ${result.file} | **Found:** ${result.count} results\n`);

  if (result.count === 0) {
    const redirect = result.redirect;
    if (redirect) {
      output.push(
        "This legacy style label is now modeled in the " +
          `\`${redirect.domain}\` domain as \`${redirect.id}\`. ` +
          "Search that domain instead of treating a page composition as a visual style."
      );
      return output.join("\n");
    }
    output.push(
      "No matches. This is not a match with an empty value -- the query " +
        "did not hit the database. Retry with broader/different keywords " +
        "before falling back to general defaults, and say explicitly that " +
        "no database match was found if you do fall back."
    );
    const suggestions = result.suggestions || [];
    if (suggestions.length > 0) {
      output.push(`**Closest known terms:** ${suggestions.join(", ")}`);
    }
    return output.join("\n");
  }

  let n = 0;
  for (const row of result.results) {
    n++;
    output.push(`### Result ${n}`);
    for (const [key, value] of Object.entries(row)) {
      let valueStr = pyStr(value);
      if (!full && !UNTRUNCATED_COLS.has(key) && valueStr.length > TRUNCATE_AT) {
        valueStr = valueStr.slice(0, TRUNCATE_AT) + "...";
      }
      output.push(`- **${key}:** ${valueStr}`);
    }
    output.push("");
  }

  return output.join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  // Design system takes priority
  if (args.designSystem) {
    const result = generateDesignSystem(args.query, args.projectName, args.format, {
      persist: args.persist,
      page: args.page,
      outputDir: args.outputDir,
      variance: args.variance,
      motion: args.motion,
      density: args.density,
      force: args.force,
    });

    if (args.json) {
      process.stdout.write(
        JSON.stringify(
          { design_system: result.design_system, persistence: result.persistence },
          null,
          2
        ) + "\n"
      );
    } else {
      process.stdout.write(result.text + "\n");

      if (args.persist) {
        const persistence = result.persistence || {};
        process.stdout.write("\n" + "=".repeat(60) + "\n");
        if (persistence.status === "skipped_exists") {
          process.stdout.write(`⚠️  ${persistence.message ?? "MASTER.md already exists; not overwritten."}\n`);
        } else {
          const dsDir = persistence.design_system_dir ?? "design-system/<project>";
          process.stdout.write(`✅ Design system persisted to ${dsDir}/\n`);
          for (const f of persistence.created_files || []) {
            process.stdout.write(`   📄 ${f}\n`);
          }
          process.stdout.write("\n");
          process.stdout.write(`📖 Usage: When building a page, check ${dsDir}/pages/[page].md first.\n`);
          process.stdout.write("   If it exists, its rules override MASTER.md. Otherwise, use MASTER.md.\n");
        }
        process.stdout.write("=".repeat(60) + "\n");
      }
    }
    return;
  }

  // Stack search
  if (args.stack) {
    const result = searchStack(args.query, args.stack, args.maxResults);
    if (args.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    } else {
      process.stdout.write(formatOutput(result, args.full) + "\n");
    }
    return;
  }

  // Domain search
  const result = search(args.query, args.domain, args.maxResults);
  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } else {
    process.stdout.write(formatOutput(result, args.full) + "\n");
  }
}

main();
