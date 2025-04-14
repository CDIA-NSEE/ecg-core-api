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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Req
} from "@nestjs/common";
import { ExamFacadeService } from "./services/exam.facade.service";
import { CreateExamDto } from "./dto/create-exam.dto";
import { UpdateExamDto } from "./dto/update-exam.dto";
import { FindOneDto } from "./dto/find-one.dto";
import { FindMultipleExamsDto } from "./dto/find-multiple-exams.dto";
import { CreateExamWithFileDto } from "./dto/create-exam-with-file.dto";
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
  ApiConsumes
} from "@nestjs/swagger";
import { ExamsPageResponseEntity } from "./entities/exams-page-response.entity";
import { LoggerService } from "../../shared/common/services/logger.service";
import { ExamResponseEntity } from "./entities/exam-response.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from 'express';
import { MulterFile } from "./interfaces/multer-file.interface";

@ApiTags('Exams')
@Controller("exams")
export class ExamsController {
  constructor(
    private readonly facade: ExamFacadeService,
    private readonly logger: LoggerService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiCreatedResponse({
    description: 'The exam has been successfully created',
    type: ExamResponseEntity
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data' 
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error' 
  })
  @ApiBody({ 
    type: CreateExamDto,
    description: 'Exam data to create'
  })
  async create(@Body() exam: CreateExamDto): Promise<ExamResponseEntity> {
    try {
      return await this.facade.create(exam);
    } catch (error) {
      this.logger.error(`Error creating exam: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create exam');
    }
  }

  @Post('upload')
  @ApiOperation({ summary: 'Create a new exam with file upload' })
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse({
    description: 'The exam has been successfully created with file',
    type: ExamResponseEntity
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data or file' 
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error' 
  })
  @ApiBody({
    type: CreateExamWithFileDto
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExam(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max size
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|dicom)$/ }),
        ],
      }),
    ) 
    file: MulterFile,
    @Body() body: CreateExamWithFileDto
  ): Promise<ExamResponseEntity> {
    try {
      // Create DTO from request data
      const formData: CreateExamWithFileDto = {
        file,
        examDate: body.examDate,
        dateOfBirth: body.dateOfBirth,
        amplitude: body.amplitude,
        velocity: body.velocity,
        report: body.report,
        categories: typeof body.categories === 'string' ? 
          JSON.parse(body.categories) : body.categories,
        status: body.status,
      };
      
      return await this.facade.createWithFile(formData);
    } catch (error) {
      this.logger.error(`Error creating exam with file: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create exam with file');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Find all exams with pagination and search' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a paginated list of exams',
    type: ExamsPageResponseEntity
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter exams by title or description'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (pending, completed, canceled)',
    enum: ['pending', 'completed', 'canceled']
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID'
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    description: 'Filter by patient ID'
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
  async findAll(@Query() dto: FindMultipleExamsDto): Promise<ExamsPageResponseEntity> {
    try {
      return await this.facade.findWithPagination(
        { page: dto.page, limit: dto.limit },
        { 
          search: dto.search,
          status: dto.status,
          userId: dto.userId,
          patientId: dto.patientId
        }
      );
    } catch (error) {
      this.logger.error(`Error finding exams: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve exams');
    }
  }

  @Get(":id")
  @ApiOperation({ summary: 'Find an exam by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the exam with the specified ID',
    type: ExamResponseEntity
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the exam to find',
    required: true
  })
  @ApiNotFoundResponse({ 
    description: 'Exam not found' 
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error' 
  })
  async findOne(@Param() { id }: FindOneDto): Promise<ExamResponseEntity> {
    try {
      return await this.facade.findOne(id);
    } catch (error) {
      this.logger.error(`Error finding exam ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve exam');
    }
  }

  @Patch(":id")
  @ApiOperation({ summary: 'Update an exam by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The exam has been successfully updated',
    type: ExamResponseEntity
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the exam to update',
    required: true
  })
  @ApiBody({ 
    type: UpdateExamDto,
    description: 'Exam data to update'
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid input data' 
  })
  @ApiNotFoundResponse({ 
    description: 'Exam not found' 
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error' 
  })
  async update(@Param() { id }: FindOneDto, @Body() exam: UpdateExamDto): Promise<ExamResponseEntity> {
    try {
      return await this.facade.update(id, exam);
    } catch (error) {
      this.logger.error(`Error updating exam ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update exam');
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: 'Delete an exam by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The exam has been successfully deleted',
    type: ExamResponseEntity
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the exam to delete',
    required: true
  })
  @ApiNotFoundResponse({ 
    description: 'Exam not found' 
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error' 
  })
  async delete(@Param() { id }: FindOneDto): Promise<ExamResponseEntity> {
    try {
      return await this.facade.delete(id);
    } catch (error) {
      this.logger.error(`Error deleting exam ${id}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to delete exam');
    }
  }
}
