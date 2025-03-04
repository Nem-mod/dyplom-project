import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DashboardGuard } from './guards/dashboard.guard';

@ApiTags('Dashboards')
@ApiBearerAuth()
@Controller('dashboards')
@UseGuards(JwtAuthGuard, DashboardGuard) // Protects all routes
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dashboard' })
  @ApiBody({ type: CreateDashboardDto })
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dashboards' })
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single dashboard by ID' })
  findOne(@Param('id') id: number) {
    return this.dashboardService.findOne(Number(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a dashboard' })
  @ApiBody({ type: UpdateDashboardDto })
  update(@Param('id') id: number, @Body() updateDashboardDto: UpdateDashboardDto) {
    return this.dashboardService.update(Number(id), updateDashboardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dashboard' })
  remove(@Param('id') id: number) {
    return this.dashboardService.remove(Number(id));
  }
}
