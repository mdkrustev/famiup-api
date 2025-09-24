// src/utils/db.ts

import { Client } from "@neondatabase/serverless";

type OmitKeys = "id" | "created_at";
export type Insertable<T> = Partial<Pick<T, Extract<keyof T, OmitKeys>>> & Omit<T, OmitKeys>

export type QueryResult<T = any> = {
  rows: T[];
  rowCount: number | null;
};

export class PostgresDB {

  private client: Client | null = null;
  async connect(connectionString: string): Promise<void> {
    this.client = new Client({
      connectionString,
    });
    await this.client.connect();
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.client) throw new Error("Database not connected");
    const result = await this.client.query(sql, params);
    return result.rows as T[];
  }

  async first<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  };

  async insert<T>(
    table: string,
    data: Insertable<T>
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `
    INSERT INTO ${table} (${keys.join(", ")})
    VALUES (${placeholders})
    RETURNING *
  `;
    const result = await this.client?.query(sql, values);
    if (!result || result.rows.length === 0) {
      throw new Error("Insert failed or no row returned");
    }
    return result.rows[0];
  }

  async update<T>(
    table: string,
    data: Partial<T>,
    where: string,
    params: any[]
  ): Promise<T> {
    if (!this.client) throw new Error("Database not connected");
    const keys = Object.keys(data);
    if (keys.length === 0)
      throw new Error("No fields provided for update");

    const setClauses = keys.map((key, i) => `${key} = $${i + 1}`);
    const updatedParams = [...Object.values(data), ...params];
    const sql = `
      UPDATE ${table}
      SET ${setClauses.join(", ")}
      WHERE ${where}
      RETURNING *
    `;
    const result = await this.client.query(sql, updatedParams);
    if (!result || result.rows.length === 0) {
      throw new Error("Update failed or no row returned");
    }
    return result.rows[0] as T;
  }


  async insertOrUpdate<T>(
    table: string,
    data: Insertable<T>,
    conflictColumn: keyof T
  ): Promise<T> {
    if (!this.client) throw new Error("Database not connected");

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const updates = keys
      .filter((key) => key !== conflictColumn)
      .map((key) => `${key} = EXCLUDED.${key}`)
      .join(", ");

    const sql = `
      INSERT INTO ${table} (${keys.join(", ")})
      VALUES (${placeholders})
      ON CONFLICT (${String(conflictColumn)})
      DO UPDATE SET ${updates}
      RETURNING *
    `;

    const result = await this.client.query(sql, values);

    if (!result || result.rows.length === 0) {
      throw new Error("InsertOrUpdate failed or no row returned");
    }

    return result.rows[0] as T;
  }

  async createTable(name: string, schema: string): Promise<void> {
    const sql = `CREATE TABLE IF NOT EXISTS ${name} (${schema})`;
    await this.client?.query(sql);
  }

  async addColumn(table: string, column: string, type: string): Promise<void> {
    const sql = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`;
    await this.client?.query(sql);
  }

  async end(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }
}