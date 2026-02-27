#!/usr/bin/env node

/**
 * mermaid-studio/scripts/render.mjs
 *
 * Dual-engine Mermaid renderer with automatic fallback.
 * Primary: @mermaid-js/mermaid-cli (mmdc) — supports all diagram types, PNG/SVG/PDF
 * Fallback: beautiful-mermaid — better themes, SVG output
 *
 * Usage:
 *   node render.mjs --input diagram.mmd --output diagram.svg [--format svg|png|pdf] [--theme default] [--width 1200] [--config '{}']
 *   echo "graph LR; A-->B" | node render.mjs --stdin --output out.svg
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, extname, resolve } from "path";
import { createInterface } from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SKILL_DIR = resolve(__dirname, "..");
const DEPS_DIR = process.env.MERMAID_STUDIO_DIR || resolve(SKILL_DIR, ".deps");

// --- Argument parsing ---

function parseArgs(args) {
  const opts = {
    input: null,
    output: null,
    format: "svg",
    theme: "default",
    width: 1200,
    height: null,
    config: null,
    stdin: false,
    engine: "auto", // auto | mmdc | beautiful-mermaid
    background: "white",
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--input":
      case "-i":
        opts.input = args[++i];
        break;
      case "--output":
      case "-o":
        opts.output = args[++i];
        break;
      case "--format":
      case "-f":
        opts.format = args[++i];
        break;
      case "--theme":
      case "-t":
        opts.theme = args[++i];
        break;
      case "--width":
      case "-w":
        opts.width = parseInt(args[++i], 10);
        break;
      case "--height":
        opts.height = parseInt(args[++i], 10);
        break;
      case "--config":
      case "-c":
        opts.config = args[++i];
        break;
      case "--stdin":
        opts.stdin = true;
        break;
      case "--engine":
      case "-e":
        opts.engine = args[++i];
        break;
      case "--background":
      case "--bg":
        opts.background = args[++i];
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
    }
  }

  return opts;
}

function printHelp() {
  console.log(`
Mermaid Studio — Render Script

Usage:
  node render.mjs --input <file.mmd> --output <file.svg> [options]
  echo "graph LR; A-->B" | node render.mjs --stdin --output out.svg

Options:
  --input, -i     Input .mmd file path
  --output, -o    Output file path (required)
  --format, -f    Output format: svg (default), png, pdf
  --theme, -t     Theme name (see SKILL.md for available themes)
  --width, -w     Width in pixels for PNG (default: 1200)
  --height        Height in pixels for PNG (auto-calculated if omitted)
  --config, -c    JSON string with mermaid config overrides
  --engine, -e    Force engine: auto (default), mmdc, beautiful-mermaid
  --background    Background color (default: white)
  --stdin         Read diagram from stdin
  --help, -h      Show this help
`);
}

// --- Engine detection ---

function isMmdcAvailable() {
  try {
    const mmdcPaths = [
      resolve(DEPS_DIR, "node_modules/.bin/mmdc"),
      "mmdc",
    ];
    for (const p of mmdcPaths) {
      try {
        execSync(`${p} --version`, { stdio: "pipe", timeout: 10000 });
        return p;
      } catch {
        continue;
      }
    }
    // Try npx
    execSync("npx mmdc --version", { stdio: "pipe", timeout: 15000 });
    return "npx mmdc";
  } catch {
    return null;
  }
}

function isBeautifulMermaidAvailable() {
  const paths = [
    resolve(DEPS_DIR, "node_modules/beautiful-mermaid"),
    resolve(process.cwd(), "node_modules/beautiful-mermaid"),
  ];
  for (const p of paths) {
    if (existsSync(p)) return p;
  }
  return null;
}

// --- beautiful-mermaid themes ---

const BEAUTIFUL_MERMAID_THEMES = new Set([
  "zinc-light",
  "zinc-dark",
  "tokyo-night",
  "tokyo-night-storm",
  "tokyo-night-light",
  "catppuccin-mocha",
  "catppuccin-latte",
  "nord",
  "nord-light",
  "dracula",
  "github-dark",
  "github-light",
  "solarized-dark",
  "solarized-light",
  "one-dark",
]);

const MMDC_THEMES = new Set(["default", "forest", "dark", "neutral", "base"]);

// --- Rendering engines ---

async function renderWithMmdc(mmdcPath, inputFile, outputFile, opts) {
  const puppeteerConfig = resolve(DEPS_DIR, "puppeteer-config.json");
  const configFile = resolve(DEPS_DIR, ".mermaid-render-config.json");

  // Build mermaid config
  let mermaidConfig = { theme: opts.theme };
  if (opts.config) {
    try {
      const userConfig = JSON.parse(opts.config);
      mermaidConfig = { ...mermaidConfig, ...userConfig };
    } catch (e) {
      console.warn(`Warning: Could not parse --config JSON: ${e.message}`);
    }
  }

  writeFileSync(configFile, JSON.stringify(mermaidConfig, null, 2));

  let cmd = `${mmdcPath} -i "${inputFile}" -o "${outputFile}"`;
  cmd += ` -c "${configFile}"`;
  cmd += ` -b "${opts.background}"`;

  if (opts.format === "png") {
    cmd += ` -w ${opts.width}`;
    if (opts.height) cmd += ` -H ${opts.height}`;
    cmd += ` -s 2`; // 2x scale for crisp PNGs
  }

  if (existsSync(puppeteerConfig)) {
    cmd += ` -p "${puppeteerConfig}"`;
  }

  try {
    execSync(cmd, { stdio: "pipe", timeout: 30000 });
    return true;
  } catch (e) {
    const stderr = e.stderr?.toString() || "";
    console.error(`mmdc failed: ${stderr.slice(0, 200)}`);
    return false;
  }
}

async function renderWithBeautifulMermaid(bmPath, inputFile, outputFile, opts) {
  // Dynamic import of beautiful-mermaid
  try {
    const bm = await import(resolve(bmPath, "index.js")).catch(() =>
      import(resolve(bmPath, "dist/index.js")).catch(() =>
        import(resolve(bmPath, "src/index.js"))
      )
    );

    const mmdContent = readFileSync(inputFile, "utf-8");
    const renderFn = bm.renderMermaid || bm.render || bm.default?.renderMermaid || bm.default?.render;

    if (!renderFn) {
      // If no direct function, try renderMermaidSvg
      const renderSvg = bm.renderMermaidSvg || bm.default?.renderMermaidSvg;
      if (renderSvg) {
        const svg = await renderSvg(mmdContent, { theme: opts.theme });
        writeFileSync(outputFile, svg, "utf-8");
        return true;
      }
      console.error("Could not find render function in beautiful-mermaid");
      return false;
    }

    const result = await renderFn(mmdContent, {
      theme: opts.theme,
      format: opts.format === "png" ? "png" : "svg",
    });

    if (typeof result === "string") {
      writeFileSync(outputFile, result, "utf-8");
    } else if (Buffer.isBuffer(result)) {
      writeFileSync(outputFile, result);
    } else if (result?.svg) {
      writeFileSync(outputFile, result.svg, "utf-8");
    } else if (result?.data) {
      writeFileSync(outputFile, result.data);
    }

    return true;
  } catch (e) {
    console.error(`beautiful-mermaid failed: ${e.message}`);
    return false;
  }
}

// --- Read input ---

async function readFromStdin() {
  return new Promise((resolve) => {
    let data = "";
    const rl = createInterface({ input: process.stdin });
    rl.on("line", (line) => (data += line + "\n"));
    rl.on("close", () => resolve(data.trim()));
  });
}

// --- Main ---

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  // Validate args
  if (!opts.output) {
    console.error("Error: --output is required");
    process.exit(1);
  }

  // Determine format from output extension if not explicitly set
  if (!process.argv.includes("--format") && !process.argv.includes("-f")) {
    const ext = extname(opts.output).toLowerCase();
    if (ext === ".png") opts.format = "png";
    else if (ext === ".pdf") opts.format = "pdf";
    else opts.format = "svg";
  }

  // Get input content
  let inputFile;
  if (opts.stdin) {
    const content = await readFromStdin();
    inputFile = resolve(DEPS_DIR, ".mermaid-stdin-temp.mmd");
    mkdirSync(dirname(inputFile), { recursive: true });
    writeFileSync(inputFile, content, "utf-8");
  } else if (opts.input) {
    inputFile = resolve(opts.input);
    if (!existsSync(inputFile)) {
      console.error(`Error: Input file not found: ${inputFile}`);
      process.exit(1);
    }
  } else {
    console.error("Error: --input or --stdin is required");
    process.exit(1);
  }

  // Ensure output directory exists
  mkdirSync(dirname(resolve(opts.output)), { recursive: true });
  const outputFile = resolve(opts.output);

  // Detect engines
  const mmdcPath = isMmdcAvailable();
  const bmPath = isBeautifulMermaidAvailable();

  console.log(`Input:  ${inputFile}`);
  console.log(`Output: ${outputFile}`);
  console.log(`Format: ${opts.format}`);
  console.log(`Theme:  ${opts.theme}`);
  console.log(`Engines: mmdc=${mmdcPath ? "yes" : "no"}, beautiful-mermaid=${bmPath ? "yes" : "no"}`);

  let success = false;

  // Determine engine order based on theme and format
  const isBeautifulTheme = BEAUTIFUL_MERMAID_THEMES.has(opts.theme);
  const isMmdcTheme = MMDC_THEMES.has(opts.theme);
  const needsPng = opts.format === "png" || opts.format === "pdf";

  if (opts.engine === "mmdc") {
    // Forced mmdc
    if (mmdcPath) {
      success = await renderWithMmdc(mmdcPath, inputFile, outputFile, opts);
    } else {
      console.error("Error: mmdc not available. Run setup.sh first.");
    }
  } else if (opts.engine === "beautiful-mermaid") {
    // Forced beautiful-mermaid
    if (bmPath) {
      success = await renderWithBeautifulMermaid(bmPath, inputFile, outputFile, opts);
    } else {
      console.error("Error: beautiful-mermaid not available. Run setup.sh first.");
    }
  } else {
    // Auto selection
    if (isBeautifulTheme && bmPath && !needsPng) {
      // beautiful-mermaid theme requested, try it first
      console.log("Using beautiful-mermaid (theme match)...");
      success = await renderWithBeautifulMermaid(bmPath, inputFile, outputFile, opts);
      if (!success && mmdcPath) {
        console.log("Falling back to mmdc...");
        const fallbackOpts = { ...opts, theme: "default" };
        success = await renderWithMmdc(mmdcPath, inputFile, outputFile, fallbackOpts);
      }
    } else if (mmdcPath) {
      // Default: mmdc first (best compatibility)
      console.log("Using mmdc (primary)...");
      success = await renderWithMmdc(mmdcPath, inputFile, outputFile, opts);
      if (!success && bmPath && !needsPng) {
        console.log("Falling back to beautiful-mermaid...");
        success = await renderWithBeautifulMermaid(bmPath, inputFile, outputFile, opts);
      }
    } else if (bmPath && !needsPng) {
      // Only beautiful-mermaid available
      console.log("Using beautiful-mermaid (only engine available)...");
      success = await renderWithBeautifulMermaid(bmPath, inputFile, outputFile, opts);
    } else {
      console.error("Error: No rendering engine available. Run setup.sh first.");
      console.error(`  bash ${resolve(__dirname, "setup.sh")}`);
      process.exit(1);
    }
  }

  if (success && existsSync(outputFile)) {
    const stats = readFileSync(outputFile);
    console.log(`\n✓ Rendered successfully: ${outputFile} (${stats.length} bytes)`);
  } else {
    console.error("\n✗ Rendering failed.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`Fatal error: ${e.message}`);
  process.exit(1);
});
