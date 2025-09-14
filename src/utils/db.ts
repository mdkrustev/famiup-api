// src/utils/db.ts

import { Client } from "@neondatabase/serverless";

export type QueryResult<T = any> = {
  rows: T[];
  rowCount: number | null;
};

export class PostgresDB {
  private client: Client | null = null;

  /**
   * Инициализира връзката с базата
   */
  async connect(connectionString: string): Promise<void> {
    this.client = new Client({
      connectionString,
    });

    await this.client.connect();
  }

  /**
   * Изпълнява SQL заявка с параметри
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.client) throw new Error("Database not connected");

    const result = await this.client.query(sql, params);
    return result.rows as T[];
  }

  /**
   * Връща първия ред от заявката
   */
  async first<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Вмъква запис в таблица
   */
  async insert(table: string, data: Record<string, any>): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
    await this.client?.query(sql, values);
  }

  /**
   * Обновява запис в таблица по условие
   */
  async update(table: string, data: Record<string, any>, where: string, params: any[]): Promise<void> {
    const setClauses = Object.keys(data).map((key, i) => `${key} = $${i + 1}`);
    const updatedParams = [...Object.values(data), ...params];

    const sql = `UPDATE ${table} SET ${setClauses.join(", ")} WHERE ${where}`;
    await this.client?.query(sql, updatedParams);
  }

  async insertOrUpdate(
    table: string,
    data: Record<string, any>,
    conflictColumn: string
  ): Promise<void> {
    if (!this.client) throw new Error("Database not connected");

    const keys = Object.keys(data);
    const values = Object.values(data);

    // placeholders: $1, $2, ...
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

    // за UPDATE частта - update само колоните без conflictColumn
    const updates = keys
      .filter((key) => key !== conflictColumn)
      .map((key) => `${key} = EXCLUDED.${key}`) // EXCLUDED е special alias
      .join(", ");

      

    const sql = `
      INSERT INTO ${table} (${keys.join(", ")})
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumn})
      DO UPDATE SET ${updates}
    `;

    await this.client.query(sql, values);
  }

  /**
   * Създава таблица, ако не съществува
   */
  async createTable(name: string, schema: string): Promise<void> {
    const sql = `CREATE TABLE IF NOT EXISTS ${name} (${schema})`;
    await this.client?.query(sql);
  }

  /**
   * Добавя колона към таблица
   */
  async addColumn(table: string, column: string, type: string): Promise<void> {
    const sql = `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${type}`;
    await this.client?.query(sql);
  }

  /**
   * Затваря връзката
   */
  async end(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }
  }
}