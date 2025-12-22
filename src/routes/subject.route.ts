import express from 'express';
import {
  createASubject,
  // chooseOptionalSubjects,
  getAllClassSubjectsByClassId,
  getAllJssSubjects,
  getAllOptionalSubjects,
  getAllSssCompulsorySubjects,
  getAllSubjects,
  getAllSubjectsThatStudentOffersInATerm,
  getASubjectById,
} from '../controllers/subject.controller';
import { permission } from '../middleware/authorization';
import { verifyAccessToken } from '../middleware/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.post(
  '/create-a-subject',
  permission(['admin', 'super_admin']),
  createASubject
);
router.get(
  '/get-all-jss-subjects',
  permission(['admin', 'super_admin']),
  getAllJssSubjects
);

router.get(
  '/get-all-class-subjects/:class_id',
  permission(['admin', 'super_admin']),
  getAllClassSubjectsByClassId
);

router.get(
  '/get-all-compulsory-subjects',
  permission(['admin', 'super_admin']),
  getAllSssCompulsorySubjects
);

router.get(
  '/get-all-optional-subjects',
  permission(['admin', 'super_admin']),
  getAllOptionalSubjects
);

router.get(
  '/get-all-subjects',
  permission(['admin', 'super_admin']),
  getAllSubjects
);

router.get(
  '/get-a-subject/:subject_id',
  permission(['admin', 'super_admin']),
  getASubjectById
);

router.get(
  '/get-all-subjects-that-student-offer-in-a-session/:session_id/:class_id',
  permission(['student']),
  getAllSubjectsThatStudentOffersInATerm
);

// router.post(
//   '/choose-optional-subject/:student_id/:class_id',
//   permission(['parent', 'student']),
//   chooseOptionalSubjects
// );

export default router;
