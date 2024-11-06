import { readFile } from "fs/promises";
import * as yaml from "yaml";
import { DB } from "../db/sqlite";
import { Mailer } from "../mail/sender";
import { Config, SequenceName, Step } from "../utils/types";
import { logger } from "../utils/logger";

interface StartOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

/**
 * Parses duration strings into milliseconds
 * @param duration Duration string in format: \d+[dhms]
 */
function parseDuration(duration: NonNullable<Step["wait"]>): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(
      `Invalid duration format: ${duration}. Expected format: \d+[dhms]`
    );
  }

  const [, value, unit] = match;
  const ms: Record<string, number> = {
    d: 86400000, // 24 * 60 * 60 * 1000
    h: 3600000, // 60 * 60 * 1000
    m: 60000, // 60 * 1000
    s: 1000,
  };

  return parseInt(value) * ms[unit];
}

/**
 * Starts an email sequence for all prospects
 * @param sequenceName Name of the sequence to run
 * @param options Command options
 */
export async function start(
  sequenceName: SequenceName = "default",
  options: StartOptions = {}
): Promise<void> {
  try {
    const config = yaml.parse(
      await readFile("salesctl.yaml", "utf8")
    ) as Config;

    const sequence = config.sequences[sequenceName];
    if (!sequence) {
      throw new Error(`Sequence "${sequenceName}" not found`);
    }

    const fromEmail = config.from || process.env.SMTP_FROM;
    if (!fromEmail) {
      throw new Error(
        "No 'from' email address specified in config or SMTP_FROM environment variable"
      );
    }

    const db = new DB();
    const mailer = new Mailer();
    const prospects = await db.getProspects();

    logger.info(
      `Starting sequence "${sequenceName}" for ${prospects.length} prospects...`
    );

    if (options.dryRun) {
      logger.warn("Dry run mode - no emails will be sent");
    }

    for (const prospect of prospects) {
      for (const step of sequence.steps) {
        if (options.verbose) {
          logger.debug(
            `Processing email "${step.email}" for ${prospect.email}`
          );
        }

        if (!options.dryRun) {
          await mailer.send(`emails/${step.email}.md`, prospect, fromEmail);
          await db.updateSent(prospect.email);
        }

        logger.success(
          options.dryRun
            ? `Would send ${step.email} to ${prospect.email}`
            : `Sent ${step.email} to ${prospect.email}`
        );

        if (step.wait) {
          const duration = step.wait as NonNullable<Step["wait"]>;
          if (options.verbose) {
            logger.debug(`Waiting ${step.wait} before next email`);
          }
          await new Promise<void>((resolve) =>
            setTimeout(resolve, parseDuration(duration))
          );
        }
      }
    }

    logger.success(
      `Sequence ${options.dryRun ? "simulation" : "execution"} completed`
    );
  } catch (err) {
    logger.error("Failed to start sequence", err);
    process.exit(1);
  }
}
