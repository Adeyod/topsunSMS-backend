// import express from 'express';
// import { verifyAccessToken } from '../middleware/jwtAuth';
// import { permission } from '../middleware/authorization';

// const router = express.Router();

// // router.get('/get-a-job', getAJob);

// export default router;

////////////////////////////////////////////
import express from 'express';

import {
  deleteAdmin,
  getAdminByAdminId,
  getAllAdmins,
  getMySchoolSummary,
} from '../controllers/admin.controller';
import { permission } from '../middleware/authorization';
import { verifyAccessToken } from '../middleware/jwtAuth';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/get-all-admins', permission(['super_admin']), getAllAdmins);

router.get(
  '/get-admin/:admin_id',
  permission(['super_admin']),
  getAdminByAdminId
);

router.delete(
  '/delete-admin/:admin_id',
  permission(['super_admin']),
  deleteAdmin
);

router.get(
  '/get-my-school-summary',
  permission(['super_admin', 'admin']),
  getMySchoolSummary
);

export default router;
