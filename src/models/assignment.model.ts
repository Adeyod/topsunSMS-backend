import mongoose from 'mongoose';
import { AssignmentDocument } from '../constants/types';

const questionSchema = new mongoose.Schema({
  question_number: { type: Number, required: true },
  question_text: { type: String, required: true },
  // attachments: [
  //   {
  //     url: { type: String },
  //     public_url: { type: String },
  //   },
  // ], // image URLs, PDFs, etc.
});

const assignmentSchema = new mongoose.Schema<AssignmentDocument>(
  {
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    subject_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    class_enrolment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassEnrolment',
    },
    title: { type: String, required: true },
    term: { type: String, required: true },
    questions: [questionSchema],
    due_date: { type: Date, required: true },
    submission_type: {
      type: String,
      enum: ['file', 'text', 'mixed'],
      default: 'file',
    },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
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
