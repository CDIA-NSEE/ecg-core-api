import { Injectable } from "@nestjs/common";
import { AbstractIndexerService } from "../../../shared/common/services";
import { LoggerService } from "../../../shared/common/services/logger.service";
import { UserDocument } from "../schemas/user.schema";
import { UserRepository } from "../repositories/user.repository";
import { PaginationDto } from "../../../shared/common/dto/pagination.dto";
import { FilterQuery } from "mongoose";
import { PaginatedResponseDto } from "../../../shared/common/dto/pagination.dto"
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class UserIndexerService extends AbstractIndexerService<UserDocument> {
	constructor(
		private readonly userRepository: UserRepository,
	  logger: LoggerService
	) {
		super(userRepository, logger, "User");
	}

	public override async findWithPagination(
		pagination: PaginationDto,
		filter: FilterQuery<UserDocument> = {}
	): Promise<PaginatedResponseDto<UserDocument>> {
		try {
			const orConditions = [];
			
			if (filter.search) {
				orConditions.push({ name: { $regex: filter.search, $options: "i" } });
				orConditions.push({ email: { $regex: filter.search, $options: "i" } });
				orConditions.push({ crm: { $regex: filter.search, $options: "i" } });
			}
			
			const filterQuery: FilterQuery<UserDocument> = 
				orConditions.length > 0 
					? { $or: orConditions } 
					: {};
			
			this.logger.logOperation('findWithPagination', this.entityName, {
				pagination,
				appliedFilter: filterQuery
			});
			
			return this.userRepository.findWithPagination(pagination, filterQuery);
		} catch (error) {
			this.logger.logError('findWithPagination', this.entityName, error);
			throw new InternalServerErrorException(
				`Error listing paginated ${this.entityName}s`,
			);
		}
	}
}