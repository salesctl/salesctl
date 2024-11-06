import { DB } from "../db/sqlite";
import { logger } from "../utils/logger";

interface StatsOptions {
  json?: boolean;
  verbose?: boolean;
}

export async function stats(options: StatsOptions = {}): Promise<void> {
  try {
    const db = new DB();
    const stats = await db.getStats();

    if (options.json) {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      logger.info("Sequence Statistics:");
      console.table(stats);
    }

    if (options.verbose && stats.length > 0) {
      logger.debug(`Retrieved statistics for ${stats.length} sequences`);
    }
  } catch (err) {
    logger.error("Failed to get stats", err);
    process.exit(1);
  }
}
