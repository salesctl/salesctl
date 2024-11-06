#!/usr/bin/env node
import { program } from "commander";
import dotenv from "dotenv";
import { init } from "./commands/init";
import { importCsv } from "./commands/import";
import { start } from "./commands/start";
import { stats } from "./commands/stats";

dotenv.config();

program
  .name("salesctl")
  .description("Sales automation for developers")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize a new sales project")
  .option("-v, --verbose", "show detailed logs")
  .option("-f, --force", "overwrite existing files")
  .action(init);

program
  .command("import <file>")
  .description("Import prospects from CSV")
  .option("-d, --dry-run", "simulate import without adding to database")
  .option("-v, --verbose", "show detailed logs")
  .action(importCsv);

program
  .command("start [sequence]")
  .description('Start a sequence (defaults to "default")')
  .option("-d, --dry-run", "simulate sending without actually sending emails")
  .option("-v, --verbose", "show detailed logs")
  .action(start);

program
  .command("stats")
  .description("Show sequence statistics")
  .option("-j, --json", "output as JSON")
  .option("-v, --verbose", "show detailed logs")
  .action(stats);

program.parse();
