import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) { }

  async create(userId: number, createWorkspaceDto: CreateWorkspaceDto) {
    return this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        users: {
          create: { userId },
        },
      },
      include: { users: true },
    });
  }

  async findAll() {
    return this.prisma.workspace.findMany({
      include: { users: { include: { user: true } }, dashboards: true },
    });
  }

  async findOne(id: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: { users: { include: { user: true } }, dashboards: true },
    });

    if (!workspace) throw new NotFoundException(`Workspace with ID ${id} not found`);
    return workspace;
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
    });
  }

  async delete(id: number) {
    await this.prisma.userWorkspaces.deleteMany({
      where: { workspaceId: id },
    });

    return this.prisma.workspace.delete({
      where: { id },
    });
  }

  async addUserToWorkspace(workspaceId: number, userId: number) {
    return this.prisma.userWorkspaces.create({
      data: { userId, workspaceId },
    });
  }

  async removeUserFromWorkspace(workspaceId: number, userId: number) {
    return this.prisma.userWorkspaces.delete({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
  }
}
