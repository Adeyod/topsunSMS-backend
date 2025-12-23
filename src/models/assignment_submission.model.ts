import mongoose from 'mongoose';
import { AnswerSubmissionType, SubmissionDocument } from '../constants/types';

const answerSchema = new mongoose.Schema<AnswerSubmissionType>({
  question_number: { type: Number, required: true },
  text_response: { type: String },
  attachment: {
    url: { type: String },
    public_url: { type: String },
  },

  mark: { type: Number },
});

const submissionSchema = new mongoose.Schema<SubmissionDocument>(
  {
    assignment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },

    answers: [answerSchema],
    total_score: { type: Number },
    graded: { type: Boolean, default: false },
    remark: { type: String },
  },
  { timestamps: true }
);

const AssignmentSubmission = mongoose.model<SubmissionDocument>(
  'AssignmentSubmission',
  submissionSchema
);
export default AssignmentSubmission;
