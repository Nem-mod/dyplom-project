import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
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
}