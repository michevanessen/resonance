import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

/**
 * Content hashes for the hand-written CSS and JS.
 *
 * These files keep stable names, so a browser that cached them will keep
 * serving the old copy until its TTL expires no matter what we purge at the
 * edge. Appending a content hash to the URL changes the cache key on every
 * real change, which is the only thing a visitor's own browser will respect.
 */
const hash = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 10);

export default {
  css: hash("src/assets/css/styles.css"),
  js: hash("src/assets/js/script.js"),
};
