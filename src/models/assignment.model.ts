import mongoose from 'mongoose';
import { teacherStatusEnum, genderEnum, rolesEnum } from '../constants/enum';
import { AssignmentDocument } from '../constants/types';

const assignmentSchema = new mongoose.Schema<AssignmentDocument>(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    class_enrolment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassEnrolment',
    },
    title: { type: String, required: true },
    description: { type: String },
    attachments: { type: [String] },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model<AssignmentDocument>(
  'Assignment',
  assignmentSchema
);
export default Assignment;
