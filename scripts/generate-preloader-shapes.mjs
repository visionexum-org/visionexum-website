import opentype from "opentype.js";
import { readFileSync, writeFileSync } from "node:fs";

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SIZE = 200;

/* ---------- 1. "100" outline from Sora ---------- */
const font = opentype.parse(
  readFileSync(`${ROOT}/src/fonts/sora/Sora-VariableFont_wght.ttf`).buffer
);
const numberPath = font.getPath("100", 0, 0, SIZE);
const numberD = numberPath.toPathData(2);
const nb = numberPath.getBoundingBox();

/* ---------- 2. logo paths, parsed and transformed ---------- */
const logoSrc = readFileSync(`${ROOT}/src/components/shared/logo.tsx`, "utf8");
const logoDs = [...logoSrc.matchAll(/d="([^"]+)"/g)].map((m) => m[1]);

// Only M, L, H, V and Z appear in the mark, so a token walk is exact.
function walk(d, onPoint) {
  const tokens = d.match(/[MLHVZmlhvz]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let cmd = "M";
  let x = 0;
  let y = 0;
  const out = [];
  for (let i = 0; i < tokens.length; ) {
    if (/[MLHVZmlhvz]/.test(tokens[i])) {
      cmd = tokens[i];
      i += 1;
      if (cmd.toUpperCase() === "Z") out.push({ cmd: "Z" });
      continue;
    }
    if (cmd === "M" || cmd === "L") {
      x = parseFloat(tokens[i]);
      y = parseFloat(tokens[i + 1]);
      i += 2;
    } else if (cmd === "H") {
      x = parseFloat(tokens[i]);
      i += 1;
    } else if (cmd === "V") {
      y = parseFloat(tokens[i]);
      i += 1;
    } else {
      throw new Error(`unsupported command in logo path: ${cmd}`);
    }
    onPoint(x, y);
    out.push({ cmd: cmd === "H" || cmd === "V" ? "L" : cmd, x, y });
  }
  return out;
}

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
const parsed = logoDs.map((d) =>
  walk(d, (x, y) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  })
);

const logoW = maxX - minX;
const logoH = maxY - minY;
const numW = nb.x2 - nb.x1;
const numH = nb.y2 - nb.y1;

// Fit the mark to the number's optical box, preserving its aspect ratio, then
// centre it so the morph neither drifts nor distorts.
const scale = Math.min(numW / logoW, numH / logoH);
const drawnW = logoW * scale;
const drawnH = logoH * scale;
const offsetX = (nb.x1 + nb.x2) / 2 - (minX * scale + drawnW / 2);
const offsetY = (nb.y1 + nb.y2) / 2 - (minY * scale + drawnH / 2);

const round = (n) => Number(n.toFixed(2));
const logoD = parsed
  .map((cmds) =>
    cmds
      .map((c) =>
        c.cmd === "Z"
          ? "Z"
          : `${c.cmd}${round(c.x * scale + offsetX)} ${round(c.y * scale + offsetY)}`
      )
      .join("")
  )
  .join("");

/* ---------- 3. emit ---------- */
const pad = 8;
const viewBox = [
  round(nb.x1 - pad),
  round(nb.y1 - pad),
  round(numW + pad * 2),
  round(numH + pad * 2),
].join(" ");

const file = `// Generated from src/fonts/sora and src/components/shared/logo.tsx.
// The counter's final value and the brand mark are expressed as a single
// compound path each, in one shared coordinate space, so MorphSVGPlugin can
// interpolate between them without the shape drifting or distorting.
export const MORPH_VIEW_BOX = "${viewBox}";

// "100" set in Sora at the weight used by the counter.
export const NUMBER_PATH =
  "${numberD}";

// The brand mark, scaled and centred onto the number's optical box.
export const LOGO_PATH =
  "${logoD}";
`;

writeFileSync(`${ROOT}/src/lib/preloader-shapes.ts`, file);

console.log("number bbox:", round(numW), "x", round(numH));
console.log("logo bbox  :", round(logoW), "x", round(logoH), "-> scaled", round(drawnW), "x", round(drawnH));
console.log("viewBox    :", viewBox);
console.log("subpaths   : number", (numberD.match(/M/g) || []).length, "| logo", (logoD.match(/M/g) || []).length);
console.log("written    : src/lib/preloader-shapes.ts");
