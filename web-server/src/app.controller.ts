import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './user.service';
import { User as UserModel } from '@prisma/client';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly userService: UserService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/user/:id')
  getUserById(): string {
    return this.appService.getHello();
  }

  @Post('user')
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<UserModel> {
    return this.userService.createUser(userData);
  }
}
