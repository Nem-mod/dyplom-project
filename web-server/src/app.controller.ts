import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthUser } from './auth/decorators/auth-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  getHello(@Request() req: any, @AuthUser() user: any): string {
    return this.appService.getHello();
  }
}
