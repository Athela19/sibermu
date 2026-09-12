import { readdirSync } from "node:fs";
import { join } from "node:path";

const SCENE_PATTERN = /^scene(\d+)\.jpg$/i;

export function getHeroFrames(): string[] {
  try {
    const dir = join(process.cwd(), "public", "hero");
    return readdirSync(dir)
      .map((f) => ({ n: Number(f.match(SCENE_PATTERN)?.[1]), f }))
      .filter((x) => Number.isFinite(x.n))
      .sort((a, b) => a.n - b.n)
      .map((x) => `/hero/${x.f}`);
  } catch {
    return [];
  }
}
