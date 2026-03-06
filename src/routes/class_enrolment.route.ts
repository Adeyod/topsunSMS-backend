import express from 'express';
import {
  addSubjectToEnrolledStudents,
  getASingleEnrollmentById,
  getAllActiveClassEnrollments,
  getAllEnrollments,
  getAllSessionEnrollmentsBySessionId,
  getAllStudentsInAClass,
  getAllStudentsInAClassInActiveSession,
  manyStudentsEnrolmentToClass,
  studentEnrolmentToClass
} from '../controllers/class_enrolment.controller';
import { permission } from '../middleware/authorization';
import { verifyAccessToken } from '../middleware/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);

router.get(
  '/get-a-single-class-enrollment/:id',
  permission(['admin', 'super_admin']),
  getASingleEnrollmentById
);

router.get(
  '/get-all-students-in-a-class/:class_id/:session_id',
  permission(['admin', 'super_admin', 'teacher']),
  getAllStudentsInAClass
);

router.get(
  '/get-all-students-in-a-class-in-active-session/:class_id/:session_id',
  permission(['admin', 'super_admin', 'teacher']),
  getAllStudentsInAClassInActiveSession
);

router.get(
  '/get-all-class-enrollments',
  permission(['admin', 'super_admin']),
  getAllEnrollments
);

router.get(
  '/get-all-active-class-enrollments',
  permission(['admin', 'super_admin']),
  getAllActiveClassEnrollments
);

router.get(
  '/get-all-class-enrollments/:session_id',
  permission(['admin', 'super_admin']),
  getAllSessionEnrollmentsBySessionId
);

router.post(
  '/enrol-student-to-class',
  permission(['admin', 'super_admin']),
  studentEnrolmentToClass
);

router.post(
  '/enrol-many-students-to-class',
  permission(['admin', 'super_admin']),
  manyStudentsEnrolmentToClass
);

router.put('/add-subject-to-enrolled-students/:session_id/:enrolment_id/:subject_id',permission(['admin', 'super_admin']), addSubjectToEnrolledStudents)

export default router;
