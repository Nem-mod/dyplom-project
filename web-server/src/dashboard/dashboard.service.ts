import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { TimescaleService } from '../timescale/timescale.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService, private readonly timescale: TimescaleService) { }

  async create(createDashboardDto: CreateDashboardDto) {
    const dashboard = await this.prisma.dashboard.create({ data: createDashboardDto });
    const timescaleIdentifier = `dashboard_${dashboard.id}`;

    try {
      await this.timescale.createDashboardHypertable(timescaleIdentifier);

      // Update Prisma dashboard entry with Timescale identifier after successful creation
      const updatedDashboard = await this.prisma.dashboard.update({
        where: { id: dashboard.id },
        data: { timescaleIdentifier },
      });

      return updatedDashboard;

    } catch (error) {
      // Cleanup: remove the created dashboard entry if hypertable creation fails
      await this.prisma.dashboard.delete({ where: { id: dashboard.id } });

      throw new Error(`Failed to create Timescale hypertable: ${error.message}`);
    }

  }

  async findAll() {
    return this.prisma.dashboard.findMany();
  }

  async findOne(id: number) {
    const dashboard = await this.prisma.dashboard.findUnique({ where: { id } });
    if (!dashboard) throw new NotFoundException('Dashboard not found');
    return dashboard;
  }

  async update(id: number, updateDashboardDto: UpdateDashboardDto) {
    return this.prisma.dashboard.update({
      where: { id },
      data: updateDashboardDto,
    });
  }

  async remove(id: number) {
    return this.prisma.dashboard.delete({ where: { id } });
  }
}
