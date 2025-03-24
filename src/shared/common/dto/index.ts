// Export DTOs when added

export * from './pagination.dto';

export interface BaseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
