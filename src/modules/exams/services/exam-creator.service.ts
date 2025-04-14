import { Injectable, BadRequestException } from '@nestjs/common';
import crypto from 'node:crypto';
import { AbstractCreatorService } from '../../../shared/common/services';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { CreateExamDto } from '../dto/create-exam.dto';
import { CreateExamWithFileDto } from '../dto/create-exam-with-file.dto';
import { ExamRepository } from '../repositories';
import { ExamDocument } from '../schemas/exam.schema';
import { GridFsService } from '../../../shared/database/gridfs/gridfs.service';

@Injectable()
export class ExamCreatorService extends AbstractCreatorService<
  ExamDocument,
  CreateExamDto
> {
  constructor(
    private readonly examRepository: ExamRepository,
    private readonly gridFsService: GridFsService,
    logger: LoggerService,
  ) {
    super(examRepository, logger, 'Exam');
  }

  async createWithFile(formData: CreateExamWithFileDto): Promise<ExamDocument> {
    try {
      this.logger.logOperation('createWithFile', this.entityName, { formData });
      
      const file = formData.file;
      if (!file) {
        throw new BadRequestException('Exam file is required');
      }

      const examData: CreateExamDto = {
        examDate: formData.examDate || new Date(),
        dateOfBirth: formData.dateOfBirth,
        amplitude: formData.amplitude,
        velocity: formData.velocity,
        report: formData.report,
        categories: formData.categories,
        status: formData.status || 'pending',
      };

      if (!file.buffer) {
        throw new BadRequestException('File buffer is required');
      }

      const metadata = {
        contentType: file.mimetype,
        examId: null,
      };

      const hash = crypto.createHash('md5').update(file.buffer).digest('hex');

      const uploadResult = await this.gridFsService.uploadFile(
        `exam_${Date.now()}_${hash}_${file.originalname}`,
        file.buffer,
        metadata
      );

      examData.imageUrl = `gridfs://${uploadResult._id}`;

      const createdExam = await this.repository.create(examData);

      await this.gridFsService.findFile(uploadResult._id).then(async (file) => {
        if (file) {
          file.metadata.examId = createdExam._id;
          await file.save();
        }
      });

      return createdExam;
    } catch (error) {
      this.logger.logError('createWithFile', this.entityName, error);
      throw error;
    }
  }
}
