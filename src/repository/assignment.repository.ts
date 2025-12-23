import mongoose from 'mongoose';
import {
  AssignmentDocument,
  FindOneAssignmentPayload,
  SubmissionDocument,
} from '../constants/types';
import Assignment from '../models/assignment.model';
import AssignmentSubmission from '../models/assignment_submission.model';
import { AppError } from '../utils/app.error';

// refactor this function
const findOneAssignment = async (
  payload: FindOneAssignmentPayload
): Promise<AssignmentDocument | null> => {
  try {
    const assignmentExist = await Assignment.findOne({
      _id: payload.assignment_id,
      student_id: payload.student_id,
      subject_id: payload.subject_id,
    });

    console.log('assignmentExist:', assignmentExist);

    if (!assignmentExist) {
      return null;
    }

    return assignmentExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const findAssignmentById = async (
  id: mongoose.Types.ObjectId
): Promise<AssignmentDocument | null> => {
  try {
    const assignmentExist = await Assignment.findById(id);

    if (!assignmentExist) {
      return null;
    }

    return assignmentExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const findOneAssignmentSubmission = async (
  payload: FindOneAssignmentPayload
): Promise<SubmissionDocument | null> => {
  try {
    const submissionExist = await AssignmentSubmission.findOne({
      assignment_id: payload.assignment_id,
      student_id: payload.student_id,
      subject_id: payload.subject_id,
    });

    console.log('submissionExist:', submissionExist);

    if (!submissionExist) {
      return null;
    }

    return submissionExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const findAssignmentSubmissionById = async (
  id: mongoose.Types.ObjectId
): Promise<SubmissionDocument | null> => {
  try {
    const submissionExist = await AssignmentSubmission.findById(id);

    if (!submissionExist) {
      return null;
    }

    return submissionExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export {
  findAssignmentById,
  findAssignmentSubmissionById,
  findOneAssignment,
  findOneAssignmentSubmission,
};
