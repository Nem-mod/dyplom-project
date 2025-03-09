import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TimescaleModule } from '../timescale/timescale.module';

@Module({
  imports: [PrismaModule, TimescaleModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
