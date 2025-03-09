import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TimescaleModule } from './timescale/timescale.module';

@Module({
  imports: [UsersModule, AuthModule, WorkspaceModule, DashboardModule, TimescaleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
