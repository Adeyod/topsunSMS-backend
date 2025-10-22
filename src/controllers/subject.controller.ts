import mongoose from 'mongoose';
import {
  fetchingAllJssSubjects,
  fetchingAllOptionalSubjects,
  fetchingAllSssCompulsorySubjects,
  fetchingAllSubjects,
  fetchingASubject,
  // storingOptionalSubjectsOfStudent,
  subjectCreation,
  fetchAllClassSubjectsByClassId,
} from '../services/subject.service';
import { AppError, JoiError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import { joiValidation } from '../utils/validation';
// import { saveLog } from '../logs/log.service';

const createASubject = catchErrors(async (req, res) => {
  // const start = Date.now();
  const {
    name,
    description,
    // sections, stream
  } = req.body;

  const payload = { name, description };

  const result = joiValidation(payload, 'create-subject');

  if (!result) {
    throw new JoiError('Error validating subject creation');
  }

  const { success, value } = result;

  const param = {
    name: value.name.toLowerCase(),
    description: value.description.toLowerCase(),
  };

  const info = await subjectCreation(param);

  if (!info) {
    throw new AppError('Error creating subject', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subject created successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'Subject created successfully',
    success: true,
    status: 200,
    subject: info,
  });
});

const getASubjectById = catchErrors(async (req, res) => {
  // const start = Date.now();
  const { subject_id } = req.params;

  const userRole = req.user?.userRole;

  const payload = {
    subject_id,
  };

  const info = await fetchingASubject(payload);

  if (!info) {
    throw new AppError('Error fetching subject', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subject fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'Subject fetched successfully',
    success: true,
    status: 200,
    subject: info,
  });
});

const getAllClassSubjectsByClassId = catchErrors(async (req, res) => {
  // const start = Date.now();
  const { class_id } = req.params;

  const payload = {
    class_id,
  };

  const result = await fetchAllClassSubjectsByClassId(payload);

  if (!result) {
    throw new AppError('Unable to fetch class subjects.', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Class subjects fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    message: 'Class subjects fetched successfully.',
    status: 200,
    success: true,
    class_subjects: result,
  });
});

const getAllSubjects = catchErrors(async (req, res) => {
  // const start = Date.now();
  const userRole = req.user?.userRole;

  const info = await fetchingAllSubjects();

  if (!info) {
    throw new AppError('Error fetching subjects', 400);
  }

  // const duration = Date.now() - start;

  // const savelogPayload = {
  //   level: 'info',
  //   message: 'Subjects fetched successfully.',
  //   service: 'klazik schools',
  //   method: req.method,
  //   route: req.originalUrl,
  //   status_code: 200,
  //   user_id: req.user?.userId,
  //   user_role: req.user?.userRole,
  //   ip: req.ip || 'unknown',
  //   duration_ms: duration,
  //   stack: undefined,
  //   school_id: req.user?.school_id
  //     ? new mongoose.Types.ObjectId(req.user.school_id)
  //     : undefined,
  // };

  // await saveLog(savelogPayload);

  return res.status(200).json({
    length: info.length,
    message: 'Subjects fetched successfully',
    success: true,
    status: 200,
    subjects: info,
  });
});

// REMOVE THESE FOUR ENDPOINTS AS WE WILL NOT BE NEEDING THEM AGAIN
const getAllJssSubjects = catchErrors(async (req, res) => {
  const info = await fetchingAllJssSubjects();

  if (!info) {
    throw new AppError('Error fetching subjects', 400);
  }

  return res.status(200).json({
    length: info.length,
    message: 'Subjects fetched successfully',
    success: true,
    status: 200,
    subjects: info,
  });
});

const getAllSssCompulsorySubjects = catchErrors(async (req, res) => {
  const info = await fetchingAllSssCompulsorySubjects();

  if (!info) {
    throw new AppError('Error fetching subjects', 400);
  }

  return res.status(200).json({
    length: info.length,
    message: 'Subjects fetched successfully',
    success: true,
    status: 200,
    subjects: info,
  });
});

const getAllOptionalSubjects = catchErrors(async (req, res) => {
  const info = await fetchingAllOptionalSubjects();

  if (!info) {
    throw new AppError('Error fetching subjects', 400);
  }

  return res.status(200).json({
    length: info.length,
    message: 'Subjects fetched successfully',
    success: true,
    status: 200,
    subjects: info,
  });
});

export {
  getAllSubjects,
  createASubject,
  getASubjectById,
  getAllJssSubjects,
  getAllSssCompulsorySubjects,
  getAllOptionalSubjects,
  // chooseOptionalSubjects,
  getAllClassSubjectsByClassId,
};
