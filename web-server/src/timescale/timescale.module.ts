import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimescaleService } from './timescale.service';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      name: 'timescaleConnection',
      type: 'postgres',
      host: process.env.TIMESCALE_HOST,
      port: Number(process.env.TIMESCALE_PORT),
      username: process.env.TIMESCALE_USER,
      password: process.env.TIMESCALE_PASSWORD,
      database: process.env.TIMESCALE_DB,
      synchronize: false, // Explicit schema management
    }),
  ],
  providers: [TimescaleService],
  exports: [TimescaleService],
})
export class TimescaleModule {}
