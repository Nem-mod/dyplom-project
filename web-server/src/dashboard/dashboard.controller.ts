import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, ParseIntPipe, BadRequestException, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { DashboardGuard } from './guards/dashboard.guard';
import { AddEventDto } from './dto/add-event.dto';
import { TimescaleService } from '../timescale/timescale.service';
import { AddEventsDto } from './dto/add-events.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { Response } from 'express';
import * as csv from 'csv-parser';

@ApiTags('Dashboards')
@ApiBearerAuth()
@Controller('dashboards')
@UseGuards(JwtAuthGuard, DashboardGuard) // Protects all routes
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService, private readonly timescaleService: TimescaleService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new dashboard' })
  @ApiBody({ type: CreateDashboardDto })
  create(@Body() createDashboardDto: CreateDashboardDto) {
    return this.dashboardService.create(createDashboardDto);
  }


  @Post("/events")
  @ApiOperation({ summary: 'Add new event to events table' })
  @ApiBody({ type: AddEventDto })
  addEvent(@Body() addEventDto: AddEventDto) {
    return this.timescaleService.insertDashboardEvent(addEventDto.timescaleIdentifier, addEventDto.metadata);
  }

  @Post("/events/bulk")
  @ApiOperation({ summary: 'Add multiple events to the events table' })
  @ApiBody({ type: AddEventsDto })
  addMultipleEventsEvent(@Body() addEventDto: AddEventsDto) {
    return this.timescaleService.insertMultipleDashboardEvents(addEventDto.timescaleIdentifier, addEventDto.metadata);
  }

  @Post('/events/bulk/csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('timescaleIdentifier') timescaleIdentifier: string,
  ) {
    console.log('file', file);
    if (!file) throw new BadRequestException('CSV file is required');

    const events: Record<string, any>[] = [];

    await new Promise((resolve, reject) => {
      Readable.from(file.buffer)
        .pipe(csv())
        .on('data', (data) => events.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (!events.length) throw new BadRequestException('No data found in CSV file');

    await this.timescaleService.insertMultipleDashboardEvents(timescaleIdentifier, events);

    return { inserted: events.length };
  }


  @Get('events/export/:tableName')
  async exportEventsCsv(@Param('tableName') tableName: string, @Res() res: Response) {
    try {
      const csvBuffer = await this.timescaleService.exportEventsToCSV(tableName);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${tableName}.csv`);
      res.send(csvBuffer);
    } catch (error) {
      throw new BadRequestException(`Could not export CSV: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all dashboards' })
  findAll() {
    return this.dashboardService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single dashboard by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a dashboard' })
  @ApiBody({ type: UpdateDashboardDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDashboardDto: UpdateDashboardDto) {
    return this.dashboardService.update(id, updateDashboardDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dashboard' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dashboardService.remove(id);
  }
}
