import { Injectable, Inject } from "@nestjs/common";
import { AbstractIndexerService } from "../../../shared/common/services";
import { LoggerService } from "../../../shared/common/services/logger.service";
import { ExamDocument } from "../schemas/exam.schema";
import { ExamRepository } from "../repositories/exam.repository";
import { PaginationDto } from "../../../shared/common/dto/pagination.dto";
import { FilterQuery } from "mongoose";
import { PaginatedResponseDto } from "../../../shared/common/dto/pagination.dto";
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ExamIndexerService extends AbstractIndexerService<ExamDocument> {
	constructor(
		private readonly examRepository: ExamRepository,
		logger: LoggerService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {
		super(examRepository, logger, "Exam");
	}

	public override async findWithPagination(
		pagination: PaginationDto,
		filter: FilterQuery<ExamDocument> = {}
	): Promise<PaginatedResponseDto<ExamDocument>> {
		try {
			const cacheKey = `exams:index:${JSON.stringify(pagination)}:${JSON.stringify(filter)}`;
			
			const cachedResult = await this.cacheManager.get<PaginatedResponseDto<ExamDocument>>(cacheKey);
			if (cachedResult) {
				this.logger.log(`Cache hit for exams index with pagination ${pagination.page}/${pagination.limit}`);
				return cachedResult;
			}
			
			const query = this.buildOptimizedQuery(filter);
			
			const projection = {
				_id: 1,
				examDate: 1,
				dateOfBirth: 1,
				age: 1,
				sex: 1,
				categories: 1,
				report: 1,
				'ecgParameters.heartRate': 1,
				fileMetadata: 1,
				createdAt: 1,
				updatedAt: 1,
				isDeleted: 1
			};
			
			const sort: Record<string, 1 | -1> = { examDate: -1, createdAt: -1 };
			
			this.logger.logOperation('findWithPagination', this.entityName, {
				pagination,
				appliedFilter: query
			});
			
			// Get results with optimized query
			const result = await this.examRepository.findWithPagination(
				pagination, 
				query,
				projection,
				sort
			);
			
			await this.cacheManager.set(cacheKey, result, 30);
			
			return result;
		} catch (error) {
			this.logger.logError('findWithPagination', this.entityName, error);
			
			// Provide more specific error messages based on error type
			if (error.name === 'CastError') {
				throw new BadRequestException(`Invalid parameter format in ${this.entityName} query`);
			} else if (error.name === 'ValidationError') {
				throw new BadRequestException(`Invalid filter parameters for ${this.entityName}`);
			}
			
			throw new InternalServerErrorException(
				`Error listing paginated ${this.entityName}s: ${error.message}`,
			);
		}
	}
	
	private buildOptimizedQuery(filter: any): FilterQuery<ExamDocument> {
		const query: FilterQuery<ExamDocument> = { isDeleted: false };
		
		if (filter.search) {
			query.$or = [
				{ report: { $regex: filter.search, $options: "i" } }
			];
			
			const possibleDate = new Date(filter.search);
			if (!isNaN(possibleDate.getTime())) {
				const startOfDay = new Date(possibleDate);
				startOfDay.setHours(0, 0, 0, 0);
				
				const endOfDay = new Date(possibleDate);
				endOfDay.setHours(23, 59, 59, 999);
				
				query.$or.push({ examDate: { $gte: startOfDay, $lte: endOfDay } });
			}
		}
		
		if (filter.status) {
			query.status = filter.status;
		}
		
		if (filter.userId) {
			query.userId = filter.userId;
		}
		
		if (filter.patientId) {
			query.patientId = filter.patientId;
		}
		
		if (filter.dateOfBirthFrom || filter.dateOfBirthTo) {
			query.dateOfBirth = {};
			
			if (filter.dateOfBirthFrom) {
				query.dateOfBirth.$gte = new Date(filter.dateOfBirthFrom);
			}
			
			if (filter.dateOfBirthTo) {
				query.dateOfBirth.$lte = new Date(filter.dateOfBirthTo);
			}
		}
		
		if (filter.minHeartRate !== undefined || filter.maxHeartRate !== undefined) {
			query['ecgParameters.heartRate'] = {};
			
			if (filter.minHeartRate !== undefined) {
				query['ecgParameters.heartRate'].$gte = Number(filter.minHeartRate);
			}
			
			if (filter.maxHeartRate !== undefined) {
				query['ecgParameters.heartRate'].$lte = Number(filter.maxHeartRate);
			}
		}
		
		if (filter.categories && filter.categories.length > 0) {
			if (filter.categoriesMatchType === 'all') {
				query.categories = { $all: filter.categories };
			} else {
				query.categories = { $in: filter.categories };
			}
		}
		
		if (filter.minAge !== undefined || filter.maxAge !== undefined) {
			query.age = {};
			
			if (filter.minAge !== undefined) {
				query.age.$gte = Number(filter.minAge);
			}
			
			if (filter.maxAge !== undefined) {
				query.age.$lte = Number(filter.maxAge);
			}
		}
		
		if (filter.sex) {
			query.sex = filter.sex;
		}
		
		if (filter.examDateFrom || filter.examDateTo) {
			query.examDate = {};
			
			if (filter.examDateFrom) {
				query.examDate.$gte = new Date(filter.examDateFrom);
			}
			
			if (filter.examDateTo) {
				query.examDate.$lte = new Date(filter.examDateTo);
			}
		}
		
		return query;
	}
	
	public async getCategoryCounts(): Promise<Record<string, number>> {
		try {
			const cacheKey = 'exams:category:counts';
			
			// Try to get from cache first
			const cachedResult = await this.cacheManager.get<Record<string, number>>(cacheKey);
			if (cachedResult) {
				return cachedResult;
			}
			
			// Use the repository to perform the aggregation
			const aggregationPipeline = [
				{ $match: { isDeleted: false } },
				{ $unwind: '$categories' },
				{ $group: { _id: '$categories', count: { $sum: 1 } } },
				{ $project: { _id: 0, category: '$_id', count: 1 } }
			];
			
			// Perform the aggregation using the repository's model
			const result = await this.examRepository['model'].aggregate(aggregationPipeline).exec();
			
			// Transform to object format
			const counts: Record<string, number> = {};
			result.forEach((item: any) => {
				counts[item.category] = item.count;
			});
			
			// Cache for 5 minutes
			await this.cacheManager.set(cacheKey, counts, 300);
			
			return counts;
		} catch (error) {
			this.logger.logError('getCategoryCounts', this.entityName, error);
			throw new InternalServerErrorException('Error getting exam category counts');
		}
	}
	
	public async invalidateCache(): Promise<void> {
		try {
			await this.cacheManager.del('exams:category:counts');
			
			this.logger.log('Invalidating exam indexer cache - note that some paginated results may remain cached');
			
			try {
				if (typeof this.cacheManager.reset === 'function') {
					await this.cacheManager.reset();
					this.logger.log('Successfully reset all cache');
				}
			} catch (resetError) {
				this.logger.logError('resetCache', this.entityName, resetError);
			}
		} catch (error) {
			this.logger.logError('invalidateCache', this.entityName, error);
		}
	}
}
