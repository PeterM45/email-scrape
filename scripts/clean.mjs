#!/usr/bin/env node
import { rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const cwd = dirname(fileURLToPath(import.meta.url));
const root = resolve(cwd, "..", "");
const dirs = ["dist", "coverage"];

await Promise.all(
	dirs.map(async (dir) => {
		try {
			await rm(resolve(root, dir), { recursive: true, force: true });
			process.stdout.write(`Removed ${dir}\n`);
		} catch (error) {
			process.stderr.write(`Failed to remove ${dir}: ${error.message}\n`);
		}
	})
);
