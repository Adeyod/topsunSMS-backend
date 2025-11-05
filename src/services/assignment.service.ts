import { AssignmentCreationPayloadType } from '../constants/types';
import Class from '../models/class.model';
import Subject from '../models/subject.model';
import Teacher from '../models/teachers.model';
import { AppError } from '../utils/app.error';

const assignmentCreation = async (payload: AssignmentCreationPayloadType) => {
  try {
    const { subject_id, class_id, title, due_date, user, questions_array } =
      payload;

    const teacherExist = await Teacher.findById({
      _id: user,
    });

    if (!teacherExist) {
      throw new AppError('Teacher not found.', 404);
    }

    // check if the teacher is the actual subject teacher for the class

    const subjectExist = await Subject.findById({ _id: subject_id });

    if (!subjectExist) {
      throw new AppError('Subject not found.', 404);
    }

    const classExist = await Class.findById({ _id: class_id });

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const duplicateQuestions = new Set();
    const uniqueQuestions = new Set();

    questions_array.forEach((q) => {
      const key = q.question_text.trim().toLowerCase();

      if (uniqueQuestions.has(key)) {
        duplicateQuestions.add(key);
      } else {
        uniqueQuestions.add(key);
      }
    });

    if (duplicateQuestions.size > 0) {
      throw new AppError(
        `Duplicate question found for: ${Array.from(duplicateQuestions).join(
          ', '
        )}.`,
        400
      );
    }

    return user;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

export { assignmentCreation };
