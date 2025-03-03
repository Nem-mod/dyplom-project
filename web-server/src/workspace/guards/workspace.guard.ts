import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

	// TODO: check how it works with double params userId
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = Number(request.params.id); // Extract workspace ID from route params

    if (!user || !workspaceId) {
      throw new ForbiddenException('You are not allowed to access this workspace.');
    }

    // Check if the user is part of the workspace
    const userWorkspace = await this.prisma.userWorkspaces.findFirst({
      where: {
        userId: user.id,
        workspaceId: workspaceId,
      },
    });

    if (!userWorkspace) {
      throw new ForbiddenException('You are not a member of this workspace.');
    }

    return true;
  }
}
