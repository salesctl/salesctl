import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { DB } from "../db/sqlite";
import { Prospect } from "../types";
import { logger } from "../utils/logger";

interface ImportOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

export async function importCsv(
  file: string,
  options: ImportOptions = {}
): Promise<void> {
  try {
    const db = new DB();
    let count = 0;

    const parser = createReadStream(file).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
      })
    );

    for await (const record of parser) {
      if (options.verbose) {
        logger.debug(`Processing record: ${JSON.stringify(record)}`);
      }

      if (!options.dryRun) {
        await db.addProspect(record as Prospect);
      }
      count++;
    }

    logger.success(
      options.dryRun
        ? `Would import ${count} prospects`
        : `Imported ${count} prospects`
    );
  } catch (err) {
    logger.error("Failed to import prospects", err);
    process.exit(1);
  }
}
