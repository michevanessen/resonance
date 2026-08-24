/**
 * One-off / repeatable pass over committed source images.
 * Caps oversized originals and re-encodes them so the repo stays small and
 * Eleventy Image has less work to do on every Cloudflare Pages build.
 * Run with: npm run optimize:src
 */
import sharp from "sharp";
import { readdir, stat, rename, unlink } from "node:fs/promises";
import path from "node:path";

const DIR = "src/assets/img";
const DEFAULT_MAX_WIDTH = 1800;
const OVERRIDES = { "logo.webp": 700 };
const QUALITY = 80;

const files = (await readdir(DIR)).filter((f) => /\.(webp|png|jpe?g)$/i.test(f));
let savedBytes = 0;

for (const file of files) {
  const src = path.join(DIR, file);
  const maxWidth = OVERRIDES[file] ?? DEFAULT_MAX_WIDTH;
  const before = (await stat(src)).size;
  const meta = await sharp(src).metadata();

  const tmp = path.join(DIR, `.tmp-${file}`);
  await sharp(src)
    .resize({ width: Math.min(meta.width, maxWidth), withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(tmp);

  const after = (await stat(tmp)).size;
  if (after < before) {
    await unlink(src);
    await rename(tmp, src);
    savedBytes += before - after;
    console.log(
      `${file.padEnd(20)} ${meta.width}px ${(before / 1024).toFixed(0)}KB -> ` +
        `${Math.min(meta.width, maxWidth)}px ${(after / 1024).toFixed(0)}KB`
    );
  } else {
    await unlink(tmp);
    console.log(`${file.padEnd(20)} unchanged`);
  }
}

console.log(`\nTotal saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
