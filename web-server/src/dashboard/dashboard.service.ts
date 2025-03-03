import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async create(createDashboardDto: CreateDashboardDto) {
    return this.prisma.dashboard.create({ data: createDashboardDto });
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
