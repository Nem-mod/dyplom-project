import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateDashboardDto {
  @ApiProperty({ example: 'Sales Dashboard', description: 'The name of the dashboard' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1, description: 'The ID of the workspace' })
  @IsInt()
  @IsNotEmpty()
  workspaceId: number;
}
