import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardGuard implements CanActivate {
	constructor(private prisma: PrismaService, private reflector: Reflector) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user; // User from JWT

		if (!user) {
			throw new ForbiddenException('User not authenticated');
		}

		const dashboardId = request.params.id;
		if (!dashboardId) return true; // Allow non-ID routes

		const dashboard = await this.prisma.dashboard.findUnique({
			where: { id: Number(dashboardId) },
			include: { workspace: { include: { users: true } } },
		});

		if (!dashboard) {
			throw new ForbiddenException('Dashboard not found');
		}

		const isUserInWorkspace = dashboard.workspace.users.some(u => u.userId === user.id);
		if (!isUserInWorkspace) {
			throw new ForbiddenException('Access denied to this dashboard');
		}

		return true;
	}
}
