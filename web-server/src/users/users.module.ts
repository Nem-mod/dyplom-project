import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma.module';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  controllers: [UsersController],
  imports: [PrismaModule, JwtAuthGuard],
  providers: [UsersService],
})
export class UsersModule { }
