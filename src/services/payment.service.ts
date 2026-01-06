import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { paymentEnum, paymentStatusEnum } from '../constants/enum';
import {
  AddFeeToStudentPaymentDocType,
  AddingFeeToPaymentPayload,
  ApproveStudentPayloadType,
  DeclineStudentPayloadType,
  PaymentDataType,
  PaymentDocument,
  PaymentHistoryDataType,
  PaymentHistoryDataTypeFlat,
  StudentFeePaymentType,
  StudentFeePaymentTypeWithBursarRole,
  StudentPaymentHistoryType,
  UserDocument,
  WaitingForConfirmationType,
} from '../constants/types';
import Fee from '../models/fees.model';
import Payment from '../models/payment.model';
import Session from '../models/session.model';
import Student from '../models/students.model';
import {
  addFeeToStudentPaymentDoc,
  calculateAndUpdateStudentPaymentDocuments,
} from '../repository/payment.repository';
import { AppError } from '../utils/app.error';
import { cloudinaryDestroy, handleFileUpload } from '../utils/cloudinary';

const createSchoolFeePaymentDocumentForStudents = async (
  session_id: string,
  term: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const activeSession = await Session.findOne({
      _id: session_id,
      is_active: true,
    }).session(session);

    if (!activeSession) {
      throw new AppError(
        'Payment can only be created in an active session. Please create a new session and term before proceeding.',
        400
      );
    }

    const activeTermCheck = activeSession.terms.find((t) => t.name === term);

    if (activeTermCheck?.is_active !== true) {
      throw new AppError(
        'Payment can  only be created in an active term.',
        400
      );
    }

    const allStudents = await Student.find().session(session);

    if (!allStudents) {
      throw new AppError('No students found yet.', 404);
    }

    const allSchoolFees = await Fee.find().session(session);

    if (!allSchoolFees || allSchoolFees.length === 0) {
      throw new AppError('No school fees found yet.', 404);
    }

    const unenrolledStudents = allStudents.filter(
      (student) =>
        // !student.current_class?.class_id ||
        student.active_class_enrolment === false
    );

    const enrolledStudents = allStudents.filter(
      (student) =>
        student.current_class?.class_id &&
        student.active_class_enrolment === true
    );

    const studentsWithPaymentDocument: UserDocument[] = [];
    const studentsWithoutPaymentDocument: UserDocument[] = [];

    await Promise.all(
      enrolledStudents.map(async (s) => {
        const hasPayment = await Payment.findOne({
          session: session_id,
          term: term,
          student: s._id,
        });

        if (hasPayment) {
          studentsWithPaymentDocument.push(s);
        } else {
          studentsWithoutPaymentDocument.push(s);
        }
      })
    );

    if (
      !studentsWithoutPaymentDocument ||
      studentsWithoutPaymentDocument.length <= 0
    ) {
      throw new AppError(
        `All enrolled students already have payment document for ${term.replace(
          '_',
          ' '
        )} of ${activeSession.academic_session} session`,
        400
      );
    }

    const bulkOperations = [];

    for (const student of studentsWithoutPaymentDocument) {
      if (!student.current_class_level) {
        console.warn(
          `Student with ID ${student._id} and name: ${student.first_name} ${student.last_name} has no current class level field: ${student.current_class_level}`
        );
        continue;
      }

      const feeForClassLevel = allSchoolFees.find(
        (fee) =>
          fee.level.toString() === student.current_class_level?.toString() &&
          fee.term === activeTermCheck.name
      );

      if (!feeForClassLevel) {
        console.warn(
          `No school fee found for class level: ${student.current_class_level}`
        );
        continue;
      }

      let fees_breakdown: {
        fee_name: string;
        amount: number;
      }[] = [];
      // let fees_breakdown: { fee_name: string; amount: number }[] = [
      //   {
      //     fee_name: 'School_fees',
      //     amount: feeForClassLevel.school_fees,
      //   },
      // ];

      if (Array.isArray(feeForClassLevel.mandatory_fees)) {
        feeForClassLevel.mandatory_fees.forEach((fee) => {
          fees_breakdown.push({
            fee_name: fee.fee_name,
            amount: fee.amount,
          });
        });
      }

      if (Array.isArray(feeForClassLevel.optional_fees)) {
        feeForClassLevel.optional_fees.forEach((fee) => {
          if (
            Array.isArray(fee.applicable_classes) &&
            fee.applicable_classes.some(
              (classId) =>
                classId.toString() ===
                student.current_class?.class_id.toString()
            )
          ) {
            fees_breakdown.push({
              fee_name: fee.fee_name,
              amount: fee.amount,
            });
          }
        });
      }

      const total_amount = fees_breakdown.reduce(
        (sum, fee) => sum + fee.amount,
        0
      );

      bulkOperations.push({
        insertOne: {
          document: {
            student: student._id,
            class: student.current_class?.class_id,
            class_level: student.current_class_level,
            session: session_id,
            term: term,
            fees_breakdown,
            total_amount: total_amount,
            remaining_amount: total_amount,
          },
        },
      });
    }

    if (bulkOperations.length === 0) {
      throw new AppError(
        'No payment documents created. Ensure all students have corresponding fee.',
        404
      );
    }

    const paymentDocuments = await Payment.bulkWrite(bulkOperations, {
      session,
    });

    let msg = '';

    if (unenrolledStudents.length > 0) {
      msg = `${
        unenrolledStudents.length
      } students are yet to be enrolled into classes for the ${term.replace(
        '_',
        ' '
      )} of ${activeSession.academic_session} session.`;
    }

    await session.commitTransaction();
    session.endSession();

    return {
      message: `${paymentDocuments.insertedCount} payment documents created successfully. ${msg}`,
      paymentDocuments,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

// for adding fee to individual student by clicking on edit student
const addingFeeToStudentPaymentDocument = async (
  payload: AddingFeeToPaymentPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fee_name, amount, student_id } = payload;

    const studentId = Object(student_id);

    const schoolSession = await Session.findOne({
      is_active: true,
    }).session(session);

    if (!schoolSession) {
      throw new AppError('There is no active session.', 400);
    }

    const activeTerm = schoolSession.terms.find(
      (term) => term.is_active === true
    );

    if (!activeTerm) {
      throw new AppError(
        'There is no active term where the payment document can be updated.',
        400
      );
    }

    const payload2: AddFeeToStudentPaymentDocType = {
      session_id: schoolSession?._id,
      termName: activeTerm?.name,
      studentId: studentId,
      session: session,
      fee_name: fee_name,
      amount: amount,
    };

    const addPayment = await addFeeToStudentPaymentDoc(payload2);

    await session.commitTransaction();
    session.endSession();
    return addPayment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error(`Something happened: ${error}`);
    }
  }
};

const fetchAllStudentPaymentDocumentsByStudentId = async (
  payload: StudentPaymentHistoryType,
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  resultArray: PaymentDocument[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    const { student_id, userRole, userId } = payload;

    if (userRole === 'parent') {
      const studentDoc = await Student.findOne({
        _id: student_id,
      });

      if (!studentDoc?.parent_id?.includes(userId)) {
        throw new AppError('You are not a parent to this student.', 400);
      }
    }

    let query = Payment.find({
      student: student_id,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      const isNumber = !isNaN(Number(searchParams));

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          isNumber ? { total_amount: Number(searchParams) } : undefined,
        ].filter(Boolean),
      });
    }

    if (!query) {
      throw new AppError('Payments not found.', 404);
    }

    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('Student payment documents not found.', 404);
    }

    const paymentDoc = response as PaymentDocument[];

    return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllPaymentDocuments = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  resultArray: PaymentDocument[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Payment.find().populate('student class session', '-password');

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      const isNumber = !isNaN(Number(searchParams));

      // ALLOW SEARCH FOR STUDENT NAME CLASS AND SESSION
      query = query.where({
        $or: [
          { term: { $regex: regex } },
          isNumber ? { total_amount: Number(searchParams) } : undefined,
        ].filter(Boolean),
      });
    }

    if (!query) {
      throw new AppError('Payments not found.', 404);
    }

    const count = await query.clone().countDocuments();

    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found', 404);
      }
    }
    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('Payments not found.', 404);
    }

    const paymentDoc = response as PaymentDocument[];

    return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchStudentOutstandingPaymentDoc = async (student_id: string) => {
  try {
    const currentTerm = await Session.findOne({
      is_active: true,
    });

    const activeTerm = currentTerm?.terms.find(
      (term) => term.is_active === true
    );

    const outstandingPayments = await Payment.find({
      student: student_id,
      remaining_amount: { $gt: 0 },
      $or: [
        { session: { $ne: currentTerm?._id } },
        { term: { $ne: activeTerm?.name } },
      ],
    });

    return outstandingPayments;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchCurrentTermPaymentDocuments = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  resultArray: PaymentDocument[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    const activeSession = await Session.findOne({
      is_active: true,
    });

    const activeTerm = activeSession?.terms.find(
      (term) => term.is_active === true
    );

    let query = Payment.find({
      session: activeSession?._id,
      term: activeTerm?.name,
    });

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      const isNumber = !isNaN(Number(searchParams));

      query = query.where({
        $or: [
          { term: { $regex: regex } },
          isNumber ? { total_amount: { $regex: regex } } : undefined,
        ].filter(Boolean),
      });
    }

    if (!query) {
      throw new AppError('Payment not found.', 404);
    }

    const count = await query.clone().countDocuments();
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit);

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const response = await query.sort({ createdAt: -1 });

    if (!response || response.length === 0) {
      throw new AppError('No active term payment found.', 404);
    }

    const paymentDoc = response as PaymentDocument[];

    return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const fetchPaymentTransactionHistoryByStudentId = async (
  payload: StudentPaymentHistoryType
): Promise<{
  // totalCount: number;
  paymentObj: PaymentHistoryDataType[];
}> => {
  try {
    const { student_id, userId, userRole } = payload;

    const studentId = new mongoose.Types.ObjectId(student_id);
    // Verify parent relationship if userRole is 'parent'
    if (student_id !== userId.toString() && userRole === 'parent') {
      const student = await Student.findOne({
        _id: studentId,
      });
      if (student) {
        if (!student.parent_id?.includes(userId)) {
          throw new AppError(
            `You are not a parent to ${student.first_name} ${student.last_name}.`,
            403
          );
        }
      }
    }

    // Build the match stage
    const matchStage: any = {
      student: studentId,
    };

    // Count total documents
    const countPromise = Payment.aggregate([
      { $match: matchStage },
      { $count: 'totalCount' },
    ]);

    const pipeline: any[] = [
      { $match: matchStage },

      {
        $project: {
          student: 1,
          class: 1,
          transaction_history: {
            $setUnion: [
              { $ifNull: ['$payment_summary', []] },
              { $ifNull: ['$declined_payment_summary', []] },
              { $ifNull: ['$waiting_for_confirmation', []] },
            ],
          },
        },
      },

      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'student',
        },
      },

      { $unwind: '$student' },

      {
        $lookup: {
          from: 'classes',
          localField: 'class',
          foreignField: '_id',
          as: 'class',
        },
      },
      { $unwind: '$class' },

      { $unwind: '$transaction_history' },

      {
        $project: {
          transaction: {
            $mergeObjects: [
              '$transaction_history',
              {
                student: {
                  _id: '$student._id',
                  first_name: '$student.first_name',
                  last_name: '$student.last_name',
                },
                class: {
                  _id: '$class._id',
                  name: '$class.name',
                  level: '$class.level',
                },
              },
            ],
          },
        },
      },

      { $sort: { 'transaction.date_paid': -1 } },

      {
        $replaceRoot: { newRoot: '$transaction' },
      },

      // {
      //   $group: {
      //     _id: null,
      //     transaction_history: { $push: '$transaction' },
      //   },
      // },

      // {
      //   $project: {
      //     _id: 0,
      //     transaction_history: 1,
      //   },
      // },
    ];

    // Run aggregation
    const [countResult, payments] = await Promise.all([
      countPromise,
      Payment.aggregate(pipeline).sort({ createdAt: -1 }),
    ]);

    console.log('payments:', payments);

    const paymentObj = [...payments];
    console.log('paymentObj:', paymentObj);
    return {
      paymentObj: paymentObj as unknown as PaymentHistoryDataType[],
      // totalCount,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchPaymentDetailsByPaymentId = async (
  payload: PaymentDataType
): Promise<PaymentDocument> => {
  try {
    const { payment_id, userId, userRole } = payload;

    console.log('payment_id:', payment_id);

    const paymentId = new mongoose.Types.ObjectId(payment_id);
    const paymentDetails = await Payment.findOne(
      {
        $or: [
          { 'payment_summary._id': paymentId },
          { 'waiting_for_confirmation._id': paymentId },
        ],
      },
      {
        _id: 1,
        student: 1,
        class: 1,
        class_level: 1,
        session: 1,
        term: 1,
        fees_breakdown: 1,
        is_submit_response: 1,
        total_amount: 1,
        is_payment_complete: 1,
        remaining_amount: 1,
        createdAt: 1,
        updatedAt: 1,
        payment_summary: { $elemMatch: { _id: paymentId } },
        waiting_for_confirmation: { $elemMatch: { _id: paymentId } },
      }
    ).populate([
      { path: 'student', select: 'first_name last_name' },
      { path: 'class', select: 'name level' },
    ]);

    if (!paymentDetails) {
      throw new AppError(
        `Payment document with ID: ${payment_id} not found.`,
        404
      );
    }

    if (userRole === 'student') {
      console.log('paymentDetails.student:', paymentDetails.student);
      console.log('userId:', userId);
      if (paymentDetails.student.toString() !== userId.toString()) {
        throw new AppError(
          `Payment document with ID: ${payment_id} does not belong to you.`,
          403
        );
      }
    } else if (userRole === 'parent') {
      const student = await Student.findOne({
        _id: paymentDetails.student,
      });

      if (!student?.parent_id || student.parent_id.length === 0) {
        throw new AppError(
          'You are not a parent to the student that owns this payment document.',
          403
        );
      }

      const parentExist = new mongoose.Types.ObjectId(String(userId));

      const exists = student?.parent_id.some((id) => id.equals(parentExist));

      if (!exists) {
        throw new AppError(
          `You are not a parent to the student that owns this payment document.`,
          403
        );
      }
    }

    return paymentDetails as PaymentDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchStudentSinglePaymentDoc = async (
  student_id: string,
  payment_id: string
) => {
  try {
    const paymentId = new mongoose.Types.ObjectId(payment_id);
    const studentId = new mongoose.Types.ObjectId(student_id);

    const response = await Payment.findOne({
      _id: paymentId,
      student: studentId,
    }).populate([
      {
        path: 'student',
        select: 'first_name last_name',
      },
      { path: 'class', select: 'name level' },
    ]);

    if (!response) {
      throw new AppError('Payment not found', 404);
    }

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

// Without search
const fetchAllPaymentSummaryFailedAndSuccessful = async (): Promise<{
  paymentObj: PaymentHistoryDataType[];
}> => {
  try {
    let query = Payment.find({
      $or: [
        { 'payment_summary.0': { $exists: true } },
        { 'declined_payment_summary.0': { $exists: true } },
        { 'waiting_for_confirmation.0': { $exists: true } },
      ],
    }).populate([
      { path: 'student', select: 'first_name last_name' },
      { path: 'class', select: 'name level' },
      { path: 'payment_summary.staff_who_approve' },
    ]);

    const payments = await query.sort({ createdAt: -1 });

    if (!payments || payments.length === 0) {
      throw new AppError('No payments found.', 404);
    }

    const mergedHistory = payments.flatMap((payment) => {
      const history = [
        ...(payment.payment_summary || []),
        ...(payment.declined_payment_summary || []),
        ...(payment.waiting_for_confirmation || []),
      ];

      return history.map((t) => {
        const obj =
          typeof (t as any).toObject === 'function'
            ? (t as any).toObject()
            : { ...t };
        return {
          student: payment.student,
          class: payment.class,
          ...obj,
        };
      });
    });

    return {
      paymentObj: mergedHistory as PaymentHistoryDataType[],
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

// With search and can search student and class fields
const fetchAllPaymentSummaryFailedAndSuccessfulWithLookup = async (
  page?: number,
  limit?: number,
  searchParams?: string
): Promise<{
  resultArray: PaymentHistoryDataTypeFlat[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    const matchArray: any[] = [];

    if (searchParams && searchParams.trim() !== '') {
      const regex = new RegExp(searchParams, 'i');

      // Match array fields
      matchArray.push({
        $or: [
          { 'payment_summary.payment_method': { $regex: regex } },
          { 'payment_summary.bank_name': { $regex: regex } },
          { 'payment_summary.status': { $regex: regex } },

          { 'declined_payment_summary.payment_method': { $regex: regex } },
          { 'declined_payment_summary.bank_name': { $regex: regex } },
          { 'declined_payment_summary.status': { $regex: regex } },

          { 'waiting_for_confirmation.payment_method': { $regex: regex } },
          { 'waiting_for_confirmation.bank_name': { $regex: regex } },
          { 'waiting_for_confirmation.status': { $regex: regex } },
          { 'waiting_for_confirmation.message': { $regex: regex } },
        ],
      });
    }

    const pipeline: any[] = [
      // Lookup student
      {
        $lookup: {
          from: 'students',
          let: { studentId: '$student' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$studentId'] } } },
            { $project: { first_name: 1, last_name: 1, _id: 1 } },
          ],
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },

      // Lookup class
      {
        $lookup: {
          from: 'classes',
          let: { classId: '$class' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$classId'] } } },
            { $project: { name: 1, level: 1, _id: 1 } },
          ],
          as: 'class',
        },
      },
      { $unwind: { path: '$class', preserveNullAndEmptyArrays: true } },
    ];

    if (searchParams && searchParams.trim() !== '') {
      const regex = new RegExp(searchParams, 'i');

      matchArray.push({
        $or: [
          { 'student.first_name': { $regex: regex } },
          { 'student.last_name': { $regex: regex } },
          { 'class.level': { $regex: regex } },
        ],
      });
    }

    if (matchArray.length > 0) {
      pipeline.push({ $match: { $or: matchArray.flatMap((m) => m.$or) } });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    const countPipeline = [...pipeline, { $count: 'totalCount' }];
    const countResult = await Payment.aggregate(countPipeline);

    page === undefined ? (page = 1) : page;
    limit === undefined ? (limit = 10) : limit;

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
    }

    const payments = await Payment.aggregate(pipeline);

    const resultArray: PaymentHistoryDataTypeFlat[] = payments.flatMap(
      (payment) => {
        // Combine payment_summary and waiting_for_confirmation
        const transaction_history: WaitingForConfirmationType[] = [
          ...(payment.payment_summary || []),
          ...(payment.declined_payment_summary || []),
          ...(payment.waiting_for_confirmation || []),
        ];

        return transaction_history
          .filter((item) => {
            if (!searchParams || searchParams.trim() === '') return true;

            const regex = new RegExp(searchParams, 'i');

            const itemMatch =
              regex.test(item.status || '') ||
              regex.test(item.payment_method || '') ||
              regex.test(item.bank_name || '') ||
              ('message' in item && regex.test((item as any).message || ''));

            const student = payment.student as {
              first_name?: string;
              last_name?: string;
            };
            const classData = payment.class as {
              name?: string;
              level?: string;
            };

            const lookupMatch =
              regex.test(student?.first_name || '') ||
              regex.test(student?.last_name || '') ||
              regex.test(classData?.name || '') ||
              regex.test(classData?.level || '');

            return itemMatch || lookupMatch;
          })
          .map((item) => ({
            ...item,
            student: payment.student,
            class: payment.class,
          }));
      }
    );

    const totalCount = resultArray.length;

    const totalPages =
      page && limit ? Math.ceil(totalCount / limit) : totalCount > 0 ? 1 : 0;

    let paginatedResultArray = resultArray;
    if (page !== undefined && limit !== undefined) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedResultArray = resultArray.slice(startIndex, endIndex);
    }

    console.log('resultArray:', resultArray);
    console.log('paginatedResultArray:', paginatedResultArray);
    return {
      resultArray: paginatedResultArray,
      totalCount,
      totalPages,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Something went wrong.');
  }
};

const studentBankFeePayment = async (
  req: Request,
  payload: StudentFeePaymentType,
  res: Response
): Promise<PaymentDocument> => {
  try {
    const {
      student_id,
      session_id,
      term,
      amount_paying,
      // teller_number,
      bank_name,
      userId,
      userRole,
    } = payload;

    const student = await Student.findById({
      _id: student_id,
    });

    if (!student) {
      throw new AppError(`Student not found.`, 404);
    }

    if (userRole === 'parent' && userId) {
      if (!student.parent_id?.includes(userId)) {
        throw new AppError(
          `You are not a parent to ${student.first_name} ${student.last_name}.`,
          403
        );
      }
    }

    const findPaymentDocument = await Payment.findOne({
      student: student_id,
      session: session_id,
      term,
    });

    if (!findPaymentDocument) {
      throw new AppError('No payment record found', 404);
    }

    // if (findPaymentDocument.is_submit_response === false) {
    //   throw new AppError(
    //     'You need to inform us if you are subscribing to school bus for this term or not.',
    //     400
    //   );
    // }

    if (findPaymentDocument.is_payment_complete === true) {
      throw new AppError(
        'Payment for this term has already being completed.',
        400
      );
    }

    if (!findPaymentDocument.remaining_amount) {
      throw new AppError('Remaining amount field is null.', 400);
    }

    const feeSummary = {
      fee_name: 'school-fees',
      amount: amount_paying,
    };

    // ************************************************
    // const allTellers = [
    //   ...findPaymentDocument.waiting_for_confirmation,
    //   ...findPaymentDocument.payment_summary,
    // ];

    // const transactionIdExists = allTellers.some(
    //   (s) => s.transaction_id === teller_number
    // );

    // console.log('transactionIdExists:');

    // if (transactionIdExists) {
    //   throw new AppError(
    //     `Teller number ${teller_number} has already being submitted for this student before.`,
    //     400
    //   );
    // }
    // ************************************

    const imageUpload = await handleFileUpload(req, res);

    if (!imageUpload) {
      throw new AppError('Unable to upload profile image.', 400);
    }

    let imageData: { url: string; public_url: string } | undefined;

    if (Array.isArray(imageUpload)) {
      imageData = imageUpload[0];
    } else {
      imageData = imageUpload;
    }

    if (!imageData) {
      throw new AppError('This is not a valid cloudinary image upload.', 400);
    }

    const paymentPayload = {
      amount_paid: amount_paying,
      date_paid: new Date(),
      payment_method: paymentEnum[1],
      // transaction_id: teller_number,
      bank_name: bank_name,
      status: paymentStatusEnum[0],
      payment_evidence_image: {
        url: imageData.url,
        public_url: imageData.public_url,
      },
    };

    findPaymentDocument.waiting_for_confirmation.push(paymentPayload);

    await findPaymentDocument.save();

    return findPaymentDocument as PaymentDocument;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const studentCashFeePayment = async (
  payload: StudentFeePaymentTypeWithBursarRole
) => {
  try {
    const { student_id, session_id, term, amount_paying, payment_method } =
      payload;

    const currentTermPayment = await Payment.findOne({
      student: student_id,
      session: session_id,
      term: term,
    });

    if (!currentTermPayment) {
      throw new AppError('No payment record found for the current term.', 404);
    }

    const result = await calculateAndUpdateStudentPaymentDocuments(
      payload,
      'cash'
    );
    const student = await Student.findById({
      _id: student_id,
    });

    if (!student) {
      throw new AppError('Student not found.', 404);
    }

    const { password, ...others } = student.toObject();

    const obj = {
      paymentDoc: result,
      student: others,
    };

    return obj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened.');
    }
  }
};

const declineStudentBankPayment = async (
  payload: DeclineStudentPayloadType
) => {
  const { payment_id, bursar_id, bursarRole } = payload;
  const paymentId = new mongoose.Types.ObjectId(payment_id);
  try {
    const findPayment = await Payment.findOne({
      waiting_for_confirmation: {
        $elemMatch: {
          _id: paymentId,
        },
      },
    });

    // console.log('findPayment:', findPayment);

    if (!findPayment) {
      throw new AppError('Payment not found.', 404);
    }

    const actualTransaction = findPayment.waiting_for_confirmation.find(
      (p) => p._id?.toString() === payment_id
    );

    // console.log('actualTransaction:', actualTransaction);
    // console.log('actualTransaction2:', actualTransaction2);

    if (!actualTransaction || !actualTransaction._id) {
      throw new AppError(`Transaction not found`, 404);
    }

    if (actualTransaction.payment_evidence_image.url) {
      await cloudinaryDestroy(
        actualTransaction.payment_evidence_image.public_url
      );
    }

    const doc = {
      amount_paid: actualTransaction.amount_paid,
      date_paid: actualTransaction.date_paid,
      bank_name: actualTransaction.bank_name,
      staff_who_disapprove: bursar_id,
      approved_by_model: bursarRole === 'super_admin' ? 'SuperAdmin' : 'Admin',
      status: paymentStatusEnum[2],
      payment_method: actualTransaction.payment_method,
    };

    findPayment.declined_payment_summary.push(doc);

    const result = findPayment.waiting_for_confirmation.pull(actualTransaction);
    await findPayment.save();

    if (!result) {
      throw new AppError('Unable to decline student payment.', 400);
    }

    return result;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

const approveStudentBankPayment = async (
  payload: ApproveStudentPayloadType
) => {
  const { bank_name, payment_id, bursar_id, amount_paid, bursarRole } = payload;
  try {
    const paymentId = new mongoose.Types.ObjectId(payment_id);

    const findPayment = await Payment.findOne({
      waiting_for_confirmation: {
        $elemMatch: {
          _id: paymentId,
        },
      },
    });

    // console.log('findPayment:', findPayment);

    if (!findPayment) {
      throw new AppError('Payment not found.', 404);
    }

    const actualTransaction = findPayment.waiting_for_confirmation.find(
      (p) => p._id?.toString() === payment_id
    );

    // console.log('actualTransaction:', actualTransaction);
    // console.log('actualTransaction2:', actualTransaction2);

    if (!actualTransaction || !actualTransaction._id) {
      throw new AppError(`Transaction not found`, 404);
    }

    if (!actualTransaction.amount_paid) {
      throw new AppError('Amount paid is null.', 400);
    }

    if (actualTransaction.amount_paid !== amount_paid) {
      throw new AppError('Amount paid does not match.', 400);
    }

    if (actualTransaction.bank_name !== bank_name) {
      throw new AppError('Bank name does not match.', 400);
    }

    // if (!actualTransaction.transaction_id) {
    //   throw new AppError('Transaction ID not present.', 400);
    // }

    const receipt = {
      amount_paid: actualTransaction.amount_paid,
      date_paid: actualTransaction.date_paid,
      payment_method: actualTransaction.payment_method,
      // transaction_id: actualTransaction.transaction_id,
      bank_name: actualTransaction.bank_name,
      status: paymentStatusEnum[1],
      _id: actualTransaction._id,
    };

    const payload = {
      student_id: findPayment.student.toString(),
      session_id: findPayment.session.toString(),
      term: findPayment.term,
      amount_paying: actualTransaction?.amount_paid,
      bank_name,
      // teller_number: actualTransaction.transaction_id,
      payment_id: actualTransaction._id,
      staff_who_approve: bursar_id,
      bursarRole: bursarRole,
      payment_method: 'bank',
    };

    const result = await calculateAndUpdateStudentPaymentDocuments(
      payload,
      'bank'
    );

    // const result = payload;

    if (!result) {
      throw new AppError('Unable to update student payment.', 400);
    }

    const transactionObj = {
      result,
      receipt,
    };
    return transactionObj;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.error(error);
      throw new Error('Something happened');
    }
  }
};

const fetchAPaymentNeedingApprovalById = async (
  payment_id: string
): Promise<WaitingForConfirmationType> => {
  try {
    const response = await Payment.find({
      'waiting_for_confirmation.0': { $exists: true },
    });

    if (!response) {
      throw new AppError('Payment not found.', 404);
    }

    const result = response
      ?.map((payment) =>
        payment.waiting_for_confirmation.find(
          (p) => p?._id?.toString() === payment_id
        )
      )
      .filter(Boolean);

    if (!result) {
      throw new AppError('Payment not found.', 404);
    }

    return result[0] as WaitingForConfirmationType;
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

const fetchAllPaymentsNeedingApproval = async (
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  resultArray: WaitingForConfirmationType[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Payment.find({
      'waiting_for_confirmation.0': { $exists: true },
    }).populate([
      { path: 'student', select: 'first_name last_name' },
      { path: 'class', select: 'name level' },
      { path: 'payment_summary.staff_who_approve' },
    ]);

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');
      const isNumber = !isNaN(Number(searchParams));

      query = query.where({
        waiting_for_confirmation: {
          $elemMatch: {
            $or: [
              {
                payment_method: {
                  $regex: regex,
                },
              },
              {
                bank_name: {
                  $regex: regex,
                },
              },
              isNumber
                ? {
                    amount_paid: {
                      $regex: regex,
                    },
                  }
                : undefined,
              // {
              //   transaction_id: {
              //     $regex: regex,
              //   },
              // },
              {
                status: {
                  $regex: regex,
                },
              },
            ].filter(Boolean),
          },
        },
      });
    }

    if (!query) {
      throw new AppError('Payment not found.', 404);
    }

    const count = await query.clone().countDocuments(); // Clone query to avoid execution conflict
    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page can not be found.', 404);
      }
    }

    const result = await query;

    if (!result || result.length === 0) {
      throw new AppError('Payment not found.', 404);
    }

    console.log('result:', result);

    const expectedReturn = result
      .map((payment) => {
        const filtered = payment.waiting_for_confirmation.filter(
          (p) => p.payment_method === 'bank'
        );
        console.log('filtered:', filtered);

        const filteredResponse = filtered.map(
          (item) => {
            const docObject = item.toObject();
            return {
              student: payment.student,
              class: payment.class,
              ...docObject,
            };
          }

          //   ({
          //   student: payment.student,
          //   class: payment.class,
          //   ...item,
          // })
        );

        return filteredResponse;
      })
      .flat();

    const paymentDoc = expectedReturn as WaitingForConfirmationType[];
    console.log('paymentDoc:', paymentDoc);

    return { resultArray: paymentDoc, totalPages: pages, totalCount: count };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      console.log(error);
      throw new Error('Something happened.');
    }
  }
};

const fetchAllPaymentsApprovedByBursarId = async (
  bursar_id: string,
  page: number | undefined,
  limit: number | undefined,
  searchParams: string
): Promise<{
  resultArray: WaitingForConfirmationType[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    let query = Payment.find({
      payment_summary: {
        $elemMatch: {
          staff_who_approve: bursar_id,
        },
      },
    }).populate('payment_summary.staff_who_approve', '-password');

    if (searchParams) {
      const regex = new RegExp(searchParams, 'i');

      query = query.where({
        $or: [{ payment_method: { $regex: regex } }],
      });
    }

    if (!query) {
      throw new AppError('Payment not found.', 404);
    }

    const count = await query.clone().countDocuments();

    let pages = 0;

    if (page !== undefined && limit !== undefined && count !== 0) {
      const offset = (page - 1) * limit;

      query = query.skip(offset).limit(limit).sort({ createdAt: -1 });

      pages = Math.ceil(count / limit);

      if (page > pages) {
        throw new AppError('Page not found', 404);
      }
    }
    const response = await query;

    if (!response || response.length === 0) {
      throw new AppError('Payments not found.', 404);
    }

    const expectedReturn = response
      .map((payment) =>
        payment.payment_summary.filter(
          (p) => p?.staff_who_approve?._id.toString() === bursar_id
        )
      )
      .flat();

    const paymentDoc = expectedReturn as WaitingForConfirmationType[];

    return { resultArray: paymentDoc, totalCount: count, totalPages: pages };
  } catch (error) {
    if (error instanceof AppError) {
      throw new AppError(error.message, error.statusCode);
    } else {
      throw new Error('Something happened');
    }
  }
};

export {
  addingFeeToStudentPaymentDocument,
  approveStudentBankPayment,
  createSchoolFeePaymentDocumentForStudents,
  declineStudentBankPayment,
  fetchAllPaymentDocuments,
  fetchAllPaymentsApprovedByBursarId,
  fetchAllPaymentsNeedingApproval,
  fetchAllPaymentSummaryFailedAndSuccessful,
  fetchAllPaymentSummaryFailedAndSuccessfulWithLookup,
  fetchAllStudentPaymentDocumentsByStudentId,
  fetchAPaymentNeedingApprovalById,
  fetchCurrentTermPaymentDocuments,
  fetchPaymentDetailsByPaymentId,
  fetchPaymentTransactionHistoryByStudentId,
  fetchStudentOutstandingPaymentDoc,
  fetchStudentSinglePaymentDoc,
  studentBankFeePayment,
  studentCashFeePayment,
};
