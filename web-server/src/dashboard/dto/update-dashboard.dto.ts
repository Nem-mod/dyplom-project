import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDashboardDto } from './create-dashboard.dto';

export class UpdateDashboardDto extends PartialType(CreateDashboardDto) {
  @ApiProperty({ example: 'Updated Dashboard Name', required: false })
  name?: string;
}
