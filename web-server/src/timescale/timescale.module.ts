import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimescaleService } from './timescale.service';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'timescaleConnection',
      type: 'postgres',
      host: process.env.TIMESCALE_HOST || 'localhost',
      port: Number(process.env.TIMESCALE_PORT) || 5433,
      username: process.env.TIMESCALE_USER || 'admin',
      password: process.env.TIMESCALE_PASSWORD || 'adminpassword',
      database: process.env.TIMESCALE_DB || 'my_timescale_db',
      synchronize: false, // Explicit schema management
    }),
  ],
  providers: [TimescaleService],
  exports: [TimescaleService],
})
export class TimescaleModule {}
