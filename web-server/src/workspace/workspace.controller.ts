import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from './guards/workspace.guard';


// TODO: add role base permissions upd DELETE WORKSPACE
@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard) // Require authentication for all routes
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiBody({ type: CreateWorkspaceDto })
  create(@Request() req, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(req.user.id, createWorkspaceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces' })
  findAll() {
    return this.workspaceService.findAll();
  }

  @Get(':id')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Get a workspace by ID' })
  findOne(@Param('id') id: number) {
    return this.workspaceService.findOne(Number(id));
  }

  @Put(':id')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Update a workspace' })
  update(@Param('id') id: number, @Body() updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.workspaceService.update(Number(id), updateWorkspaceDto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Delete a workspace' })
  delete(@Param('id') id: number) {
    return this.workspaceService.delete(Number(id));
  }

  @Post(':id/users/:userId')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Add a user to a workspace' })
  addUser(@Param('id') workspaceId: number, @Param('userId') userId: number) {
    return this.workspaceService.addUserToWorkspace(Number(workspaceId), Number(userId));
  }

  @Delete(':id/users/:userId')
  @UseGuards(WorkspaceGuard)
  @ApiOperation({ summary: 'Remove a user from a workspace' })
  removeUser(@Param('id') workspaceId: number, @Param('userId') userId: number) {
    return this.workspaceService.removeUserFromWorkspace(Number(workspaceId), Number(userId));
  }
}
