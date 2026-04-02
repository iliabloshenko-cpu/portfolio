import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "landing");
const targetDir = path.join(projectRoot, "public", "landing");

const skipNames = new Set([".DS_Store", ".claude"]);

await mkdir(path.dirname(targetDir), { recursive: true });
await rm(targetDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });

await cp(sourceDir, targetDir, {
  recursive: true,
  force: true,
  filter: (sourcePath) => !skipNames.has(path.basename(sourcePath)),
});

// Some Node/fs implementations can leave transient entries behind during recursive replace.
// If that happens, remove stray ignored files after copy rather than failing the whole build.
for (const entry of await readdir(targetDir)) {
  if (skipNames.has(entry)) {
    await rm(path.join(targetDir, entry), { recursive: true, force: true });
  }
}

console.log("[prepare:landing] Synced landing/ to public/landing/");
