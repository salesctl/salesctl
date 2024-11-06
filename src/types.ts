export interface Prospect {
  email: string;
  name: string;
  company: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Step {
  email: string;
  wait?: `${number}${"d" | "h" | "m" | "s"}`;
}

export interface Sequence {
  steps: Step[];
}

export interface Config {
  from?: string;
  track?: boolean;
  sequences: Record<string, Sequence>;
}

export type DurationType = Step["wait"];
export type SequenceName = keyof Config["sequences"];
