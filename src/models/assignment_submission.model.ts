import mongoose from 'mongoose';
import { SubmissionDocument } from '../constants/types';

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
    text_response: { type: String },
    attachments: [{ type: String }],
    graded: { type: Boolean, default: false },
    score: { type: Number },
    feedback: { type: String },
  },
  { timestamps: true }
);

const AssignmentSubmission = mongoose.model<SubmissionDocument>(
  'AssignmentSubmission',
  submissionSchema
);
export default AssignmentSubmission;
