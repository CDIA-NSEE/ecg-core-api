import { Injectable } from "@nestjs/common";
import { AbstractIndexerService } from "../../../shared/common/services";
import { LoggerService } from "../../../shared/common/services/logger.service";
import { ExamDocument } from "../schemas/exam.schema";
import { ExamRepository } from "../repositories/exam.repository";
import { PaginationDto } from "../../../shared/common/dto/pagination.dto";
import { FilterQuery } from "mongoose";
import { PaginatedResponseDto } from "../../../shared/common/dto/pagination.dto"
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ExamIndexerService extends AbstractIndexerService<ExamDocument> {
	constructor(
		private readonly examRepository: ExamRepository,
		logger: LoggerService
	) {
		super(examRepository, logger, "Exam");
	}

	public override async findWithPagination(
		pagination: PaginationDto,
		filter: FilterQuery<ExamDocument> = {}
	): Promise<PaginatedResponseDto<ExamDocument>> {
		try {
			const orConditions = [];
			
			if (filter.search) {
				orConditions.push({ title: { $regex: filter.search, $options: "i" } });
				orConditions.push({ description: { $regex: filter.search, $options: "i" } });
				orConditions.push({ report: { $regex: filter.search, $options: "i" } });
			}
			
			// Add specific filters
			const andConditions = [];
			
			if (filter.status) {
				andConditions.push({ status: filter.status });
			}
			
			if (filter.userId) {
				andConditions.push({ userId: filter.userId });
			}
			
			if (filter.patientId) {
				andConditions.push({ patientId: filter.patientId });
			}
			
			// Date of birth range filtering
			if (filter.dateOfBirthFrom || filter.dateOfBirthTo) {
				const dateOfBirthFilter: any = {};
				
				if (filter.dateOfBirthFrom) {
					dateOfBirthFilter.$gte = new Date(filter.dateOfBirthFrom);
				}
				
				if (filter.dateOfBirthTo) {
					dateOfBirthFilter.$lte = new Date(filter.dateOfBirthTo);
				}
				
				andConditions.push({ dateOfBirth: dateOfBirthFilter });
			}
			
			// Amplitude range filtering
			if (filter.minAmplitude !== undefined || filter.maxAmplitude !== undefined) {
				const amplitudeFilter: any = {};
				
				if (filter.minAmplitude !== undefined) {
					amplitudeFilter.$gte = filter.minAmplitude;
				}
				
				if (filter.maxAmplitude !== undefined) {
					amplitudeFilter.$lte = filter.maxAmplitude;
				}
				
				andConditions.push({ amplitude: amplitudeFilter });
			}
			
			// Velocity range filtering
			if (filter.minVelocity !== undefined || filter.maxVelocity !== undefined) {
				const velocityFilter: any = {};
				
				if (filter.minVelocity !== undefined) {
					velocityFilter.$gte = filter.minVelocity;
				}
				
				if (filter.maxVelocity !== undefined) {
					velocityFilter.$lte = filter.maxVelocity;
				}
				
				andConditions.push({ velocity: velocityFilter });
			}
			
			// Categories filtering (any match)
			if (filter.categories && filter.categories.length > 0) {
				andConditions.push({ categories: { $in: filter.categories } });
			}
			
			// Combine OR and AND conditions
			const filterQuery: FilterQuery<ExamDocument> = {};
			
			if (orConditions.length > 0) {
				filterQuery.$or = orConditions;
			}
			
			if (andConditions.length > 0) {
				filterQuery.$and = andConditions;
			}
			
			this.logger.logOperation('findWithPagination', this.entityName, {
				pagination,
				appliedFilter: filterQuery
			});
			
			return this.examRepository.findWithPagination(pagination, filterQuery);
		} catch (error) {
			this.logger.logError('findWithPagination', this.entityName, error);
			throw new InternalServerErrorException(
				`Error listing paginated ${this.entityName}s`,
			);
		}
	}
}
