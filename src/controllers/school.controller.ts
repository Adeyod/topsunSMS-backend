import mongoose from 'mongoose';
import {
  classLevelsCreation,
  cutoffMinutesCreation,
  // principalSignAndDateAddition,
  resultSettingCreation,
} from '../services/school.service';
import { AppError } from '../utils/app.error';
import { validateGradingArray } from '../utils/functions';
import catchErrors from '../utils/tryCatch';
import {
  joiValidation,
  schoolCreationValidation,
  joiValidateClassLevelArray,
  joiValidateCutoffs,
} from '../utils/validation';

const createClassLevels = catchErrors(async (req, res) => {
  const start = Date.now();

  const { class_level_array } = req.body;

  if (!class_level_array || class_level_array.length === 0) {
    throw new AppError(
      'Please provide all the class levels for this school.',
      400
    );
  }

  const validateInput = joiValidateClassLevelArray({ class_level_array });

  const { success, value, error } = validateInput;

  if (success === false && error) {
    throw new AppError(error, 400);
  }

  const payload = {
    class_level_array: value.class_level_array,
  };

  const result = await classLevelsCreation(payload);

  if (!result) {
    throw new AppError('Unable to create class level.', 400);
  }

  return res.status(201).json({
    message: 'Class level created successfully.',
    success: true,
    status: 201,
    class_level: result,
  });
});

const createResultSetting = catchErrors(async (req, res) => {
  const { name_percent_array, grading_array, exam_components } = req.body;
  const { level } = req.params;

  if (name_percent_array.length === 0) {
    throw new AppError(
      'Please provide column names and corresponding percentages to proceed.',
      400
    );
  }

  if (!exam_components.exam_name) {
    throw new AppError('Please provide exam names to proceed.', 400);
  }

  if (exam_components.component.length === 0) {
    throw new AppError(
      'Please provide component names and corresponding percentages to proceed.',
      400
    );
  }

  if (!level) {
    throw new AppError('Level ID is required.', 400);
  }

  const validateGrading = validateGradingArray(grading_array);

  if (!validateGrading) {
    throw new AppError('Error validating grading array.', 400);
  }

  const result = await resultSettingCreation(
    name_percent_array,
    level,
    grading_array,
    exam_components
  );

  if (!result) {
    throw new AppError('Unable to create result setting.', 400);
  }

  return res.status(201).json({
    message: 'Result settings created successfully.',
    success: true,
    status: 201,
    result,
  });
});

const createCutoffMinutes = catchErrors(async (req, res) => {
  const { first_cutoff_minutes, last_cutoff_minutes } = req.body;

  const input = {
    first_cutoff_minutes,
    last_cutoff_minutes,
  };

  const validateInput = joiValidateCutoffs(input);

  if (validateInput.error) {
    throw new AppError(validateInput.error, 400);
  }

  const { success, value } = validateInput;

  const payload = {
    first_cutoff_minutes: value.first_cutoff_minutes,
    last_cutoff_minutes: value.last_cutoff_minutes,
  };

  const result = await cutoffMinutesCreation(payload);

  if (!result) {
    throw new AppError('Unable to create cutoff minute for this school.', 400);
  }

  return res.status(200).json({
    message: 'Cutoff created successfully.',
    status: 200,
    success: true,
    school_cutoff_minutes: result,
  });
});

export {
  createResultSetting,
  createCutoffMinutes,
  createClassLevels,
  // addPrincipalSignAndDate,
  // addLogo,
  // addSchoolImage,
};
