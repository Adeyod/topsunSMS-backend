import {
  assignmentCreation,
  assignmentSubmission,
  fetchAllMySubjectAssignmentSubmissionsInASession,
  fetchAllSubjectAssignmentsInClass,
  fetchAssignmentById,
  fetchSubjectAssignmentSubmissions,
} from '../services/assignment.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import { joiValidateAssignmentSubmission } from '../utils/validation';

const createAssignment = catchErrors(async (req, res) => {
  const { class_id, subject_id, session_id } = req.params;
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
    session_id,
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
    session_id: Object(session_id),
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

const getAssignmentById = catchErrors(async (req, res) => {
  const { assignment_id } = req.params;

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!assignment_id) {
    throw new AppError('Assignment ID is required.', 400);
  }

  if (!userId || !userRole) {
    throw new AppError('Please login to proceed.', 400);
  }

  const payload = {
    assignment_id,
    userId,
    userRole,
  };

  const result = await fetchAssignmentById(payload);

  if (!result) {
    throw new AppError('Unable to fetch assignment.', 400);
  }

  return res.status(200).json({
    message: 'Assignment fetched successfully.',
    status: 200,
    success: true,
    assignment: result,
  });
});

const getAllSubjectAssignmentsInClass = catchErrors(async (req, res) => {
  const { class_id, session_id, subject_id } = req.params;

  const requiredFields = {
    subject_id,
    session_id,
    class_id,
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

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const userId = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!userId || !userRole) {
    throw new AppError('Please login to continue.', 400);
  }

  const payload = {
    subject_id,
    session_id,
    class_id,
    userRole,
    userId,
  };

  const result = await fetchAllSubjectAssignmentsInClass(
    payload,
    page,
    limit,
    searchQuery
  );

  if (!result) {
    throw new AppError(
      'Unable to fetch subject assignments in this class.',
      400
    );
  }

  return res.status(200).json({
    message: 'Subject assignments fetched successfully.',
    status: 200,
    success: true,
    assignments: result,
  });
});

const submitAssignment = catchErrors(async (req, res) => {
  const { assignment_id } = req.params;
  const { answers_array } = req.body;

  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Please login to proceed.', 400);
  }
  if (!assignment_id) {
    throw new AppError('Assignment ID is required.', 400);
  }

  if (!answers_array || answers_array.length === 0) {
    throw new AppError(
      'Please provide answers to the assignment questions.',
      400
    );
  }

  const validateInput = joiValidateAssignmentSubmission({ answers_array });
  console.log('validateInput:', validateInput);

  if (validateInput.error) {
    throw new AppError(validateInput.error, 400);
  }

  const { value } = validateInput;

  const payload = {
    assignment_id,
    answers_array: value.answers_array,
    userId,
  };
  const result = await assignmentSubmission(payload);

  if (!result) {
    throw new AppError('unable to submit assignment for this student.', 400);
  }

  return res.status(200).json({
    message: 'Assignment submitted successfully.',
    success: true,
    status: 200,
  });
});

const getSubjectAssignmentSubmissions = catchErrors(async (req, res) => {
  const { assignment_id } = req.params;

  const userId = req.user?.userId;

  if (!assignment_id) {
    throw new AppError('Assignment ID is required.', 400);
  }

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  if (!userId) {
    throw new AppError('Please login to continue.', 400);
  }
  const payload = {
    userId,
    assignment_id,
    page,
    limit,
    searchQuery,
  };

  const result = await fetchSubjectAssignmentSubmissions(payload);

  if (!result) {
    throw new AppError(
      'Unable to fetch assignment submission for this assignment.',
      400
    );
  }

  return res.status(200).json({
    message: 'Assignment submission fetched successfully.',
    status: 200,
    success: true,
    submissions: result,
  });
});

const getAllMySubjectAssignmentSubmissionsInASession = catchErrors(
  async (req, res) => {
    const { subject_id } = req.params;

    const userId = req.user?.userId;

    if (!subject_id) {
      throw new AppError('Subject ID is required.', 400);
    }

    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const searchQuery =
      typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

    if (!userId) {
      throw new AppError('Please login to continue.', 400);
    }
    const payload = {
      userId,
      subject_id,
      page,
      limit,
      searchQuery,
    };

    const result = await fetchAllMySubjectAssignmentSubmissionsInASession(
      payload
    );

    if (!result) {
      throw new AppError(
        'Unable to fetch assignment submission for this subject.',
        400
      );
    }

    return res.status(200).json({
      message: 'Assignment submission fetched successfully.',
      status: 200,
      success: true,
      submissions: result,
    });
  }
);

const getAllAssignments = catchErrors(async (req, res) => {});

const getAllSubjectAssignmentForStudentsThatOfferTheSubject = catchErrors(
  async (req, res) => {}
);

const markAssignment = catchErrors(async (req, res) => {});

export {
  createAssignment,
  getAllAssignments,
  getAllMySubjectAssignmentSubmissionsInASession,
  getAllSubjectAssignmentForStudentsThatOfferTheSubject,
  getAllSubjectAssignmentsInClass,
  getAssignmentById,
  getSubjectAssignmentSubmissions,
  markAssignment,
  submitAssignment,
};
