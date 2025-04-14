import { Model } from "mongoose";
import { AbstractRepository } from "../../../shared/common/repositories";
import { Exam, ExamDocument } from "../schemas/exam.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExamRepository extends AbstractRepository<ExamDocument> {
  constructor(
    @InjectModel(Exam.name) private readonly examModel: Model<ExamDocument>,
  ) {
    super(examModel);
  }
}
