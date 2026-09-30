import { readdirSync } from "node:fs";
import { join } from "node:path";

const FRAME_PATTERN = /^frame_(\d+)\.webp$/i;

export function getHeroFrames(): string[] {
  try {
    const dir = join(process.cwd(), "public", "hero");
    return readdirSync(dir)
      .map((f) => ({ n: Number(f.match(FRAME_PATTERN)?.[1]), f }))
      .filter((x) => Number.isFinite(x.n))
      .sort((a, b) => a.n - b.n)
      .map((x) => `/hero/${x.f}`);
  } catch {
    return [];
  }
}
