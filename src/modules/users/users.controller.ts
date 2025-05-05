import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	InternalServerErrorException,
	HttpStatus,
	UseGuards
} from "@nestjs/common";
import { UserFacadeService } from "./services/user.facade.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FindOneDto } from "./dto/find-one.dto";
import { FindMultipleUsersDto } from "./dto/find-multiple-users.dto";
import { 
	ApiOperation, 
	ApiResponse, 
	ApiQuery, 
	ApiTags, 
	ApiParam, 
	ApiBody,
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiInternalServerErrorResponse,
	ApiCreatedResponse,
	ApiBearerAuth,
	ApiUnauthorizedResponse
} from "@nestjs/swagger";
import { UsersPageResponseEntity } from "./entities/users-page-response.entity";
import { LoggerService } from "../../shared/common/services/logger.service";
import { UserResponseEntity } from "./entities/user-response.entity";
import { JwtAuthGuard } from "../../modules/auth/guards/jwt-auth.guard";
import { Public } from "../../modules/auth/decorators/public.decorator";

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller("users")
export class UsersController {
	constructor(
		private readonly facade: UserFacadeService,
		private readonly logger: LoggerService
	) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Create a new user' })
	@ApiCreatedResponse({
		description: 'The user has been successfully created',
		type: UserResponseEntity
	})
	@ApiBadRequestResponse({ 
		description: 'Invalid input data' 
	})
	@ApiInternalServerErrorResponse({ 
		description: 'Internal server error' 
	})
	@ApiBody({ 
		type: CreateUserDto,
		description: 'User data to create'
	})
	async create(@Body() user: CreateUserDto): Promise<UserResponseEntity> {
		try {
			return await this.facade.create(user);
		} catch (error) {
			this.logger.error(`Error creating user: ${error.message}`, error.stack);
			throw new InternalServerErrorException('Failed to create user');
		}
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Find all users with pagination and search' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'Returns a paginated list of users',
		type: UsersPageResponseEntity
	})
	@ApiQuery({
		name: 'search',
		required: false,
		description: 'Search term to filter users by name, email, or CRM'
	})
	@ApiQuery({
		name: 'page',
		required: false,
		description: 'Page number (starts at 1)',
		type: Number,
		example: 1
	})
	@ApiQuery({
		name: 'limit',
		required: false,
		description: 'Number of items per page',
		type: Number,
		example: 10
	})
	@ApiInternalServerErrorResponse({ 
		description: 'Internal server error' 
	})
	async findAll(@Query() dto: FindMultipleUsersDto): Promise<UsersPageResponseEntity> {
		try {
			return await this.facade.findWithPagination(
				{ page: dto.page, limit: dto.limit },
				{ search: dto.search }
			);
		} catch (error) {
			this.logger.error(`Error finding users: ${error.message}`, error.stack);
			throw new InternalServerErrorException('Failed to retrieve users');
		}
	}

	@Patch(":id")
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Update a user by ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The user has been successfully updated',
		type: UserResponseEntity
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the user to update',
		required: true
	})
	@ApiBody({ 
		type: UpdateUserDto,
		description: 'User data to update'
	})
	@ApiBadRequestResponse({ 
		description: 'Invalid input data' 
	})
	@ApiNotFoundResponse({ 
		description: 'User not found' 
	})
	@ApiInternalServerErrorResponse({ 
		description: 'Internal server error' 
	})
	async update(@Param() { id }: FindOneDto, @Body() user: UpdateUserDto): Promise<UserResponseEntity> {
		try {
			return await this.facade.update(id, user);
		} catch (error) {
			this.logger.error(`Error updating user ${id}: ${error.message}`, error.stack);
			throw new InternalServerErrorException('Failed to update user');
		}
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard)
	@ApiOperation({ summary: 'Delete a user by ID' })
	@ApiResponse({
		status: HttpStatus.OK,
		description: 'The user has been successfully deleted',
		type: UserResponseEntity
	})
	@ApiParam({
		name: 'id',
		description: 'The ID of the user to delete',
		required: true
	})
	@ApiNotFoundResponse({ 
		description: 'User not found' 
	})
	@ApiInternalServerErrorResponse({ 
		description: 'Internal server error' 
	})
	async delete(@Param() { id }: FindOneDto): Promise<UserResponseEntity> {
		try {
			return await this.facade.delete(id);
		} catch (error) {
			this.logger.error(`Error deleting user ${id}: ${error.message}`, error.stack);
			throw new InternalServerErrorException('Failed to delete user');
		}
	}
}
