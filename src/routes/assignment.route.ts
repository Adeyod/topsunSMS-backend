import express from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAllSubjectAssignmentForStudentsThatOfferTheSubject,
  getAllSubjectAssignmentsInClass,
  getAssignmentById,
  markAssignment,
  submitAssignment,
} from '../controllers/assignment.controller';
import { permission } from '../middleware/authorization';
import { verifyAccessToken } from '../middleware/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);

router.post(
  '/create-assignment/:session_id/:class_id/:subject_id',
  permission(['teacher']),
  createAssignment
);

router.post(
  '/assignment-submission/:assignment_id',
  permission(['student']),
  submitAssignment
);
router.get(
  '/get-assignment-by-id/:assignment_id',
  permission(['super_admin', 'admin', 'student', 'teacher']),
  getAssignmentById
);
router.get(
  '/mark-assignment/:assignment_id/:student_id',
  permission(['teacher']),
  markAssignment
);
router.get(
  '/get-all-assignments',
  permission(['super_admin', 'admin']),
  getAllAssignments
);

router.get(
  '/get-all-subject-assignments-in-class/:class_id/:session_id/:subject_id',
  permission(['teacher', 'student']),
  getAllSubjectAssignmentsInClass
);

router.get(
  '/get-all-subject-assignments-for-student-offering-subject/:subject_id',
  permission(['teacher']),
  getAllSubjectAssignmentForStudentsThatOfferTheSubject
);

export default router;
