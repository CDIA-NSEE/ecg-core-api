import { Injectable, BadRequestException } from '@nestjs/common';
import crypto from 'node:crypto';
import { AbstractCreatorService } from '../../../shared/common/services';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { CreateExamDto } from '../dto/create-exam.dto';
import { CreateExamWithFileDto } from '../dto/create-exam-with-file.dto';
import { ExamRepository } from '../repositories';
import { ExamDocument } from '../schemas/exam.schema';
import { GridFsService } from '../../../shared/database/gridfs/gridfs.service';
import { EcgFinding } from '../enums';
import * as mongoose from 'mongoose';
import { FileMetadataDto } from '../../../shared/database/gridfs/dto';
import { WaveDuration } from '../schemas/wave-duration.schema';
import { WaveAxis } from '../schemas/wave-axis.schema';
import { EcgParameters } from '../schemas/ecg-parameters.schema';

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

      if (!file.buffer) {
        throw new BadRequestException('File buffer is required');
      }

      const md5Hash = crypto.createHash('md5').update(file.buffer).digest('hex');
      
      let waveDurations: WaveDuration[] = [];
      if (formData.waveDurations) {
        try {
          waveDurations = JSON.parse(formData.waveDurations);
        } catch (error) {
          this.logger.logError('parseWaveDurations', this.entityName, error);
        }
      }

      let waveAxes: WaveAxis[] = [];
      if (formData.waveAxes) {
        try {
          waveAxes = JSON.parse(formData.waveAxes);
        } catch (error) {
          this.logger.logError('parseWaveAxes', this.entityName, error);
        }
      }

      let categories: EcgFinding[] = [];
      if (formData.categoriesString) {
        categories = formData.categoriesString
          .split(',')
          .map(cat => cat.trim())
          .filter(cat => Object.values(EcgFinding).includes(cat as EcgFinding))
          .map(cat => cat as EcgFinding);
      }

      const ecgParameters: EcgParameters = {
        heartRate: formData.heartRate,
        durations: waveDurations,
        axes: waveAxes
      };

      const examData: CreateExamDto = {
        examDate: formData.examDate || new Date(),
        dateOfBirth: formData.dateOfBirth,
        report: formData.report,
        categories,
        version: formData.version || 1,
        ecgParameters
      };

      const uploadResult = await this.gridFsService.uploadFile(
        `exam_${Date.now()}_${md5Hash}_${file.originalname}`,
        file.buffer,
        { contentType: file.mimetype }
      );

      examData.fileMetadata = {
        originalName: file.originalname,
        fileId: uploadResult._id as unknown as mongoose.Types.ObjectId,
        contentType: file.mimetype,
        size: file.size / (1024 * 1024), // Convert to MB
        md5Hash,
        uploadDate: new Date(),
      } as FileMetadataDto;

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
