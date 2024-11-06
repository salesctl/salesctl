import { readFile } from "fs/promises";
import * as yaml from "yaml";
import { Prospect } from "../types";

interface TemplateMetadata {
  subject: string;
  [key: string]: unknown;
}

interface ParsedTemplate {
  subject: string;
  body: string;
}

/**
 * Parses a template file and replaces variables with prospect data
 * @param templatePath Path to the template file
 * @param prospect Prospect data object
 * @returns Parsed template with replaced variables
 */
export async function parseTemplate(
  templatePath: string,
  prospect: Prospect
): Promise<ParsedTemplate> {
  const template = await readFile(templatePath, "utf8");
  const [frontMatter, ...bodyParts] = template.split("---\n");

  const { subject, ...metadata } = yaml.parse(frontMatter) as TemplateMetadata;
  const body = bodyParts.join("---\n");

  return {
    subject: replaceVariables(subject, prospect),
    body: replaceVariables(body, prospect),
  };
}

/**
 * Replaces variables in text with corresponding values from data object
 * @param text Text containing variables in {key.path} format
 * @param data Object containing replacement values
 * @returns Text with replaced variables
 */
function replaceVariables<T extends Record<string, any>>(
  text: string,
  data: T
): string {
  return text.replace(/{([^}]+)}/g, (match, key: string) => {
    const value = key
      .split(".")
      .reduce<any>((obj: Record<string, any>, key: string) => obj?.[key], data);
    return value?.toString() ?? match;
  });
}
