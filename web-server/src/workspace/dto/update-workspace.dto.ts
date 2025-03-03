import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWorkspaceDto } from './create-workspace.dto';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {
  @ApiProperty({ example: 'Updated Workspace Name', required: false })
  name?: string;
}
