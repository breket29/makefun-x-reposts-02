// Entry for makefun-x-reposts-02.
//
// The entry's substance is POSTS.json: the list of the entrant's own X
// posts that quote make.fun's newest posts. This script's only job is to
// place that list where the grader looks for it.
//
// Standard library only. Deterministic: the output is a byte-for-byte
// copy of the list that ships in this repository.

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const POSTS_FILE = "POSTS.json";

// The folder this repository lives in. The kit's starter uses
// MAKEFUN_BOT_DIR; outside the grader it defaults to /bot.
const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";

// Where the grader reads the entry. MAKEFUN_OUTPUT_DIR lets a local
// run point at a scratch folder instead of /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const source = join(botDir, POSTS_FILE);
const target = join(outputDir, POSTS_FILE);

if (!existsSync(source)) {
  console.error(`error: ${POSTS_FILE} not found in ${botDir}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`error: could not copy ${POSTS_FILE} to ${target}: ${err}`);
  process.exit(1);
}

console.log(`copied ${source} -> ${target}`);

// Prove the copy arrived intact: read it back from the output folder
// and check its shape, so a truncated write or a wrong file cannot
// slip through unnoticed. The list must be an object holding a
// non-empty "posts" array, and every entry must be a post address
// on x.com.
let copied;
try {
  copied = JSON.parse(readFileSync(target, "utf8"));
} catch (err) {
  console.error(`error: ${target} is not readable JSON: ${err}`);
  process.exit(1);
}

if (typeof copied !== "object" || copied === null || Array.isArray(copied)) {
  console.error(`error: ${target} must hold a JSON object, not an array or scalar`);
  process.exit(1);
}

const posts = copied.posts;
if (!Array.isArray(posts) || posts.length === 0) {
  console.error(`error: ${target} must hold a non-empty "posts" array`);
  process.exit(1);
}

for (const entry of posts) {
  if (typeof entry !== "string" || entry.length === 0 || !entry.startsWith("https://x.com/")) {
    console.error(`error: bad post address in ${target}: ${JSON.stringify(entry)}`);
    process.exit(1);
  }
}

console.log(`verified ${posts.length} posts in ${target}`);
