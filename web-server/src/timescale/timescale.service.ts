import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { stringify } from 'csv-stringify';
import { DataSource } from 'typeorm';

@Injectable()
export class TimescaleService {
  constructor(
    @InjectDataSource('timescaleConnection')
    private readonly dataSource: DataSource,
  ) { }

  async createDashboardHypertable(tableName: string) {
    await this.dataSource.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id UUID DEFAULT uuid_generate_v4(),
        timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
        data JSONB NOT NULL,
        PRIMARY KEY (id, timestamp)
      );
    `);

    await this.dataSource.query(`
      SELECT create_hypertable('${tableName}', 'timestamp', if_not_exists => TRUE);
    `);
  }

  async insertDashboardEvent(tableName: string, data: Record<string, any>) {
    await this.dataSource.query(`
      INSERT INTO ${tableName}(data) VALUES ($1);
    `, [JSON.stringify(data)]);
  }

  async getDashboardEventsPaginated(
    tableName: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; }> {
    const offset = (page - 1) * limit;

    // Count total records for pagination
    const countResult = await this.dataSource.query(`
    SELECT COUNT(*) FROM ${tableName};
  `);
    const total = parseInt(countResult[0].count, 10);

    // Fetch paginated data
    const rows = await this.dataSource.query(`
    SELECT * FROM ${tableName}
    ORDER BY timestamp DESC
    LIMIT $1 OFFSET $2;
  `, [limit, offset]);

    return { data: rows, total };
  }

  async insertMultipleDashboardEvents(tableName: string, events: Record<string, any>[]) {
    const query = `
      INSERT INTO ${tableName}(data) 
      SELECT jsonb_array_elements($1::jsonb);
    `;

    await this.dataSource.query(query, [JSON.stringify(events)]);
  }

  async exportEventsToCSV(tableName: string): Promise<Buffer> {
    const rows = await this.dataSource.query(`SELECT * FROM ${tableName} ORDER BY timestamp ASC`);

    if (!rows.length) {
      return Buffer.from('timestamp\n'); // Пустой CSV
    }

    // Распарсить каждый data JSON и добавить timestamp
    const flatRows = rows.map(row => {
      const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
      return {
        timestamp: row.timestamp,
        ...parsed, // spread JSON fields as columns
      };
    });

    return new Promise((resolve, reject) => {
      stringify(flatRows, { header: true }, (err, output) => {
        if (err) return reject(err);
        resolve(Buffer.from(output));
      });
    });
  }
}