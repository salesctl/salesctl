import { mkdir, writeFile } from "fs/promises";
import { logger } from "../utils/logger";

interface InitOptions {
  verbose?: boolean;
  force?: boolean;
}

const DEFAULT_CONFIG = `
from: sales@company.com

sequences:
  default:
    steps:
      - email: intro
        wait: 2d
      - email: follow-up
        wait: 3d
`;

const DEFAULT_EMAIL = `
subject: Quick question about {company}
---
Hi {name},

I noticed {company} is using {technology} and wanted to
share how we helped similar companies improve their deployment
times by 80%.

Would you be open to a quick call this week?

Best,
{sender}
`;

export async function init(options: InitOptions = {}): Promise<void> {
  try {
    if (options.verbose) {
      logger.debug("Creating project directories...");
    }

    // Create directories
    await mkdir(".salesctl", { recursive: true });
    await mkdir("emails", { recursive: true });

    // Create config files
    await writeFile("salesctl.yaml", DEFAULT_CONFIG.trim());
    await writeFile("emails/intro.md", DEFAULT_EMAIL.trim());
    await writeFile(
      ".env",
      `
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password
    `.trim()
    );

    logger.success("Sales project initialized");
    logger.info("\nNext steps:");
    console.log("1. Configure SMTP settings in .env");
    console.log("2. Import prospects: salesctl import prospects.csv");
    console.log("3. Start sequence: salesctl start");
  } catch (err) {
    logger.error("Failed to initialize project", err);
    process.exit(1);
  }
}
