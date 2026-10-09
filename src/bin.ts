#!/usr/bin/env node
import { createDefaultIo, run } from "./cli.js";

const io = createDefaultIo();

run(process.argv.slice(2), io).then(
  (code) => {
    process.exitCode = code;
    io.close();
  },
  (error: unknown) => {
    process.stderr.write(
      `Unerwarteter Fehler: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
    io.close();
  },
);
