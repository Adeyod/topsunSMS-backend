import express from 'express';
import { verifyAccessToken } from '../middleware/jwtAuth';
import { permission } from '../middleware/authorization';
import { createAssignment } from '../controllers/assignment.controller';

const router = express.Router();

router.use(verifyAccessToken);

router.post(
  '/create-assignment/:class_id/:subject_id',
  permission(['teacher']),
  createAssignment
);

export default router;
