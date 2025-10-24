import mongoose from 'mongoose';
import { triggerTypeEnum } from '../constants/enum';
import {
  subjectCbtObjCbtAssessmentRemainingTimeUpdate,
  fetchTermClassCbtAssessmentTimetable,
  subjectCbtObjCbtAssessmentSubmission,
  subjectCbtObjCbtAssessmentUpdate,
  studentCbtSubjectCbtAssessmentAuthorization,
  termClassCbtAssessmentTimetableCreation,
  subjectCbtObjCbtAssessmentStarting,
  termCbtAssessmentDocumentCreation,
  objQestionSetting,
  theoryQestionSetting,
  fetchTermCbtAssessmentDocument,
  fetchCbtAssessmentDocumentById,
  fetchAllClassCbtAssessmentTimetables,
  fetchAllCbtAssessmentDocument,
  endSubjectInATimetable,
  termCbtAssessmentDocumentEnding,
  allActiveTermCbtAssessmentDocumentsInATermEnding,
  termClassCbtAssessmentTimetableToChangeSubjectDateUpdating,
} from '../services/cbt.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';
import {
  joiValidateQuestionArray,
  joiValidateExamInputFields,
  joiValidateTimetableArray,
  joiValidateAssessmentDocumentArray,
  joiValidateNewDateTimetable,
} from '../utils/validation';
import { studentResultQueue } from '../utils/queue';
import { QueueEvents } from 'bullmq';
// import { saveLog } from '../logs/log.service';

const getCbtAssessmentDocumentById = catchErrors(async (req, res) => {
  const { exam_document_id } = req.params;
  const result = await fetchCbtAssessmentDocumentById(exam_document_id);

  if (!result) {
    throw new AppError('Unable to fetch exam document.', 400);
  }

  return res.status(200).json({
    message: 'Cbt assessment document fetched successfully.',
    status: 200,
    success: true,
    exam_document: result,
  });
});

const endTermCbtAssessmentDocument = catchErrors(async (req, res) => {
  const { exam_document_id } = req.params;

  const examId = Object(exam_document_id);
  const result = await termCbtAssessmentDocumentEnding(examId);

  if (!result) {
    throw new AppError('Unable to end exam document.', 400);
  }

  return res.status(200).json({
    message: 'Term Cbt assessment ended successfully.',
    status: 200,
    success: true,
  });
});

const endAllActiveTermCbtAssessmentDocumentsInATerm = catchErrors(
  async (req, res) => {
    const { term, academic_session_id } = req.body;

    const session = Object(academic_session_id);

    const payload = {
      session,
      term,
    };
    const result = await allActiveTermCbtAssessmentDocumentsInATermEnding(
      session,
      term
    );

    if (!result) {
      throw new AppError('Unable to end term exam documents.', 400);
    }

    return res.status(200).json({
      message: 'All Term Cbt assessments ended successfully.',
      status: 200,
      success: true,
    });
  }
);

const getAllCbtAssessmentDocument = catchErrors(async (req, res) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const result = await fetchAllCbtAssessmentDocument(page, limit, searchQuery);

  if (!result) {
    throw new AppError('Unable to fetch Cbt assessment documents.', 400);
  }

  return res.status(201).json({
    message: 'Cbt assessment document fetched successfully.',
    status: 201,
    success: true,
    exam_documents: result,
  });
});

const createTermCbtAssessmentDocument = catchErrors(async (req, res) => {
  const { academic_session_id, term } = req.params;
  const { assessment_document_array } = req.body;

  if (!academic_session_id) {
    throw new AppError('Academic session is required to proceed.', 400);
  }

  if (!term) {
    throw new AppError('Academic session is required to proceed.', 400);
  }

  const validateInput = joiValidateAssessmentDocumentArray(
    assessment_document_array
  );

  if (validateInput.error) {
    throw new AppError(validateInput.error, 400);
  }

  const validAssessmentDocument = validateInput.value;

  const input = {
    academic_session_id,
    term,
    assessmentDocumentArray: validAssessmentDocument,
  };

  const result = await termCbtAssessmentDocumentCreation(input);

  if (!result) {
    throw new AppError(
      'Unable to create cbt assessment documents for the term.',
      400
    );
  }

  return res.status(201).json({
    message: 'Cbt assessment documents created successfully.',
    status: 201,
    success: true,
    exam_document: result,
  });
});

// const createTermCbtAssessmentDocument = catchErrors(async (req, res) => {
//   const { academic_session_id, term } = req.params;
//   const {
//     assessment_type,
//     number_of_questions_per_student,
//     min_obj_questions,
//     max_obj_questions,
//     expected_obj_number_of_options,
//     level
//   } = req.body;

//   if (!academic_session_id) {
//     throw new AppError('Academic session is required to proceed.', 400);
//   }

//   if (!assessment_type) {
//     throw new AppError('Assessment type is required to proceed.', 400);
//   }

//   if (!term) {
//     throw new AppError('Academic session is required to proceed.', 400);
//   }

//   const input = {
//     min_obj_questions,
//     max_obj_questions,
//     expected_obj_number_of_options,
//     assessment_type,
//     number_of_questions_per_student,
//   };

//   const validateTitle = joiValidateExamInputFields(input);

//   if (validateTitle.error) {
//     throw new AppError(validateTitle.error, 400);
//   }

//   const { success, value } = validateTitle;

//   const payload = {
//     academic_session_id,
//     term,
//     assessment_type: value.assessment_type,
//     min_obj_questions: value.min_obj_questions,
//     max_obj_questions: value.max_obj_questions,
//     expected_obj_number_of_options: value.expected_obj_number_of_options,
//     number_of_questions_per_student: value.number_of_questions_per_student,
//   };

//   const result = await termCbtAssessmentDocumentCreation(payload);

//   if (!result) {
//     throw new AppError(
//       'Unable to create cbt assessment document for the term.',
//       400
//     );
//   }

//   return res.status(201).json({
//     message: 'Cbt assessment document created successfully.',
//     status: 201,
//     success: true,
//     exam_document: result,
//   });
// });

const getTermCbtAssessmentDocument = catchErrors(async (req, res) => {
  // const start = Date.now();

  const { academic_session_id, term } = req.params;

  if (!academic_session_id) {
    throw new AppError('Academic session is required to proceed.', 400);
  }

  if (!term) {
    throw new AppError('Term is required to proceed.', 400);
  }

  const payload = {
    academic_session_id,
    term,
  };

  const result = await fetchTermCbtAssessmentDocument(payload);

  if (!result) {
    throw new AppError(
      'Unable to get CBT assessment document for the term.',
      400
    );
  }

  return res.status(201).json({
    message: `CBT assessment document fetched successfully..`,
    status: 201,
    success: true,
    exam_document: result,
  });
});

const getTermClassCbtAssessmentTimetables = catchErrors(async (req, res) => {
  const { academic_session_id, class_id, term } = req.params;

  const requiredFields = {
    academic_session_id,
    class_id,
    term,
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
    academic_session_id,
    class_id,
    term,
  };

  const result = await fetchTermClassCbtAssessmentTimetable(payload);

  if (!result) {
    throw new AppError(
      'Unable to get Cbt assessment timetable for this class.',
      400
    );
  }

  return res.status(200).json({
    message: `Cbt assessment timetable fetched successfully.`,
    status: 200,
    success: true,
    timetable: result,
  });
});

const getAllClassCbtAssessmentTimetables = catchErrors(async (req, res) => {
  const { class_id } = req.params;

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const searchQuery =
    typeof req.query.searchParams === 'string' ? req.query.searchParams : '';

  const requiredFields = {
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

  const result = await fetchAllClassCbtAssessmentTimetables(
    class_id,
    page,
    limit,
    searchQuery
  );

  if (!result) {
    throw new AppError(
      'Unable to get Cbt assessment timetable for this class.',
      400
    );
  }

  return res.status(200).json({
    message: `Cbt assessment timetable fetched successfully.`,
    status: 200,
    success: true,
    timetable: result,
  });
});

const createTermClassCbtAssessmentTimetable = catchErrors(async (req, res) => {
  const start = Date.now();

  const { academic_session_id, class_id } = req.params;
  const { term, timetable_array, level, assessment_type } = req.body;

  const user_id = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!user_id || !userRole) {
    throw new AppError('Please login to continue.', 400);
  }

  const requiredFields = {
    academic_session_id,
    class_id,
    term,
    level,
    assessment_type,
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

  const validateTimetableArray = joiValidateTimetableArray(timetable_array);

  if (validateTimetableArray.error) {
    throw new AppError(validateTimetableArray.error, 400);
  }

  const payload = {
    academic_session_id,
    class_id,
    term,
    timetable: validateTimetableArray.value,
    user_id,
    userRole,
    level,
    assessment_type,
  };

  const result = await termClassCbtAssessmentTimetableCreation(payload);

  if (!result) {
    throw new AppError('Unable to create Cbt assessment timetable.', 400);
  }

  return res.status(201).json({
    message: `Cbt assessment timetable created successfully.`,
    status: 201,
    success: true,
    timetable: result,
  });
});

const updateTermClassCbtAssessmentTimetableToChangeSubjectDate = catchErrors(
  async (req, res) => {
    const start = Date.now();

    const { timetable_id, subject_id } = req.params;
    const { selected_time } = req.body;

    const user_id = req.user?.userId;
    const userRole = req.user?.userRole;

    if (!user_id || !userRole) {
      throw new AppError('Please login to continue.', 400);
    }

    const requiredFields = {
      timetable_id,
      subject_id,
      selected_time,
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

    const validateTimetableArray = joiValidateNewDateTimetable(selected_time);

    if (validateTimetableArray.error) {
      throw new AppError(validateTimetableArray.error, 400);
    }

    const payload = {
      timetable_id: Object(timetable_id),
      subject_id: Object(subject_id),
      selected_time: validateTimetableArray.value,
    };

    const result =
      await termClassCbtAssessmentTimetableToChangeSubjectDateUpdating(payload);

    if (!result) {
      throw new AppError('Unable to update Subject assessment time.', 400);
    }

    return res.status(200).json({
      message: `Subject time updated successfully.`,
      status: 200,
      success: true,
      timetable: result,
    });
  }
);

const endTakingASubjectInATimetableForATerm = catchErrors(async (req, res) => {
  const start = Date.now();

  const { timetable_id, subject_id } = req.params;

  const user_id = req.user?.userId;
  const userRole = req.user?.userRole;

  if (!user_id || !userRole) {
    throw new AppError('Please login to continue.', 400);
  }

  const requiredFields = {
    timetable_id,
    subject_id,
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
    timetable_id: Object(timetable_id),
    subject_id: Object(subject_id),
  };

  const result = await endSubjectInATimetable(payload);

  if (!result) {
    throw new AppError('Unable to end Subject timetable.', 400);
  }

  return res.status(200).json({
    message: `Subject time ended successfully.`,
    status: 200,
    success: true,
  });
});

const setSubjectCbtObjQuestionsForAClass = catchErrors(async (req, res) => {
  const { academic_session_id, class_id } = req.params;
  const { questions_array, term, subject_id, assessment_type } = req.body;

  if (!Array.isArray(questions_array) || questions_array.length === 0) {
    throw new AppError('Questions are required.', 400);
  }

  const teacher_id = req.user?.userId;

  if (!teacher_id) {
    throw new AppError('Please login to continue.', 400);
  }

  const requiredFields = {
    academic_session_id,
    class_id,
    questions_array,
    term,
    subject_id,
    assessment_type,
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

  const validateQuestionsArray = joiValidateQuestionArray(questions_array);

  if (validateQuestionsArray.error) {
    throw new AppError(validateQuestionsArray.error, 400);
  }

  const validQuestions = validateQuestionsArray.value;

  const payload = {
    academic_session_id,
    class_id,
    questions_array: validQuestions,
    term,
    subject_id,
    teacher_id,
    assessment_type,
  };

  const result = await objQestionSetting(payload);

  if (!result) {
    throw new AppError(
      'Unable to store Cbt assessment questions for this subject.',
      400
    );
  }

  return res.status(201).json({
    message: `Cbt assessment questions submitted for ${result.subject_name}`,
    status: 201,
    success: true,
  });
});

const classTeacherAuthorizeStudentsToWriteSubjectCbt = catchErrors(
  async (req, res) => {
    const { subject_id, academic_session_id, class_id } = req.params;
    const { students_id_array, term } = req.body;

    if (!Array.isArray(students_id_array) || students_id_array.length === 0) {
      throw new AppError(
        'Please provide the students that are to be allowed to take the CBT for this subject.',
        400
      );
    }

    const teacher_id = req.user?.userId;

    if (!teacher_id) {
      throw new AppError('Please login to continue.', 400);
    }

    const requiredFields = {
      subject_id,
      term,
      academic_session_id,
      class_id,
      students_id_array,
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
      subject_id,
      term,
      academic_session_id,
      class_id,
      teacher_id,
      students_id_array,
    };

    const result = await studentCbtSubjectCbtAssessmentAuthorization(payload);

    if (!result) {
      throw new AppError(
        'Unable to authorize students to take this CBT subject.',
        400
      );
    }

    return res.status(201).json({
      message: `Students CBT subject attendance marked successfully`,
      status: 201,
      success: true,
      authorized_students_ids: result,
    });
  }
);

const startSubjectCbtObjCbtAssessmentForAClass = catchErrors(
  async (req, res) => {
    const { term, subject_id, academic_session_id, class_id } = req.params;

    const student_id = req.user?.userId;

    if (!student_id) {
      throw new AppError('Please login to continue.', 400);
    }

    const requiredFields = {
      academic_session_id,
      class_id,
      term,
      subject_id,
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
      academic_session_id,
      class_id,
      student_id,
      term,
      subject_id,
    };

    const result = await subjectCbtObjCbtAssessmentStarting(payload);

    if (!result) {
      throw new AppError('Unable to Cbt assessment questions.', 400);
    }

    return res.status(200).json({
      message: `Cbt assessment started successfully.`,
      status: 200,
      success: true,
      questions: result,
    });
  }
);

const updateSubjectCbtObjCbtAssessmentRemainingTimeForAClass = catchErrors(
  async (req, res) => {
    const { cbt_result_id, exam_id } = req.params;
    const { remaining_time } = req.body;

    const student_id = req.user?.userId;

    if (!student_id) {
      throw new AppError('Please login to continue.', 400);
    }

    const requiredFields = {
      cbt_result_id,
      exam_id,
      remaining_time,
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
      cbt_result_id,
      exam_id,
      remaining_time,
      student_id,
    };

    const result = await subjectCbtObjCbtAssessmentRemainingTimeUpdate(payload);

    // if (!result) {
    //   throw new AppError('Unable to update exam remaining time.', 400);
    // }

    return res.status(200).json({
      message: `Cbt assessment time updated successfully.`,
      status: 200,
      success: true,
      // questions: result && result,
    });
  }
);

const updateSubjectCbtObjCbtAssessmentAnswersForAClass = catchErrors(
  async (req, res) => {
    const { cbt_result_id, exam_id } = req.params;
    const { result_doc } = req.body;

    const student_id = req.user?.userId;

    if (!student_id) {
      throw new AppError('Please login to continue.', 400);
    }

    if (result_doc.length === 0) {
      throw new AppError('No answer selected.', 400);
    }

    const requiredFields = {
      cbt_result_id,
      exam_id,
      result_doc,
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
      cbt_result_id,
      exam_id,
      result_doc,
      student_id,
    };

    const result = await subjectCbtObjCbtAssessmentUpdate(payload);

    // if (!result) {
    //   throw new AppError('Unable to update exam.', 400);
    // }

    return res.status(200).json({
      message: `Cbt assessment answers updated successfully.`,
      status: 200,
      success: true,
      questions: result && result,
    });
  }
);

const submitSubjectCbtObjCbtAssessmentForAClass = catchErrors(
  async (req, res) => {
    const { cbt_result_id, exam_id } = req.params;
    const { result_doc, trigger_type } = req.body;

    const student_id = req.user?.userId;

    if (!student_id) {
      throw new AppError('Please login to continue.', 400);
    }

    if (!triggerTypeEnum.includes(trigger_type)) {
      throw new AppError('Invalid trigger type.', 400);
    }

    const requiredFields = {
      cbt_result_id,
      exam_id,
      result_doc,
      trigger_type,
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
      cbt_result_id,
      exam_id,
      result_doc,
      student_id,
      trigger_type,
    };

    const name = 'cbt-assessment-submission';
    const data = payload;
    const opts = {
      attempts: 5,
      removeOnComplete: true,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    };

    const result = await subjectCbtObjCbtAssessmentSubmission(data);

    if (!result) {
      throw new AppError('Unable to end and update Cbt assessment.', 400);
    }

    return res.status(200).json({
      message: 'CBT assessment submitted successfully.',
      status: 200,
      success: true,
      questions: result,
    });

    //   const job = await studentResultQueue.add(name, data, opts);

    // if (!job) {
    //   throw new AppError('Unable to end and update Cbt assessment.', 400);
    // }

    // const queueEvents = new QueueEvents('studentResultQueue');
    // try {
    //   // Wait until worker finishes
    //   const processedResult = await job.waitUntilFinished(queueEvents);

    //   return res.status(200).json({
    //     message: 'CBT assessment submitted successfully.',
    //     status: 200,
    //     success: true,
    //     questions: processedResult, // <-- what your Worker returned
    //   });
    // } catch (err) {
    //   throw new AppError('Error processing CBT assessment.', 400);
    // }
  }
);

const setSubjectCbtTheroyQuestionsForAClass = catchErrors(async (req, res) => {
  const { academic_session_id, class_id } = req.params;
  const { questions_array, term, subject_id } = req.body;

  const teacher_id = req.user?.userId;

  if (!teacher_id) {
    throw new AppError('Please login to continue.', 400);
  }

  const requiredFields = {
    academic_session_id,
    class_id,
    questions_array,
    term,
    subject_id,
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
});

export {
  endTakingASubjectInATimetableForATerm,
  getCbtAssessmentDocumentById,
  updateTermClassCbtAssessmentTimetableToChangeSubjectDate,
  getAllClassCbtAssessmentTimetables,
  getTermClassCbtAssessmentTimetables,
  getTermCbtAssessmentDocument,
  submitSubjectCbtObjCbtAssessmentForAClass,
  updateSubjectCbtObjCbtAssessmentAnswersForAClass,
  updateSubjectCbtObjCbtAssessmentRemainingTimeForAClass,
  classTeacherAuthorizeStudentsToWriteSubjectCbt,
  createTermClassCbtAssessmentTimetable,
  startSubjectCbtObjCbtAssessmentForAClass,
  setSubjectCbtObjQuestionsForAClass,
  createTermCbtAssessmentDocument,
  setSubjectCbtTheroyQuestionsForAClass,
  getAllCbtAssessmentDocument,
  endAllActiveTermCbtAssessmentDocumentsInATerm,
  endTermCbtAssessmentDocument,
};
