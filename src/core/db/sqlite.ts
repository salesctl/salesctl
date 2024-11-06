import sqlite3 from "sqlite3";
import { promisify } from "util";
import { Prospect } from "../types";

export class DB {
  private db: sqlite3.Database;
  private runAsync: (sql: string, params?: any[]) => Promise<void>;
  private allAsync: (sql: string, params?: any[]) => Promise<any[]>;

  constructor() {
    this.db = new sqlite3.Database(".salesctl/sales.db");
    this.runAsync = promisify(this.db.run.bind(this.db));
    this.allAsync = promisify(this.db.all.bind(this.db));
    this.init();
  }

  private async init() {
    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS prospects (
        email TEXT PRIMARY KEY,
        name TEXT,
        company TEXT,
        data TEXT,
        sent_at DATETIME,
        opened_at DATETIME
      )
    `);
  }

  async addProspect(prospect: Prospect): Promise<void> {
    await this.runAsync(
      "INSERT OR REPLACE INTO prospects (email, name, company, data) VALUES (?, ?, ?, ?)",
      [
        prospect.email,
        prospect.name,
        prospect.company,
        JSON.stringify(prospect),
      ]
    );
  }

  async getProspects(): Promise<Prospect[]> {
    return this.allAsync("SELECT * FROM prospects");
  }

  async updateSent(email: string): Promise<void> {
    await this.runAsync("UPDATE prospects SET sent_at = ? WHERE email = ?", [
      new Date().toISOString(),
      email,
    ]);
  }

  async getStats() {
    return this.allAsync(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sent_at IS NOT NULL THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened
      FROM prospects
    `);
  }
}
