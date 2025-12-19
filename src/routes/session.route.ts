import express from 'express';

import {
  addingTermVacationAndNewTermResumptionDates,
  createNewSession,
  createNewTerm,
  deleteSessionById,
  deleteTermById,
  endASessionBySessionId,
  endATermInASessionByTermId,
  getASessionBySessionId,
  getActiveSession,
  getAllSessions,
} from '../controllers/session.controller';
import { permission } from '../middleware/authorization';
import { developerProtected } from '../middleware/developerProtected';
import { verifyAccessToken } from '../middleware/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/get-active-session', getActiveSession);

router.get(
  '/get-sessions',
  permission(['admin', 'super_admin', 'parent', 'student', 'teacher']),
  getAllSessions
);

router.get(
  '/get-session/:session_id',
  permission(['admin', 'super_admin']),
  getASessionBySessionId
);

router.put(
  '/end-session/:session_id',
  permission(['admin', 'super_admin']),
  developerProtected,
  endASessionBySessionId
);

router.put(
  '/end-term/:session_id/:term_id',
  permission(['admin', 'super_admin']),
  developerProtected,
  endATermInASessionByTermId
);

router.post(
  '/create-session',
  permission(['admin', 'super_admin']),
  createNewSession
);

router.post(
  '/:session_id/create-term',
  permission(['admin', 'super_admin']),
  createNewTerm
);

router.delete(
  '/delete-session/:session_id',
  permission(['admin', 'super_admin']),
  deleteSessionById
);

router.delete(
  '/:session_id/delete-term/:term_id',
  permission(['admin', 'super_admin']),
  deleteTermById
);

router.put(
  '/add-vacation-and-new-term-resumption-dates/:session_id/:term_id',
  permission(['admin', 'super_admin']),
  addingTermVacationAndNewTermResumptionDates
);

export default router;
