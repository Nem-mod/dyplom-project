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

  async insertMultipleDashboardEvents(tableName: string, events: Record<string, any>[]) {
    const query = `
      INSERT INTO ${tableName}(data) 
      SELECT jsonb_array_elements($1::jsonb);
    `;

    await this.dataSource.query(query, [JSON.stringify(events)]);
  }

  async exportEventsToCSV(tableName: string): Promise<Buffer> {
    const events = await this.dataSource.query(`SELECT * FROM ${tableName}`);
    return new Promise((resolve, reject) => {
      stringify(events, { header: true }, (err, output) => {
        if (err) return reject(err);
        resolve(Buffer.from(output));
      });
    });
  }
}