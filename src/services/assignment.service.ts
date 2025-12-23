import mongoose from 'mongoose';
import {
  AssignmentCreationPayloadType,
  AssignmentMarkingPayloadType,
  AssignmentSubmissionType,
  FindOneAssignmentPayload,
  GetAllSubjectPayloadType,
  GetAssignmentPayloadType,
  GetAssignmentSubmissionPayloadType,
  StudentSubjectAssignmentSubmissionsType,
  SubjectAssignmentSubmissionsType,
  SubmissionDocument,
} from '../constants/types';
import Assignment from '../models/assignment.model';
import AssignmentSubmission from '../models/assignment_submission.model';
import Class from '../models/class.model';
import ClassEnrolment from '../models/classes_enrolment.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import Subject from '../models/subject.model';
import Teacher from '../models/teachers.model';
import {
  findAssignmentById,
  findAssignmentSubmissionById,
  findOneAssignmentSubmission,
} from '../repository/assignment.repository';
import { getAStudentById } from '../repository/student.repository';
import { AppError } from '../utils/app.error';

const assignmentCreation = async (payload: AssignmentCreationPayloadType) => {
  try {
    const {
      subject_id,
      class_id,
      title,
      due_date,
      session_id,
      user,
      questions_array,
    } = payload;

    const sessionExist = await Session.findById({
      _id: session_id,
    });

    console.log('sessionExist:', sessionExist);

    if (!sessionExist) {
      throw new AppError('Session not found.', 404);
    }

    if (sessionExist.is_active !== true) {
      throw new AppError('Session has ended or not active.', 400);
    }

    const activeTerm = sessionExist.terms.find((t) => t.is_active === true);
    console.log('sessionExist:', sessionExist);

    if (!activeTerm) {
      throw new AppError('There is no active term in this session.', 400);
    }
    const teacherExist = await Teacher.findById({
      _id: user,
    });
    console.log('teacherExist:', teacherExist);

    if (!teacherExist) {
      throw new AppError('Teacher not found.', 404);
    }

    // check if the teacher is the actual subject teacher for the class

    const subjectExist = await Subject.findById({ _id: subject_id });
    console.log('subjectExist:', subjectExist);

    if (!subjectExist) {
      throw new AppError('Subject not found.', 404);
    }

    const classExist = await Class.findById({ _id: class_id });
    console.log('classExist:', classExist);

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const subjectTeacher = classExist.teacher_subject_assignments.find(
      (p) =>
        p?.subject?.toString() === subject_id.toString() &&
        p?.teacher?.toString() === teacherExist._id.toString()
    );

    if (!subjectTeacher) {
      throw new AppError(
        'You are not the teacher assigned to teach this subject.',
        400
      );
    }

    const classEnrolmentExist = await ClassEnrolment.findOne({
      class: classExist._id,
      academic_session_id: sessionExist._id,
    });

    if (!classEnrolmentExist) {
      throw new AppError(
        'There is no active class enrolment for this class.',
        404
      );
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
    console.log('questions_array:', questions_array);

    if (duplicateQuestions.size > 0) {
      throw new AppError(
        `Duplicate question found for: ${Array.from(duplicateQuestions).join(
          ', '
        )}.`,
        400
      );
    }

    const newAssignment = new Assignment({
      class: classExist._id,
      teacher_id: teacherExist._id,
      subject_id: subjectExist._id,
      class_enrolment: classEnrolmentExist._id,
      session_id: sessionExist._id,
      title: title,
      term: activeTerm.name,
      questions: questions_array,
      due_date: due_date,
    });

    await newAssignment.save();

    return newAssignment;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchAssignmentById = async (payload: GetAssignmentPayloadType) => {
  try {
    const { assignment_id, userId, userRole } = payload;

    const assignmentId = Object(assignment_id);

    const assignmentExist = await Assignment.findById({
      _id: assignmentId,
    });

    if (!assignmentExist) {
      throw new AppError('Assignment not found.', 404);
    }

    if (userRole === 'teacher') {
      // Check if the teacher is the one taking the subject in the class
      const classDetails = await Class.findById({
        _id: assignmentExist.class,
      });

      if (!classDetails) {
        throw new AppError('Class does not exist for this assignment.', 404);
      }

      const subjectTeacher = classDetails.teacher_subject_assignments.find(
        (a) =>
          a.subject.toString() === assignmentExist.subject_id.toString() &&
          a.teacher.toString() === userId.toString()
      );

      if (!subjectTeacher) {
        throw new AppError(
          'You are not the teacher assigned to teach this subject.',
          400
        );
      }
    } else if (userRole === 'student') {
      // check if the student is enrolled to take the subject in the class this session
      const classEnrolmentExist = await ClassEnrolment.findById({
        _id: assignmentExist.class_enrolment,
      });

      if (!classEnrolmentExist) {
        throw new AppError(`There is no enrolment found for class.`, 404);
      }

      const offeredSubject = classEnrolmentExist.students.find(
        (a) =>
          a.student.toString() === userId.toString() &&
          a.subjects_offered.includes(assignmentExist.subject_id)
      );

      if (!offeredSubject) {
        throw new AppError(
          'You are not enrolled to study this subject in this session.',
          400
        );
      }
    }

    return assignmentExist;
  } catch (error) {
    console.log('error in main catch:', error);
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchSubjectAssignmentSubmissionById = async (
  payload: GetAssignmentSubmissionPayloadType
) => {
  try {
    const { assignment_submission_id, userId, userRole } = payload;

    const assignmentId = Object(assignment_submission_id);

    const submissionExist = await AssignmentSubmission.findById({
      _id: assignmentId,
    });

    if (!submissionExist) {
      throw new AppError('Assignment submission not found.', 404);
    }

    const assignmentExist = await Assignment.findById({
      _id: submissionExist.assignment_id,
    });

    if (!assignmentExist) {
      throw new AppError('Assignment not found.', 404);
    }

    if (userRole === 'teacher') {
      // Check if the teacher is the one taking the subject in the class
      const classDetails = await Class.findById({
        _id: assignmentExist.class,
      });

      if (!classDetails) {
        throw new AppError('Class does not exist for this assignment.', 404);
      }

      const subjectTeacher = classDetails.teacher_subject_assignments.find(
        (a) =>
          a.subject.toString() === assignmentExist.subject_id.toString() &&
          a.teacher.toString() === userId.toString()
      );

      if (!subjectTeacher) {
        throw new AppError(
          'You are not the teacher assigned to teach this subject.',
          400
        );
      }
    } else if (userRole === 'student') {
      // check if the student is enrolled to take the subject in the class this session
      const classEnrolmentExist = await ClassEnrolment.findById({
        _id: assignmentExist.class_enrolment,
      });

      if (!classEnrolmentExist) {
        throw new AppError(`There is no enrolment found for class.`, 404);
      }

      const offeredSubject = classEnrolmentExist.students.find(
        (a) =>
          a.student.toString() === userId.toString() &&
          a.subjects_offered.includes(assignmentExist.subject_id)
      );

      if (!offeredSubject) {
        throw new AppError(
          'You are not enrolled to study this subject in this session.',
          400
        );
      }
    }

    return submissionExist;
  } catch (error) {
    console.log('error in main catch:', error);
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllSubjectAssignmentsInClass = async (
  payload: GetAllSubjectPayloadType,
  page?: number,
  limit?: number,
  searchParams = ''
) => {
  try {
    const { subject_id, session_id, class_id, userRole, userId } = payload;

    const classId = Object(class_id);
    const sessionId = Object(session_id);
    const subjectId = Object(subject_id);

    const [classEnrolmentExist, classExist, subjectExist] = await Promise.all([
      ClassEnrolment.findOne({
        class: classId,
        academic_session_id: sessionId,
      }),
      Class.findById({
        _id: classId,
      }),
      Subject.findById({ _id: subjectId }),
    ]);

    if (!classEnrolmentExist) {
      throw new AppError(`There is no enrolment found for class.`, 404);
    }

    if (!classExist) {
      throw new AppError('Class does not exist for this assignment.', 404);
    }

    if (!subjectExist) {
      throw new AppError('subject not found.', 404);
    }

    if (userRole === 'teacher') {
      const subjectTeacher = classExist.teacher_subject_assignments.find(
        (a) =>
          a.subject.toString() === subjectId.toString() &&
          a.teacher.toString() === userId.toString()
      );

      if (!subjectTeacher) {
        throw new AppError(
          'You are not the teacher assigned to teach this subject.',
          400
        );
      }
    } else if (userRole === 'student') {
      const offeredSubject = classEnrolmentExist.students.find(
        (a) =>
          a.student.toString() === userId.toString() &&
          a.subjects_offered.some(
            (subId: mongoose.Types.ObjectId) =>
              subId.toString() === subjectExist._id.toString()
          )
      );

      if (!offeredSubject) {
        throw new AppError(
          'You are not enrolled to study this subject in this session.',
          400
        );
      }
    }

    const sessionExist = await Session.findById(sessionId);

    if (!sessionExist) {
      throw new AppError('session not found.', 404);
    }
    let query = Assignment.find({
      subject_id: subjectExist._id,
      class_enrolment: classEnrolmentExist._id,
      session_id: sessionExist._id,
      class: classExist._id,
    });

    if (searchParams?.trim()) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [{ term: { $regex: regex } }, { title: { $regex: regex } }],
      });
    }

    const count = await query.clone().countDocuments();
    let pages = 1;

    if (page && limit && count !== 0) {
      const offset = (page - 1) * limit;
      query = query.skip(offset).limit(limit);
      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const findAssignments = await query.sort({ createdAt: -1 });

    if (!findAssignments || findAssignments.length === 0) {
      throw new AppError('Assignment documents not found.', 404);
    }
    return {
      assignmentObj: findAssignments,
      totalCount: count,
      totalPages: pages,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    }
    throw new Error('Something went wrong.');
  }
};

const fetchSubjectAssignmentSubmissions = async (
  payload: SubjectAssignmentSubmissionsType
): Promise<{
  submissions: SubmissionDocument[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    const { userId, assignment_id, page, limit, searchParams } = payload;

    const assignmentId = Object(assignment_id);

    const teacherExist = await Teacher.findById({
      _id: userId,
    });

    if (!teacherExist) {
      throw new AppError('Teacher not found.', 404);
    }

    const assignmentExist = await Assignment.findById({
      _id: assignmentId,
    });

    if (!assignmentExist) {
      throw new AppError('Assignment not found.', 404);
    }

    let query = AssignmentSubmission.find({
      assignment_id: assignmentExist._id,
    });

    if (searchParams?.trim()) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [{ 'answers.text_response': { $regex: regex } }],
      });
    }

    const count = await query.clone().countDocuments();
    let pages = 1;

    if (page && limit && count !== 0) {
      const offset = (page - 1) * limit;
      query = query.skip(offset).limit(limit);
      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const submissions = await query
      .sort({ createdAt: -1 })
      .populate([{ path: 'student_id', select: 'first_name last_name' }]);

    if (!submissions || submissions.length === 0) {
      throw new AppError('Submissions not found.', 404);
    }

    const classExist = await Class.findById({
      _id: assignmentExist.class,
    });

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const actualSubjectTeacher = classExist.teacher_subject_assignments.find(
      (a) =>
        a.teacher.toString() === teacherExist._id.toString() &&
        a.subject.toString() === assignmentExist.subject_id.toString()
    );

    if (!actualSubjectTeacher) {
      throw new AppError(
        'This is not the teacher assigned to teach this subject in this class.',
        400
      );
    }

    return {
      submissions,
      totalCount: count,
      totalPages: pages,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const fetchAllMySubjectAssignmentSubmissionsInASession = async (
  payload: StudentSubjectAssignmentSubmissionsType
): Promise<{
  submissions: SubmissionDocument[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    const { userId, subject_id, page, limit, searchParams } = payload;

    const subjectId = Object(subject_id);

    const studentExist = await Student.findById({
      _id: userId,
    });

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const subjectExist = await Subject.findById({
      _id: subjectId,
    });

    if (!subjectExist) {
      throw new AppError('Subject not found.', 404);
    }

    let query = AssignmentSubmission.find({
      student_id: studentExist._id,
      subject_id: subjectExist._id,
    });

    if (searchParams?.trim()) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [{ 'answers.text_response': { $regex: regex } }],
      });
    }

    const count = await query.clone().countDocuments();
    let pages = 1;

    if (page && limit && count !== 0) {
      const offset = (page - 1) * limit;
      query = query.skip(offset).limit(limit);
      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const submissions = await query
      .sort({ createdAt: -1 })
      .populate([{ path: 'student_id', select: 'first_name last_name' }]);

    if (!submissions || submissions.length === 0) {
      throw new AppError('Submissions not found.', 404);
    }

    return {
      submissions,
      totalCount: count,
      totalPages: pages,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something went wrong');
    }
  }
};

const assignmentSubmission = async (payload: AssignmentSubmissionType) => {
  try {
    const { userId, assignment_id, answers_array } = payload;

    const assignmentId = new mongoose.Types.ObjectId(assignment_id);

    const assignmentExist = await findAssignmentById(assignmentId);

    if (!assignmentExist) {
      throw new AppError(
        `Assignment with ${assignment_id} does not exist.`,
        404
      );
    }

    const studentExist = await Student.findById({
      _id: userId,
    });

    if (!studentExist) {
      throw new AppError(`Student not found.`, 404);
    }

    const classEnrolmentExist = await ClassEnrolment.findById({
      _id: assignmentExist.class_enrolment,
    });

    if (!classEnrolmentExist) {
      throw new AppError('Class Enrollment not found.', 404);
    }

    const actualStudentInEnrolment = classEnrolmentExist.students.find(
      (a) =>
        a.student.toString() === studentExist._id.toString() &&
        a.subjects_offered.includes(assignmentExist.subject_id)
    );

    if (!actualStudentInEnrolment) {
      throw new AppError(
        `This student is not enrolled to take this subject in this class.`,
        400
      );
    }

    const input: FindOneAssignmentPayload = {
      student_id: studentExist._id,
      subject_id: assignmentExist.subject_id,
      assignment_id: assignmentExist._id as mongoose.Types.ObjectId,
    };

    const hasSubmitted = await findOneAssignmentSubmission(input);

    if (hasSubmitted) {
      throw new AppError('You have already submitted this assignment.', 400);
    }

    const newSubmission = new AssignmentSubmission({
      assignment_id: assignmentExist._id,
      student_id: studentExist._id,
      subject_id: assignmentExist.subject_id,
      answers: answers_array,
    });

    await newSubmission.save();
    assignmentExist.students_that_submits.push(studentExist._id);

    return newSubmission;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    }
    throw new Error('Something went wrong.');
  }
};

const assignmentMarking = async (payload: AssignmentMarkingPayloadType) => {
  try {
    const { assignment_submission_id, student_id, submission_doc, userId } =
      payload;

    const atLeastOneMarked = submission_doc.answers.some(
      (a) => a.mark !== undefined
    );

    if (atLeastOneMarked) {
      const missingMark = submission_doc.answers.find(
        (a) => a.mark === undefined
      );

      if (missingMark) {
        throw new AppError(
          `All questions must be marked. Missing mark for question ${missingMark.question_number}.`,
          400
        );
      }

      const calTotal = submission_doc.answers.reduce(
        (a, b) => a + (b.mark ?? 0),
        0
      );

      if (calTotal !== submission_doc.total_score) {
        throw new AppError(
          'Total sum does not tally with summation of the question marks.',
          400
        );
      }
    }

    const input = {
      student_id,
    };

    const studentExist = await getAStudentById(input);

    if (!studentExist) {
      throw new AppError('Student not found.', 404);
    }

    const assignmentSubmissionId = new mongoose.Types.ObjectId(
      assignment_submission_id
    );

    const assignmentSubmissionExist = await findAssignmentSubmissionById(
      assignmentSubmissionId
    );

    if (!assignmentSubmissionExist) {
      throw new AppError('Submission not found.', 404);
    }

    if (assignmentSubmissionExist.graded === true) {
      throw new AppError(
        'This submission has been marked by the teacher.',
        400
      );
    }

    const assignmentExist = await findAssignmentById(
      assignmentSubmissionExist.assignment_id
    );

    if (!assignmentExist) {
      throw new AppError('Assignment not found.', 404);
    }

    const classExist = await Class.findById(assignmentExist.class);

    if (!classExist) {
      throw new AppError('Class not found.', 404);
    }

    const subjectTeacher = classExist.teacher_subject_assignments.find(
      (a) =>
        a.subject.toString() === assignmentExist.subject_id.toString() &&
        a.teacher.toString() === userId.toString()
    );

    if (!subjectTeacher) {
      throw new AppError(
        'You are the teacher assigned to teach this subject.',
        400
      );
    }

    assignmentSubmissionExist.answers = submission_doc.answers;
    assignmentSubmissionExist.graded = true;
    assignmentSubmissionExist.total_score = submission_doc.total_score;

    assignmentSubmissionExist.markModified('answers');
    await assignmentSubmissionExist.save();

    return assignmentSubmissionExist;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    }
    throw new Error('Something went wrong.');
  }
};

export {
  assignmentCreation,
  assignmentMarking,
  assignmentSubmission,
  fetchAllMySubjectAssignmentSubmissionsInASession,
  fetchAllSubjectAssignmentsInClass,
  fetchAssignmentById,
  fetchSubjectAssignmentSubmissionById,
  fetchSubjectAssignmentSubmissions,
};
