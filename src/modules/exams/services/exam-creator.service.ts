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
import dayjs from 'dayjs';

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

      // Calculate MD5 hash for file integrity verification
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
        age: formData.age,
        report: formData.report,
        categories,
        version: formData.version || 1,
        ecgParameters
      };

      // Generate a unique filename with timestamp and hash to prevent collisions
      const uniqueFilename = `exam_${Date.now()}_${md5Hash}_${file.originalname}`;
      
      // Upload the file to GridFS with exam-related metadata
      const uploadResult = await this.gridFsService.uploadFile(
        uniqueFilename,
        file.buffer,
        { 
          contentType: file.mimetype,
          examDate: examData.examDate,
          md5Hash: md5Hash,
          fileType: this.getFileType(file.mimetype),
          uploadTimestamp: new Date()
        }
      );

      // Store file metadata in the exam document
      examData.fileMetadata = {
        originalName: file.originalname,
        fileId: new mongoose.Types.ObjectId(uploadResult._id.toString()),
        contentType: file.mimetype,
        size: file.size / (1024 * 1024), // Convert to MB
        md5Hash,
        uploadDate: new Date(),
      } as FileMetadataDto;

      // Create the exam document in MongoDB
      const createdExam = await this.repository.create(examData);

      // Update the file metadata with a reference to the exam ID
      // This creates a bidirectional reference between exam and file
      await this.gridFsService.updateFileMetadata(
        uploadResult._id.toString(), 
        { 
          ...uploadResult.metadata,
          examId: createdExam._id.toString()
        }
      );

      this.logger.logOperation('fileUploaded', this.entityName, { 
        fileId: uploadResult._id.toString(),
        examId: createdExam._id.toString(),
        filename: uniqueFilename
      });

      return createdExam;
    } catch (error) {
      this.logger.logError('createWithFile', this.entityName, error);
      throw error;
    }
  }

  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType === 'application/pdf') {
      return 'pdf';
    } else if (mimeType === 'application/dicom') {
      return 'dicom';
    } else {
      return 'other';
    }
  }
}
