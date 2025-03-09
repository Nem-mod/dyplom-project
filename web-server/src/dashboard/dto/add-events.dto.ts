import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, IsObject, IsArray } from 'class-validator';

export class AddEventsDto {
	@ApiProperty({ example: 'timescaleIdentifier', description: 'The identifier of event table' })
	@IsString()
	@IsNotEmpty()
	timescaleIdentifier: string;

	@ApiProperty({ example: { eventType: "pageview", userId: "12345", metadata: { page: "/home" } }, description: 'The metadata object of event' })
	@IsArray()
	@IsNotEmpty()
	metadata: [Record<string, any>];
}
