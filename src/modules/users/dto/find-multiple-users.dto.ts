import { PaginationDto } from "../../../shared";
import { ApiProperty } from "@nestjs/swagger";

export class FindMultipleUsersDto extends PaginationDto {
  @ApiProperty({ description: 'Search by name, email or CRM' })
  search?: string;
}