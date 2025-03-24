export class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;

  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.isDeleted = false;
  }
}
