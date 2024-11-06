import Database from "better-sqlite3";
import { Prospect } from "../utils/types";

interface ProspectRow {
  email: string;
  name: string;
  company: string;
  data: string;
  sent_at: string | null;
  opened_at: string | null;
}

interface StatsRow {
  total: number;
  sent: number;
  opened: number;
}

export class DB {
  private db: Database.Database;

  constructor() {
    this.db = new Database(".salesctl/sales.db");
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prospects (
        email TEXT PRIMARY KEY,
        name TEXT,
        company TEXT,
        data TEXT,
        sent_at DATETIME,
        opened_at DATETIME
      )
    `);

    // Create indexes for performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_prospects_sent_at ON prospects(sent_at);
      CREATE INDEX IF NOT EXISTS idx_prospects_opened_at ON prospects(opened_at);
    `);
  }

  async addProspect(prospect: Prospect): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO prospects (
        email, 
        name, 
        company, 
        data
      ) VALUES (?, ?, ?, ?)
    `);

    const data = JSON.stringify(prospect);
    stmt.run(prospect.email, prospect.name, prospect.company, data);
  }

  async getProspects(): Promise<Prospect[]> {
    const stmt = this.db.prepare("SELECT * FROM prospects");
    const rows = stmt.all() as ProspectRow[];

    return rows.map((row) => ({
      ...JSON.parse(row.data),
      sent_at: row.sent_at ? new Date(row.sent_at) : null,
      opened_at: row.opened_at ? new Date(row.opened_at) : null,
    }));
  }

  async getProspectByEmail(email: string): Promise<Prospect | null> {
    const stmt = this.db.prepare("SELECT * FROM prospects WHERE email = ?");
    const row = stmt.get(email) as ProspectRow | undefined;

    if (!row) return null;

    return {
      ...JSON.parse(row.data),
      sent_at: row.sent_at ? new Date(row.sent_at) : null,
      opened_at: row.opened_at ? new Date(row.opened_at) : null,
    };
  }

  async updateSent(email: string): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE prospects 
      SET sent_at = ? 
      WHERE email = ?
    `);

    stmt.run(new Date().toISOString(), email);
  }

  async updateOpened(email: string): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE prospects 
      SET opened_at = ? 
      WHERE email = ?
    `);

    stmt.run(new Date().toISOString(), email);
  }

  async getStats(): Promise<StatsRow> {
    const stmt = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sent_at IS NOT NULL THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened
      FROM prospects
    `);

    return stmt.get() as StatsRow;
  }

  async getRecentActivity(limit: number = 10): Promise<Prospect[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM prospects 
      WHERE sent_at IS NOT NULL 
      ORDER BY sent_at DESC 
      LIMIT ?
    `);

    const rows = stmt.all(limit) as ProspectRow[];

    return rows.map((row) => ({
      ...JSON.parse(row.data),
      sent_at: row.sent_at ? new Date(row.sent_at) : null,
      opened_at: row.opened_at ? new Date(row.opened_at) : null,
    }));
  }

  close(): void {
    this.db.close();
  }
}
