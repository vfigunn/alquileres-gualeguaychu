import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Dataset, Property } from "./types";

let cached: Dataset | null = null;

export function getLocalDataset(): Dataset | null {
  if (cached) return cached;

  const publicPath = resolve(process.cwd(), "public", "data", "properties.json");
  const outPath = resolve(process.cwd(), "out", "data", "properties.json");
  const path = existsSync(publicPath) ? publicPath : existsSync(outPath) ? outPath : null;

  if (!path) return null;

  try {
    const raw = readFileSync(path, "utf-8");
    cached = JSON.parse(raw) as Dataset;
    return cached;
  } catch (e) {
    console.error("[fallback-data] Error reading local JSON:", e);
    return null;
  }
}

export function getLocalFacets() {
  const dataset = getLocalDataset();
  if (!dataset) return { types: {}, neighborhoods: {} };

  const types: Record<string, number> = {};
  const neighborhoods: Record<string, number> = {};

  for (const p of dataset.properties) {
    if (p.property_type) types[p.property_type] = (types[p.property_type] ?? 0) + 1;
    if (p.neighborhood) neighborhoods[p.neighborhood] = (neighborhoods[p.neighborhood] ?? 0) + 1;
  }

  return { types, neighborhoods };
}

export function getLocalProperties(): Property[] {
  return getLocalDataset()?.properties ?? [];
}
