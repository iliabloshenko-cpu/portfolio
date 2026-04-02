import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "landing");
const targetDir = path.join(projectRoot, "public", "landing");

const skipNames = new Set([".DS_Store", ".claude"]);

await rm(targetDir, { recursive: true, force: true });
await mkdir(path.dirname(targetDir), { recursive: true });

await cp(sourceDir, targetDir, {
  recursive: true,
  force: true,
  filter: (sourcePath) => !skipNames.has(path.basename(sourcePath)),
});

console.log("[prepare:landing] Synced landing/ to public/landing/");
