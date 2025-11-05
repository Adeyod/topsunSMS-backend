import { assignmentCreation } from '../services/assignment.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const createAssignment = catchErrors(async (req, res) => {
  const { class_id, subject_id } = req.params;
  const { questions_array, title, due_date } = req.body;

  const user = req.user?.userId;

  if (!user) {
    throw new AppError('Please login to proceed.', 400);
  }

  if (questions_array.length === 0) {
    throw new AppError('Questions can not be empty.', 400);
  }

  const requiredFields = {
    subject_id,
    class_id,
    title,
    due_date,
  };

  const missingField = Object.entries(requiredFields).find(
    ([key, value]) => !value
  );

  if (missingField) {
    throw new AppError(
      `Please provide ${missingField[0].replace('_', ' ')} to proceed.`,
      400
    );
  }

  const payload = {
    subject_id: Object(subject_id),
    class_id: Object(class_id),
    title,
    due_date,
    user,
    questions_array,
  };

  const result = await assignmentCreation(payload);

  if (!result) {
    throw new AppError('Unable to create assignment.', 400);
  }

  return res.status(201).json({
    message: 'Assignment created successfully.',
    success: true,
    status: 201,
    assignment: result,
  });
});

export { createAssignment };
