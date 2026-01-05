import { NextFunction, Request, Response } from 'express';
import mongoose, { Document, Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: UserInJwt;
    }
  }
}

// interface CustomRequest extends Request {
//   school_id?: string;
//   subdomain?: string;
// }

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

// type AsyncHandler = (
//   req: CustomRequest,
//   res: Response,
//   next: NextFunction
// ) => Promise<any>;

type ComparePassType = {
  password: string;
  confirm_password: string;
};

type LinkStudentType = {
  first_name: string;
  last_name: string;
};

type UserObj = LinkStudentType & {
  middle_name?: string;
  gender: string;
  phone?: string;
  dob?: Date;
  employment_date?: Date;
  email: string;
  password: string;
};

type SchoolUserType = UserObj & {
  school_id: mongoose.Types.ObjectId;
};

type UserDocument = Document &
  UserObj & {
    _id: mongoose.Types.ObjectId;
    bus_category_id?: mongoose.Types.ObjectId;
    password: string;
    role: string;
    is_verified?: boolean;
    redundant?: boolean;
    wallet_account_obj?: StudentAccountType;
    is_chosen_major?: boolean;
    new_session_subscription?: boolean;
    home_address?: string;
    close_bus_stop?: string;
    is_updated: boolean;
    status?: string;
    admission_session?: string;
    current_arm?: string;
    stream?: string;
    current_class_level?: string;
    alumni_status?: string;
    subjects_capable_of_teaching?: {
      subject: mongoose.Types.ObjectId;
    }[];

    teaching_assignment?: {
      subject: mongoose.Types.ObjectId;
      class_id: mongoose.Types.ObjectId;
    }[];
    employment_details?: {
      company_name: string;
      position: string;
    };
    graduation_session?: string;
    parent_id?: mongoose.Types.ObjectId[];
    outstanding_balance?: number;
    profile_image?: {
      url: string;
      public_url: string;
    };
    children?: mongoose.Types.ObjectId[];
    class_managing?: mongoose.Types.ObjectId;
    session: string;
    admission_number: string;
    cumulative_score?: number;
    overall_position?: number;
    current_class?: {
      class_id: mongoose.Types.ObjectId;
      // academic_session: string;
    };
    active_class_enrolment: boolean;
  };

type UserReturn = Omit<UserDocument, 'password'>;

type RegistrationServiceType = UserDocument & {
  userRole: string;
};

type VerificationType = {
  token: string;
  // school_id?: mongoose.Types.ObjectId | null;
  super_admin_id?: mongoose.Types.ObjectId | null;
  admin_id?: mongoose.Types.ObjectId | null;
  non_teaching_id?: mongoose.Types.ObjectId | null;
  parent_id?: mongoose.Types.ObjectId | null;
  student_id?: mongoose.Types.ObjectId | null;
  teacher_id?: mongoose.Types.ObjectId | null;
  purpose: string;
  role: string;
  created_at: Date;
} & Document;

type VerificationDocument = Document & Partial<VerificationType>;

type StudentRegistration = LinkStudentType &
  PayloadForLoginInput & {
    middle_name: string;
    gender: string;
    // school: mongoose.Types.ObjectId;
    dob: Date;
    admission_session: string;
    admission_number: string | number;
    role: string;
  };

type PayloadForLoginInput = {
  email: string;
  password: string;
};

type LoginResponseType = {
  refreshToken: string;
  accessToken: string;
  user: UserObj;
};

type ParentType = {
  phone?: string;
  middle_name: string;
};

type ExcludeParentAndStudent = {
  phone?: string;
  middle_name: string;
  dob?: Date;
  employment_date?: Date;
};

type AdmissionValidationType = {
  admission_session: string;
  admission_number: string | number;
  dob: Date;
};

type TeacherValidationType = {
  first_name: string;
  last_name: string;
  middle_name: string;
};

type SchoolBusValidationType = {
  close_group: {
    both_trips: number;
    single_trip: number;
  };
  far_group: {
    both_trips: number;
    single_trip: number;
  };
};

type CashPaymentType = {
  student_id: string;
  session_id: string;
  term: string;
  amount_paying: number;
  class_id: string;
};

type AddressValidationType = {
  home_address: string;
  // close_bus_stop: string;
};

type BankPaymentType = CashPaymentType & {
  bank_name: string;
  // teller_number: number;
};

type NegotiatedFeesType = {
  negotiated_school_charge: number;
  negotiated_transaction_charge: number;
};

type BankApprovalType = {
  amount_paid: number;
  // transaction_id: string;
  bank_name: string;
};

type LogoType = {
  url: string;
  public_url?: string;
};

type SchoolCreationPayloadType = {
  // _id: ObjectId;
  school_name: string;
  subdomain: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email?: string;
  website?: string;
};

type SchoolType = Document &
  SchoolCreationPayloadType & {
    _id: mongoose.Types.ObjectId;
    negotiated_school_charge_per_student?: number;
    negotiated_school_payment_transaction_charge_per_transaction?: number;
    logo?: LogoType;
    school_image?: LogoType;
    principal_signature_per_term: {
      academic_session_id: mongoose.Types.ObjectId;
      term: string;
      url: string;
      public_url: string;
    }[];
    subscription: {
      plan: 'basic' | 'essential' | 'pro' | 'advanced';
      subscribed_at: Date;
    };
    bus_service_available: boolean;
    has_bank_accounts: boolean;
    has_payment_priority_setting: boolean;
    has_result_setting: boolean;
    school_owner?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

type StudentValidationType = {
  phone?: string;
  middle_name: string;
  dob: Date;
  admission_session: Date;
  graduation_session?: Date;
};

type SchoolCreationValidationType = {
  school_name: string;
  subdomain: string;
  address: string;
  country: string;
  phone: number;
  city: string;
  state: string;
  email?: string;
  website?: string;
};

type User = ComparePassType & UserObj;

type ImageType = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};

type FilePath = string;
type FolderName = string;
type CloudinaryType =
  | {
      url: string;
      public_url: string;
    }
  | undefined;

type TokenType = {
  user_id: mongoose.Types.ObjectId;
  school_id?: mongoose.Types.ObjectId;
  role: string;
};

type CompanyTokenType = {
  user_id: mongoose.Types.ObjectId;
  role: string;
};

type VerifyUserType = {
  user_id: mongoose.Types.ObjectId;
  role: string;
  token: number;
};

// type VerifyUserType = {
//   role: string;
//   token: string;
//   admin_id?: object | null;
//   super_admin_id?: object | null;
//   non_teaching_id?: object | null;
//   student_id?: object | null;
//   old_student_id?: object | null;
//   teacher_id?: object | null;
//   parent_id?: object | null;
//   createdAt?: Date;
// } & Document;

type EmailJobData = {
  email: string;
  child_email?: string;
  first_name: string;
  child_name?: string;
  token?: string;
  title?: string;
  academic_session?: string;
  option?: string;
  message?: string;
  school_name?: string;
  city?: string;
  state?: string;
  country?: string;
  type:
    | 'email-verification'
    | 'school-creation'
    | 'forgot-password'
    | 'child-linkage'
    | 'session-subscription';
};

type EmailType = {
  email: string;
  first_name?: string;
  token?: string;
  title?: string;
  message?: string;
  child_name?: string;
  child_email?: string;
  academic_session?: string;
  school_name?: string;
  city?: string;
  state?: string;
  country?: string;
};

type EmailQueue = {
  first_name: string;
  school_name: string;
  school_city: string;
  school_state: string;
  school_country: string;
  email: string;
  token?: string;
  title?: string;
  message?: string;
};

type CompanyEmailQueue = {
  first_name: string;
  email: string;
  token: string;
};

type UserInJwt = {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userRole: string;
  iat: number;
  exp: number;
};

// type ExamComponentType = {
//   exam_name: string;
//   component: {
//     key: string;
//     name: string;
//     percentage: number;
//   }[];
// };

type GradingAndRemarkType = {
  value: number;
  grade: string;
  remark: string;
};

type ExamComponentObjectType = {
  key: string;
  name: string;
  percentage: number;
};

type ExamComponentType = {
  exam_name: string;
  component: ExamComponentObjectType[];
};

type ResultSettingDocument = {
  _id: mongoose.Types.ObjectId;
  components: ResultSettingComponentType[];
  exam_components: ExamComponentType;
  grading_and_remark: GradingAndRemarkType[];
  level: string;
  allow_cbt: boolean;
  exam_split: boolean;
};

type ResultSettingComponentType = {
  name: string;
  percentage: number;
  column: number;
};

type ScoreType = {
  score_name: string;
  score: number;
  key?: string;
};

type ExamScoreType = ScoreType & { key: string };

type GradingObjType = {
  value: number;
  grade: string;
  remark: string;
};

type ScoreAndGradingType = {
  score: ScoreType[];
  gradingObj: GradingObjType[];
  current_term: string;
};

type SubjectResultProp = {
  // school: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  subject_teacher: mongoose.Types.ObjectId;
  total_score: number;
  scores: ScoreType[];
  exam_object: ExamScoreType[];
  grade?: string;
  remark?: string;
  subject_position: string;
  cumulative_average: number;
  last_term_cumulative: number;
  class_highest_mark: number;
  class_average_mark: number;
  class_lowest_mark: number;
};

type TermResult = {
  term: string;
  cumulative_score: number;
  class_position: string;
  punctuality?: string;
  neatness?: string;
  politeness?: string;
  honesty?: string;
  relationshipWithOthers?: string;
  leadership?: string;
  emotionalStability?: string;
  health?: string;
  attitudeToSchoolWork?: string;
  attentiveness?: string;
  perseverance?: string;
  subject_results: SubjectResultProp[];
  _id?: mongoose.Types.ObjectId;
};

type ResultDocument = {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  enrolment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  class_teacher: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  term_results: TermResult[];
  final_cumulative_score: number;
  final_status: string | null;
  position: number;
  remark: string;
};

type TermDocument = {
  // school: mongoose.Types.ObjectId;
  _id?: mongoose.Types.ObjectId;
  name: string;
  start_date: Date;
  end_date: Date;
  date_of_resumption?: Date;
  date_of_vacation?: Date;
  is_active?: boolean;
};

type SubjectTermResult = {
  term: string;
  total_score: number;
  last_term_cumulative: number;
  cumulative_average: number;
  class_highest_mark: number;
  class_lowest_mark: number;
  class_average_mark: number;
  exam_object: ExamScoreType[];
  scores: ScoreType[];
  subject_position: string;
  grade?: string;
  remark?: string;
  class_position: string;
};

type SubjectResultDocument = Document & {
  enrolment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  subject_teacher: mongoose.Types.ObjectId;
  term_results: SubjectTermResult[];
  createdAt: Date;
  updatedAt: Date;
};

type SessionDocument = Document & {
  _id: mongoose.Types.ObjectId;
  // school: mongoose.Types.ObjectId;
  academic_session: string;
  terms: TermDocument[];
  is_active: boolean;
  is_promotion_done: boolean;
  is_subscription_mail_sent: boolean;
};

type TermSettingsDocument = Document & {
  session: mongoose.Types.ObjectId;
  term: 'first_term' | 'second_term' | 'third_term';
  date_of_resumption: Date;
  date_of_vacation: Date;
};

type TermCreationType = TermDocument & {
  session_id: string;
  // school: mongoose.Types.ObjectId;
};

type ChangePasswordType = {
  token: string;
  password: string;
};

type RefreshTokenType = {
  _id?: mongoose.Types.ObjectId;
  token: string;
  user_id: mongoose.Types.ObjectId;
  role: string;
  created_at: Date;
};

type CreateSubjectType = {
  name: string;
  description: string;
};

type CreateClassType = CreateSubjectType & {
  section: string;
  level: string;
};

type SubjectCreationType = CreateSubjectType & {
  // sections: {
  //   tier: string;
  //   is_compulsory: boolean;
  // };
  // stream: string;
  // school: mongoose.Types.ObjectId;
};

type SubjectFetchingPayload = {
  subject_id: string;
  // school: string;
};

type LogoutPayload = {
  access_token: string;
  refresh_token: string;
};

type ClassCreationType = {
  // school: mongoose.Types.ObjectId;
  name: string;
  level: string;
  section: string;
  description: string;
  // arms: string[];
  // streams: string[];
  compulsory_subjects: string[];
  // optional_subjects: string[];
};

type TeacherSubjectAssignment = {
  teacher: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
};

type ClassDocument = Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  level: string;
  section: string;
  description?: string;
  // arms: string[];
  compulsory_subjects: mongoose.Types.ObjectId[];
  class_teacher?: mongoose.Types.ObjectId;
  teacher_subject_assignments: TeacherSubjectAssignment[];
};

type GetClassPayloadType = {
  class_id: string;
};

type StudentEnrolmentType = {
  student_id?: string;
  student_ids?: string[];
  class_id: string;
  // school: mongoose.Types.ObjectId;
  academic_session_id: string;
  term: string;
  level: string;
  subjects_to_offer_array: mongoose.Types.ObjectId[];
};

type PerformanceType = {
  subject: object;
  score: number;
};

type AttendanceType = {
  date: Date;
  status: string;
  student: object;
};

type SubjectOfferedType = {
  _id: mongoose.Types.ObjectId;
  school: mongoose.Types.ObjectId;
  name: string;
  description: string;
  sections: {
    tier: string;
    is_compulsory: boolean;
    _id: mongoose.Types.ObjectId;
  }[];
  class_ids: mongoose.Types.ObjectId[];
  teacher_ids: mongoose.Types.ObjectId[];
};
type StudentObjType = {
  student: mongoose.Types.ObjectId;
  term: string;
  subjects_offered: mongoose.Types.ObjectId[];
};

type ClassEnrolmentDocument = {
  _id: mongoose.Types.ObjectId;
  students: StudentObjType[];
  class: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  level: string;
  term: string;
  stream: string;
  is_active: boolean;
  all_subjects_offered_in_the_class: mongoose.Types.ObjectId[];
  status: string;
  performance: PerformanceType[];
  test_scores: PerformanceType[];
  exam_scores: PerformanceType[];
  attendance: AttendanceType[];
};

type CommonParamForResultCreation = {
  class_enrolment_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  // school: mongoose.Types.ObjectId;
};

type ResultCreationType = CommonParamForResultCreation & {
  student_id: mongoose.Types.ObjectId;
};

type MultipleResultCreationType = CommonParamForResultCreation & {
  student_ids: mongoose.Types.ObjectId[];
};

type UserWithoutPassword = Omit<UserDocument, 'password'>;

type StudentUpdateType = {
  home_address: string;
  student_id: string;
  parent_id?: string;
  userRole?: string;
  // school_id: string;
};

type PaymentSummaryType = {
  _id?: mongoose.Types.ObjectId;
  amount_paid: number;
  date_paid: Date;
  payment_method: string;
  // transaction_id: string;
  status: string;
  bank_name?: string;
  approved_by_model: string;
  staff_who_approve?: mongoose.Types.ObjectId;
  staff_who_disapprove?: mongoose.Types.ObjectId;
  // fees_payment_breakdown: FeeBreakdownType[];
};

type FeeBreakdownType = {
  fee_name: string;
  amount: number;
};

type PaymentDocument = Document & {
  student: mongoose.Types.ObjectId;
  class: mongoose.Types.ObjectId;
  class_level: string;
  session: mongoose.Types.ObjectId;
  // school: mongoose.Types.ObjectId;
  term: string;
  fees_breakdown: FeeBreakdownType[];
  total_amount: number;
  is_payment_complete: boolean;
  is_submit_response: boolean;
  remaining_amount: number;
  payment_summary: PaymentSummaryType[];
  declined_payment_summary: PaymentSummaryType[];
  waiting_for_confirmation: mongoose.Types.DocumentArray<WaitingForConfirmationType>;
};

type StudentWithPaymentType = UserWithoutPassword & {
  latest_payment_document: PaymentDocument | null;
};

type StudentLinkingType = {
  admission_number: string;
  first_name: string;
  last_name: string;
  parent_id: mongoose.Types.ObjectId;
  // school_id: string;
};

type NotificationProp = {
  title: string;
  user_id?: mongoose.Types.ObjectId;
  message: string;
  // school: mongoose.Types.ObjectId;
};

type NotificationDocument = NotificationProp & {
  id: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  receiver: string;
  is_viewed: boolean;
  is_archived: boolean;
};

type ParentObjType = {
  email: string;
  first_name: string;
  last_name: string;
  school: mongoose.Types.ObjectId;
};

type StudentNotificationType = {
  school: mongoose.Types.ObjectId;
  email: string;
  first_name: string;
  last_name: string;
  parent_id: ParentObjType[];
};

type SessionSubscriptionType = {
  student_ids_array: string[];
  academic_session_id: string;
  userRole?: string;
  // school_id: string;
};

type StudentSessionSubscriptionType = {
  student_id: string;
  // school_id: string;
  academic_session_id: string;
  parent_id: mongoose.Types.ObjectId;
  userRole: string;
  new_session_subscription_status: boolean;
};

type OptionalJwtUserObjType = {
  userId?: mongoose.Types.ObjectId;
  userRole?: string;
};

type GetClassStudentsType = OptionalJwtUserObjType & {
  session_id: string;
  class_id: string;
  // school_id: string;
};

type OptionalFeeType = MandatoryFeeType & {
  applicable_classes: mongoose.Types.ObjectId[];
};

type MandatoryFeeType = {
  fee_name: string;
  amount: number;
};

type SchoolFeesDocument = {
  _id: mongoose.Types.ObjectId;
  level: string;
  term: string;
  // school: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  school_fees: number;
  optional_fees: {
    fee_name: string;
    amount: number;
    applicable_classes: { class: mongoose.Types.ObjectId }[];
  }[];
  mandatory_fees: MandatoryFeeType[];
  createdAt: Date;
  updatedAt: Date;
};

type SchoolBusPayloadType = {
  id?: string;
  close_group: {
    both_trips: number;
    single_trip: number;
  };

  far_group: {
    both_trips: number;
    single_trip: number;
  };
};

type SchoolBusDocument = {
  _id: mongoose.Types.ObjectId;
  school_bus?: SchoolBusPayloadType;
  createdAt: Date;
  updatedAt: Date;
};

type MandatoryFeePayloadType = {
  term?: string;
  amount: number;
  fee_name: string;
};

type OptionalFeePayloadType = MandatoryFeePayloadType & {
  applicable_classes: [];
};

type OptionalFeeAdditionType = Omit<OptionalFeePayloadType, 'term'>;

type FeePayloadType = {
  amount: number;
  class_level: string;
};

type AddingFeeToPaymentPayload = {
  fee_name: string;
  amount: number;
  // school_id: string;
  student_id: string;
};

type OptionalFeeProcessingType = {
  uniqueClasses: ClassDocument[];
  fee_name: string;
  amount: number;
  term: string;
  academic_session_id: mongoose.Types.ObjectId;
};

type PaymentPayloadOptionalFeeType = {
  applicable_classes: mongoose.Types.ObjectId[];
  // school: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  termName: string;
  session: mongoose.ClientSession;
  fee_name: string;
  amount: number;
};

type AddFeeToStudentPaymentDocType = {
  // school: mongoose.Types.ObjectId;
  session_id: mongoose.Types.ObjectId;
  termName: string;
  studentId: mongoose.Types.ObjectId;
  session: mongoose.ClientSession;
  fee_name: string;
  amount: number;
};

type MandatoryFeeProcessingType = {
  gLevels: SchoolFeesDocument[];
  fee_name: string;
  amount: number;
  // school: mongoose.Types.ObjectId;
  termName: string;
  academic_session_id: mongoose.Types.ObjectId;
  session: mongoose.ClientSession;
};

type PaymentPayloadMandatoryFeeType = {
  // school: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  termName: string;
  session: mongoose.ClientSession;
  fee_name: string;
  amount: number;
};

type JwtUserObjType = {
  userId: mongoose.Types.ObjectId;
  userRole: string;
  // school_id: string;
};

type JwtUserObjType2 = {
  user_id: string;
  userRole: string;
  // school_id: string;
};

type StudentClassPayloadType = JwtUserObjType & {
  class_id: string;
};

type StudentPaymentHistoryType = JwtUserObjType & {
  student_id: string;
};

type PaymentHistoryDataType = {
  _id: mongoose.Types.ObjectId;
  transaction_history: WaitingForConfirmationType[];
};

type PaymentHistoryDataTypeFlat = WaitingForConfirmationType & {
  student: {
    first_name: string;
    last_name: string;
  };
  class: {
    name: string;
    level: string;
  };
};

type PaymentDataType = JwtUserObjType & {
  payment_id: string;
};

type ScoreParamType = {
  term: string;
  student_id: string;
  session_id: string;
  teacher_id: string;
  score: number;
  subject_id: string;
  score_name: string;
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type ScoreRecordingParamType = ScoreParamType & {
  // session: mongoose.ClientSession;
};

type CumScoreParamType = {
  term: string;
  student_id: string;
  session_id: string;
  teacher_id: string;
  score: number;
  subject_id: string;
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type ResultObjType = {
  grade: string;
  total: number;
  remark: string;
};

type TeacherToSubjectType = {
  subject?: string;
  class_id: string;
  teacher_id: string;
  // school_id: string;
};

type OnboardTeacherType = {
  teacher_id: string;
  subject_ids: string[];
  // school_id: string;
};

type ClassTeacherChangeType = {
  class_id: string;
  new_class_teacher_id: string;
  // school_id: string;
};

type ClassSubjectTeacherChangeType = {
  subject: string;
  class_id: string;
  new_teacher_id: string;
  // school_id: string;
};

type StudentSubjectType = OptionalJwtUserObjType & {
  class_id: string;
  subject_id: string;
  academic_session_id: string;
  // school_id: string;
};

type TeacherSubjectType = JwtUserObjType2 & {
  teacher_id: string;
};

type StudentClassByIdPayloadType = StudentClassPayloadType & {
  academic_session_id: string;
  teacher_id?: string;
};

interface StudentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  subjects_offered: SubjectOfferedType[];
}

type AddingNegotiatedChargesType = NegotiatedFeesType & {
  school_id: string;
};

type StudentScoreObj = {
  student_id: string;
  score: number;
};

type StudentExamScoreObj = {
  student_id: string;
  score: number;
};
// type StudentExamScoreObj = {
//   student_id: string;
//   score_array: {
//     score_name: string;
//     score_value: number;
//   }[];
// };

type MultipleScoreParamType = {
  term: string;
  result_objs: StudentScoreObj[];
  session_id: string;
  teacher_id: string;
  subject_id: string;
  score_name: string;
  // score_type: 'first_term' | 'second_term' | 'exam';
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type MultipleScoreUpdateParamType = MultipleScoreParamType & {
  userId: mongoose.Types.ObjectId;
};

type MultipleExamScoreParamType = {
  term: string;
  result_objs: StudentExamScoreObj[];
  session_id: string;
  teacher_id: string;
  subject_id: string;
  score_name: string;
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type MultipleLastCumParamType = {
  term: string;
  last_term_cumulative_objs: StudentScoreObj[];
  session_id: string;
  teacher_id: string;
  subject_id: string;
  class_enrolment_id: string;
  class_id: string;
  // school_id: string;
};

type ScorePayload = OptionalJwtUserObjType & {
  class_id: string;
  academic_session_id: string;
  subject_id: string;
  term: string;
  // school_id: string;
};

type StudentPopulatedType = {
  _id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
  gender: string;
};

type SingleStudentScorePayload = StudentResultTermType & {
  class_id: string;
  // academic_session_id: string;
  // student_id: string;
  subject_id: string;
  // term: string;
};

type GetStudentByIdType = {
  student_id: string;
  session?: mongoose.ClientSession;
  // school: mongoose.Types.ObjectId;
};

type GetTeacherByIdType = {
  teacher_id: string;
  session?: mongoose.ClientSession;
  // school: mongoose.Types.ObjectId;
};

type SubjectPopulatedType = {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  teacher_ids: mongoose.Types.ObjectId[];
};

type StudentResultTermType = JwtUserObjType & {
  student_id: string;
  academic_session_id: string;
  term: string;
};

type StudentResultSessionType = JwtUserObjType & {
  student_id: string;
  academic_session_id: string;
};

type ClassResultsType = {
  class_id: string;
  userId: mongoose.Types.ObjectId;
  userRole: string;
  academic_session_id: string;
  term: string;
  // school_id: string;
};

type BusFee = {
  to: number;
  fro: number;
  to_and_fro: number;
};

type BusCategoryType = {
  name: string;
  bus_fee: BusFee;
  school: mongoose.Types.ObjectId;
  bus_stops: string[];
};

type BusSubscriptionType = {
  student: mongoose.Types.ObjectId;
  bus_category: mongoose.Types.ObjectId;
  bus_subscription_type: 'none' | 'to' | 'fro' | 'to_and_fro';
  bus_fee: number;
  school: mongoose.Types.ObjectId;
  term: string;
  session: mongoose.Types.ObjectId;
};

type BusFeeValidationType = {
  name: string;
  addresses_array: string[];
  to: number;
  fro: number;
  to_and_fro: number;
};

type StudentSchoolBusSubType = {
  student_id: string;
  session_id: string;
  term: string;
  parent_id?: string;
  bus_subscription_type: string;
  bus_stop?: string;
  school_id: string;
};

type BusPayloadType = BusFeeValidationType & {
  school_id: string;
};

type OptionalSubjectProcessingType = JwtUserObjType & {
  student_id: string;
  optional_subjects_chosen_ids: string[];
  class_id: string;
};

type PaymentPayloadType = {
  student_id: string;
  amount_paid: number;
  school_id: string;
};

type PriorityType = {
  fee_name: string;
  priority_number: number;
};

type PaymentPriorityType = {
  // school: mongoose.Types.ObjectId;
  priority_order: PriorityType[];
};

type AccountType = {
  _id: mongoose.Types.ObjectId;
  account_number: string;
  bank_name: string;
  account_name: string;
};

type StudentAccountType = Omit<AccountType, '_id'> & {
  balance: number;
};

type SchoolAccountType = { accounts: AccountType[] };

type AccountDetailsType = {
  account_details_array: AccountType[];
};

type AccountObjectType = AccountType & {
  _id: mongoose.Types.ObjectId;
};

// type AccountObjectType = SchoolAccountType & {
//   _id: mongoose.Types.ObjectId;
// };

type CustomerCreationPayloadType = {
  student_email: string;
  student_first_name: string;
  student_last_name: string;
  student_school_name: string;
  student_id: string;
};

type StudentWalletObjType = {
  phoneNumber: string;
  email: string;
  nin: string;
};

type SubjectIdObjType = {
  subject_id: string;
  is_compulsory: boolean;
};

type SubjectAdditionType = {
  class_id: string;
  subject_ids_array: string[];
  // school_id: string;
};

type SubjectRemovalType = {
  class_id: string;
  subject_ids_array: string[];
  // school_id: string;
};

type AllStudentResultsPayloadType = {
  student_id: string;
  // school_id: string;
  result_id?: string;
};

type StudentSubjectPositionType = {
  class_enrolment_id: string;
  subject_id: string;
  userId: mongoose.Types.ObjectId;
  userRole: string;
  // school_id: string;
};

type StudentSpecificResultPayloadType = {
  student_id: string;
  session_id: string;
  term: string;
  userRole: string;
  userId: mongoose.Types.ObjectId;
};

type StudentResultPopulatedType = ResultDocument & { student: UserDocument };

type SubjectResultType = {
  subject: object;
  subject_teacher: object;
  total_score: number;
  last_term_cumulative: number;
  cumulative_average: number;
  scores: ScoreType[];
  subject_position: string;
  grade: string;
  remark: string;
  _id: mongoose.Types.ObjectId;
};

type ClassPositionCalType = {
  studentId: object;
  first_name: string;
  last_name: string;
  allCummulatives: TermResult;
};

type ClassLevelCreationPayloadType = {
  // school_id: string;
  class_level_array: string[];
};

type ClassSubjectFetchPayload = {
  // school_id: string;
  class_id: string;
};

type ClassTeacherManagesPayloadType = {
  // school_id: string;
  teacher_id: string;
};

type ContactUsDocument = Document & ContactUsType;

type ContactUsType = {
  first_name: string;
  last_name: string;
  school_name?: string;
  email: string;
  message: string;
};

type FeatureKeyType =
  | 'result_processing'
  | 'objective_exam'
  | 'manual_attendance'
  | 'theory_exam'
  | 'payment_processing'
  | 'qr_attendance'
  | 'advance_analytics'
  | 'student_class_real_time_video';

type AccessModeType = 'any' | 'all';

type CbtAssessmentDocumentCreationType = {
  assessment_type: string;
  level: string;
  min_obj_questions: number;
  expected_obj_number_of_options: number;
  max_obj_questions: number;
  number_of_questions_per_student: number;
};

type CbtAssessmentDocumentArrayType = {
  academic_session_id: string;
  term: string;
  assessmentDocumentArray: CbtAssessmentDocumentCreationType[];
};

type CbtAssessmentDocument = {
  is_active: boolean;
  // school: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  term: string;
  level: string;
  assessment_type: string;
  min_obj_questions: number;
  expected_obj_number_of_options: number;
  max_obj_questions: number;
  number_of_questions_per_student: number;
};

type ClassLevelArrayType = {
  class_level_array: string[];
};

type ObjQuestionType = {
  question_number: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  score: number;
};

type AssessmentDocumentType = {
  assessment_type: string;
  number_of_questions_per_student: number;
  min_obj_questions: number;
  max_obj_questions: number;
  expected_obj_number_of_options: number;
  level: string;
};

type TimetableArrayType = {
  subject_id: string;
  start_time: Date;
  duration: number;
}[];

type NewDateTimetable = {
  selected_time: Date;
};

type SubjectObjQuestionDocumentCreationType = {
  teacher_id: mongoose.Types.ObjectId;
  academic_session_id: string;
  class_id: string;
  questions_array: ObjQuestionType[];
  term: string;
  subject_id: string;
  assessment_type: string;
};

type CbtAssessmentInputFieldsType = {
  min_obj_questions: number;
  max_obj_questions: number;
  expected_obj_number_of_options: number;
  assessment_type: string;
  number_of_questions_per_student: number;
};

type CbtAssessmentStartingType = {
  academic_session_id: string;
  subject_id: string;
  class_id: string;
  // assessment_type: string;
  student_id: mongoose.Types.ObjectId;
  term: string;
};

type ResultDocType = {
  _id: mongoose.Types.ObjectId;
  obj_total_time_allocated: number;
  obj_time_left: number;
  sanitizedQuestions: Omit<
    ShuffledObjQuestionsDocument,
    'question_original_number, correct_answer'
  >[];
};

type CbtAssessmentUpdateCommonType = {
  cbt_result_id: string;
  exam_id: string;
  student_id: mongoose.Types.ObjectId;
};

type CbtAssessmentUpdateType = CbtAssessmentUpdateCommonType & {
  result_doc: Omit<
    ShuffledObjQuestionsDocument,
    'question_original_number, correct_answer, question_shuffled_number, question_original_number'
  >[];
};

type CbtAssessmentTimeUpdateType = CbtAssessmentUpdateCommonType & {
  remaining_time: number;
};

type CbtAssessmentEndedType = CbtAssessmentUpdateCommonType & {
  trigger_type: 'manual' | 'time_up' | 'cutoff';
  result_doc: ResultDocType;
};

type CbtAssessmentResultType = {
  cbt_result_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  exam_id: mongoose.Types.ObjectId;
  term: string;
  level: string;
  enrolment: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  subject_teacher: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  convertedScore: number;
};

type GetClassCbtAssessmentTimetablePayloadType = {
  academic_session_id: string;
  class_id: string;
  term: string;
  // assessment_type: string;
};

type ClassCbtAssessmentTimetablePayloadType = {
  level: string;
  userRole: string;
  assessment_type: string;
  academic_session_id: string;
  class_id: string;
  user_id: mongoose.Types.ObjectId;
  term: string;
  timetable: TimetableArrayType;
};

// type SingleSubjectTimetableDocument = {
//   subject_id: mongoose.Types.ObjectId;
//   // subject_teacher: mongoose.Types.ObjectId;
//   start_time: Date;
//   duration: number;
//   theory_start_time: Date;
//   theory_duration: number;
// };

type ClassCbtAssessmentTimetableDocument = Document & {
  // school: mongoose.Types.ObjectId;
  exam_id: mongoose.Types.ObjectId;
  academic_session_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  term: string;
  is_active: boolean;
  assessment_type: string;
  scheduled_subjects: SingleSubjectTimetableDocument[];
};

type TheoryQuestionDocument = {
  question_number: number;
  question_text: string;
  score: number;
  student_score: number;
};

type ObjQuestionsDocument = TheoryQuestionDocument & {
  _id: mongoose.Types.ObjectId;
  options: string[];
  correct_answer: string;
};

type ShuffledObjQuestionsDocument = Omit<
  TheoryQuestionDocument,
  'question_number'
> & {
  _id: mongoose.Types.ObjectId;
  question_shuffled_number: number;
  question_original_number: number;
  options: string[];
  selected_answer: string;
  correct_answer: string;
};

type ShuffledTheoryQuestionsDocument = TheoryQuestionDocument & {
  selected_answer: string;
};

type SingleSubjectTimetableDocument = {
  subject_id: mongoose.Types.ObjectId;
  // subject_teacher: mongoose.Types.ObjectId;
  start_time: Date;
  duration: number;
  theory_start_time: Date;
  theory_duration: number;
  is_subject_question_set: boolean;
  has_subject_grace_period_ended: boolean;
  exam_subject_status: string;
  authorized_students: mongoose.Types.ObjectId[];
  students_that_have_started: mongoose.Types.ObjectId[];
  students_that_have_submitted: mongoose.Types.ObjectId[];
};

type CbtQuestionDocument = Document & {
  exam_id: mongoose.Types.ObjectId;
  level: string;
  academic_session_id: mongoose.Types.ObjectId;
  allowed_students: mongoose.Types.ObjectId[];
  class_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  obj_questions: ObjQuestionsDocument[];
  obj_start_time: Date;
  // obj_final_cutoff_time: Date;
  // obj_initial_cutoff_time: Date;
  theory_start_time: Date;
  theory_initial_cutoff_time: Date;
  theory_final_cutoff_time: Date;
  obj_total_time_allocated: number;
  theory_total_time_allocated: number;
  theory_questions: TheoryQuestionDocument[];
  teacher_id: mongoose.Types.ObjectId;
  term: string;
  exam_subject_status: string;
};

type CbtResultDocument = Document & {
  // school: mongoose.Types.ObjectId;
  subject_teacher: mongoose.Types.ObjectId;
  exam_id: mongoose.Types.ObjectId;
  level: string;
  academic_session_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  enrolment: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  shuffled_obj_questions: ShuffledObjQuestionsDocument[];
  shuffled_theory_questions: ShuffledTheoryQuestionsDocument[];
  obj_total_time_allocated: number;
  obj_final_cutoff_time: Date;
  obj_trigger_type: string;
  obj_start_time: Date;
  obj_time_left: number;
  obj_started_at: Date;
  obj_submitted_at: Date;
  objective_total_score: number;
  percent_score: number;
  theory_total_score: number;
  total_score: number;
  obj_status: string;
  theory_status: string;
  term: string;
};

type CbtCutoffDocument = Document & {
  // school: mongoose.Types.ObjectId;
  first_cutoff_minutes: number;
  last_cutoff_minutes: number;
};

type CbtCutoffPayload = {
  first_cutoff_minutes: number;
  last_cutoff_minutes: number;
};

type CutoffMinutesCreationPayload = CbtCutoffPayload;

type LogDocument = Document & {
  level: string;
  user_role?: string;
  message: string;
  service: string;
  stack?: string;
  method: string;
  route: string;
  status_code: number;
  user_id?: mongoose.Types.ObjectId;
  school_id?: mongoose.Types.ObjectId;
  ip: string;
  duration_ms: number;
};

type LogPayloadType = {
  level: string;
  message: string;
  user_role?: string;
  service?: string;
  stack?: string;
  method?: string;
  route?: string;
  status_code: number;
  user_id?: mongoose.Types.ObjectId;
  school_id?: mongoose.Types.ObjectId;
  ip: string;
  duration_ms: number;
};

type CbtAssessmentAuthorizationPayloadType = {
  subject_id: string;
  term: string;
  academic_session_id: string;
  class_id: string;
  // assessment_type: string;
  teacher_id: mongoose.Types.ObjectId;
  students_id_array: mongoose.Types.ObjectId[];
};

type CbtAssessmentDocumentPayload = {
  academic_session_id: string;
  term: string;
  // assessment_type: string;
};

type FetchAttendanceType = {
  academic_session_id: string;
  class_id: string;
  teacher_id?: object;
  role?: string;
};

type StudentArrayType = {
  date: Date;
  students: StudentAttendanceArrayType[];
};

type AttendanceMarkingType = {
  attendance_id: string;
  teacher_id: object;
  attendance_array: {
    date: Date;
    students: StudentAttendanceArrayType[];
  };
};

type AttendanceDocument = {
  _id: object;
  class: object;
  class_enrolment: object;
  class_teacher: object;
  session: object;
  first_term_attendance: StudentArrayType[];
  second_term_attendance: StudentArrayType[];
  third_term_attendance: StudentArrayType[];
};

type StudentAttendanceArrayType = {
  status: string;
  student: object;
};

type ClassMapDocType = {
  _id: Types.ObjectId;
  class_teacher?: Types.ObjectId | null;
};

type PaystackPayloadType = {
  reference: string;
  student_id: string;
};

type PaystackSchoolPaymentType = {
  student_id: string;
  student_email: string;
  amount: number;
  session_id: string;
  term: string;
  payment_document_id: object;
};

type ResultCommonJobData = {
  term: string;
  session_id: string;
  teacher_id: string;
  subject_id: string;
  class_enrolment_id: string;
  class_id: string;
  student_id: string;
};

type ResultJobData = ResultCommonJobData & {
  score: number;
  score_name: string;
};

type CbtAssessmentJobData = ResultCommonJobData & {
  resultObj: ExamScoreType;
  exam_component_name: string;
  term_results: SubjectTermResult[];
};

type SubjectPositionAndCumCommon = {
  term: string;
  student_id: string;
  subject_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  class_enrolment_id: mongoose.Types.ObjectId;
  session_id: mongoose.Types.ObjectId;
};

type SubjectPositionJobData = SubjectPositionAndCumCommon & {
  subject_position: string;
  class_highest_mark: number;
  class_lowest_mark: number;
  class_average_mark: number;
};

type SubjectCumScoreJobData = SubjectPositionAndCumCommon & {
  actual_term_result: SubjectTermResult;
};

type SubjectDocument = Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  description: string;
  class_ids: mongoose.Types.ObjectId[];
  teacher_ids: mongoose.Types.ObjectId[];
};

type CreateVirtualAccountType = {
  student_id: string;
  first_name: string;
  last_name: string;
  account_name: string;
  email: string;
  ref: string;
  school_name: string;
  domain_name: string;
};

type GenerateBankReferenceType = {
  student_id: mongoose.Types.ObjectId;
  first_name: string;
  last_name: string;
};

type AccountCreationReturnType = {
  account_number: string;
  account_name: string;
  student_id: string;
  customer_reference: string;
  first_name: string;
  last_name: string;
  email: string;
  ref: string;
};

type StudentAccountDocumentType = {
  account_name: string;
  customer_reference: string;
  our_ref_to_bank: string;
  account_number: string;
  student_id: mongoose.Types.ObjectId;
  account_balance: number;
};

type StudentUpdateDetailsReturnType = UserWithoutPassword & {
  studentAccountDetails: StudentAccountDocumentType;
};

type CreditAccountPayloadType = {
  type: string;
  student_email: string;
  sessionID: string;
  nameEnquiryRef: string;
  beneficiaryAccountName: string;
  beneficiaryAccountNumber: string;
  originatorAccountName: string;
  originatorAccountNumber: string;
  narration: string;
  paymentReference: string;
  status: string;
  amount: string;
  collectionAccountNumber: string;
};

type TransactionDocument = {
  account: string;
  student: string;
  type: 'credit' | 'debit';
  amount: number;
  narration: string;
  merchant_account_credited: string;
  status: 'pending' | 'success' | 'failed';
  payment_reference: string;
  party: {
    name: string;
    account_number: string;
    role: 'sender' | 'beneficiary';
  };
  balance_after: number;
  channel: 'webhook' | 'manual' | 'fee_payment' | 'transfer';
};

type AssignmentCreationPayloadType = {
  subject_id: mongoose.Types.ObjectId;
  class_id: mongoose.Types.ObjectId;
  session_id: mongoose.Types.ObjectId;
  title: string;
  due_date: Date;
  user: mongoose.Types.ObjectId;
  questions_array: QuestionObject[];
};

type QuestionObject = {
  question_number: number;
  question_text: string;
  // attachment: {
  //   url: string;
  //   public_url: string;
  // }
};

type AssignmentDocument = Document & {
  title: string;
  questions: QuestionObject[];
  submission_type: 'file' | 'text' | 'mixed';
  status: 'open' | 'closed';
  due_date: Date;
  subject: string;
  term: string;
  class: mongoose.Types.ObjectId;
  students_that_submits: mongoose.Types.ObjectId[];
  subject_id: mongoose.Types.ObjectId;
  class_enrolment: mongoose.Types.ObjectId;
  teacher_id: mongoose.Types.ObjectId;
  session_id: mongoose.Types.ObjectId;
  attachment?: string; // file URLs (optional)
};

type AnswerSubmissionType = {
  question_number: number;
  text_response: string;
  attachment: {
    url: string;
    public_url: string;
  };
  mark?: number;
};
type SubmissionDocument = Document & {
  assignment_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  answers: AnswerSubmissionType[];
  text_response?: string;
  attachments?: string[];
  submittedAt?: Date;
  graded?: boolean;
  total_score?: number;
  remark?: string;
};

type StudentFeePaymentType = {
  student_id: string;
  session_id: string;
  staff_who_approve?: mongoose.Types.ObjectId;
  term: string;
  amount_paying: number;
  // teller_number?: string;
  bank_name?: string;
  payment_method: string;
  payment_id?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userRole?: string;
};

type StudentFeePaymentTypeWithBursarRole = StudentFeePaymentType & {
  bursarRole: string;
};

type ApproveStudentPayloadType = {
  amount_paid: number;
  // transaction_id: string;
  bank_name: string;
  payment_id: string;
  bursar_id: mongoose.Types.ObjectId;
  bursarRole: string;
};

type WaitingForConfirmationType = {
  amount_paid: number;
  date_paid: Date;
  payment_method: string;
  // transaction_id: string;
  bank_name: string;
  payment_evidence_image: {
    url: string;
    public_url: string;
  };
  // fees_payment_breakdown: FeeBreakdownType[];
  status: string;
  staff_who_approve?: mongoose.Types.ObjectId;
  approved_by_model: string;
  _id: mongoose.Types.ObjectId;
};

type AggregatedPayment = {
  _id: mongoose.Types.ObjectId;
  payment_summary: WaitingForConfirmationType[];
  waiting_for_confirmation: WaitingForConfirmationType[];
  transaction_history: WaitingForConfirmationType[];
  student: UserDocument;
  class: ClassDocument;
};

type ChangeSubjectStartTimeType = {
  timetable_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
  selected_time: Date;
};

type EndSubjectInATimetableType = {
  timetable_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
};

type EffectiveAreasPayloadType = EffectiveAreasValidationType & {
  student_id: string;
  // result_id: string;
  session_id: string;
  term: string;
  userId: mongoose.Types.ObjectId;
};

type EffectiveAreasValidationType = {
  punctuality: string;
  neatness: string;
  politeness: string;
  honesty: string;
  relationshipWithOthers: string;
  leadership: string;
  emotionalStability: string;
  health: string;
  attitudeToSchoolWork: string;
  attentiveness: string;
  perseverance: string;
};

type VacationAndResumptionDatesPayload = {
  date_of_vacation: Date;
  date_of_resumption: Date;
};

type VacationAndResumptionServicePayload = VacationAndResumptionDatesPayload & {
  term_id: string;
  session_id: string;
};

type ManualCbtScoreType = {
  term: string;
  student_id: string;
  session_id: string;
  teacher_id: string;
  score: number;
  subject_id: string;
  key: string;
  class_enrolment_id: string;
  class_id: string;
};

type ManyStudentSubjectResultTotalPayloadType = {
  class_enrolment_id: string;
  subject_id: string;
  userId: mongoose.Types.ObjectId;
  userRole: string;
  class_id: string;
  session_id: string;
};

type GetAssignmentPayloadType = {
  assignment_id: string;
  userId: mongoose.Types.ObjectId;
  userRole: string;
};

type GetAssignmentSubmissionPayloadType = {
  assignment_submission_id: string;
  userId: mongoose.Types.ObjectId;
  userRole: string;
};

type GetAllSubjectPayloadType = {
  subject_id: string;
  session_id: string;
  class_id: string;
  userRole: string;
  userId: mongoose.Types.ObjectId;
};

type EnrolledStudentSubjects = {
  session_id: string;
  class_id: string;
  userId: mongoose.Types.ObjectId;
};

type AnswerSubmissionObject = {
  question_number: number;
  text_response: string;
  attachment?: string;
  mark?: number;
};

type JoiValidateAssignmentSubmissionType = {
  answers_array: AnswerSubmissionObject[];
};

type AssignmentSubmissionType = {
  assignment_id: string;
  answers_array: AnswerSubmissionObject[];
  userId: mongoose.Types.ObjectId;
};

type SubjectAssignmentSubmissionsType = {
  userId: mongoose.Types.ObjectId;
  assignment_id: string;
  page?: number;
  limit?: number;
  searchParams?: string;
};

type StudentSubjectAssignmentSubmissionsType = {
  userId: mongoose.Types.ObjectId;
  subject_id: string;
  page?: number;
  limit?: number;
  searchParams?: string;
};

type FindOneAssignmentPayload = {
  assignment_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  subject_id: mongoose.Types.ObjectId;
};

type AssignmentMarkingPayloadType = {
  assignment_submission_id: string;
  student_id: string;
  submission_doc: SubmissionDocument;
  userId: mongoose.Types.ObjectId;
};

type DeclineStudentPayloadType = {
  payment_id: string;
  student_id: string;
  bursarRole: string;
  bursar_id: mongoose.Types.ObjectId;
};

export {
  AccessModeType,
  AccountCreationReturnType,
  AccountDetailsType,
  AccountObjectType,
  AccountType,
  AddFeeToStudentPaymentDocType,
  AddingFeeToPaymentPayload,
  AddingNegotiatedChargesType,
  AddressValidationType,
  AdmissionValidationType,
  AggregatedPayment,
  AllStudentResultsPayloadType,
  AnswerSubmissionObject,
  AnswerSubmissionType,
  ApproveStudentPayloadType,
  AssessmentDocumentType,
  AssignmentCreationPayloadType,
  AssignmentDocument,
  AssignmentMarkingPayloadType,
  AssignmentSubmissionType,
  AsyncHandler,
  AttendanceDocument,
  AttendanceMarkingType,
  BankApprovalType,
  BankPaymentType,
  BusCategoryType,
  BusFeeValidationType,
  BusPayloadType,
  BusSubscriptionType,
  CashPaymentType,
  CbtAssessmentAuthorizationPayloadType,
  CbtAssessmentDocument,
  CbtAssessmentDocumentArrayType,
  CbtAssessmentDocumentCreationType,
  CbtAssessmentDocumentPayload,
  CbtAssessmentEndedType,
  CbtAssessmentInputFieldsType,
  CbtAssessmentJobData,
  CbtAssessmentResultType,
  CbtAssessmentStartingType,
  CbtAssessmentTimeUpdateType,
  CbtAssessmentUpdateType,
  CbtCutoffDocument,
  CbtCutoffPayload,
  CbtQuestionDocument,
  CbtResultDocument,
  ChangePasswordType,
  ChangeSubjectStartTimeType,
  ClassCbtAssessmentTimetableDocument,
  ClassCbtAssessmentTimetablePayloadType,
  ClassCreationType,
  ClassDocument,
  ClassEnrolmentDocument,
  ClassLevelArrayType,
  ClassLevelCreationPayloadType,
  ClassMapDocType,
  ClassPositionCalType,
  ClassResultsType,
  ClassSubjectFetchPayload,
  ClassSubjectTeacherChangeType,
  ClassTeacherChangeType,
  ClassTeacherManagesPayloadType,
  CloudinaryType,
  CompanyEmailQueue,
  CompanyTokenType,
  ComparePassType,
  ContactUsDocument,
  ContactUsType,
  CreateClassType,
  CreateSubjectType,
  CreateVirtualAccountType,
  CreditAccountPayloadType,
  CumScoreParamType,
  CustomerCreationPayloadType,
  CutoffMinutesCreationPayload,
  DeclineStudentPayloadType,
  EffectiveAreasPayloadType,
  EffectiveAreasValidationType,
  EmailJobData,
  EmailQueue,
  EmailType,
  EndSubjectInATimetableType,
  EnrolledStudentSubjects,
  ExamComponentType,
  ExamScoreType,
  ExcludeParentAndStudent,
  FeatureKeyType,
  FeePayloadType,
  FetchAttendanceType,
  FilePath,
  FindOneAssignmentPayload,
  FolderName,
  GenerateBankReferenceType,
  GetAllSubjectPayloadType,
  GetAssignmentPayloadType,
  GetAssignmentSubmissionPayloadType,
  GetClassCbtAssessmentTimetablePayloadType,
  GetClassPayloadType,
  GetClassStudentsType,
  GetStudentByIdType,
  GetTeacherByIdType,
  GradingAndRemarkType,
  ImageType,
  JoiValidateAssignmentSubmissionType,
  LinkStudentType,
  LogDocument,
  LoginResponseType,
  LogoutPayload,
  LogPayloadType,
  MandatoryFeePayloadType,
  MandatoryFeeProcessingType,
  MandatoryFeeType,
  ManualCbtScoreType,
  ManyStudentSubjectResultTotalPayloadType,
  // CustomRequest,
  MultipleExamScoreParamType,
  MultipleLastCumParamType,
  MultipleResultCreationType,
  MultipleScoreParamType,
  MultipleScoreUpdateParamType,
  NegotiatedFeesType,
  NewDateTimetable,
  NotificationDocument,
  NotificationProp,
  ObjQuestionType,
  OnboardTeacherType,
  OptionalFeeAdditionType,
  OptionalFeePayloadType,
  OptionalFeeProcessingType,
  OptionalFeeType,
  OptionalSubjectProcessingType,
  ParentObjType,
  ParentType,
  PayloadForLoginInput,
  PaymentDataType,
  PaymentDocument,
  PaymentHistoryDataType,
  PaymentHistoryDataTypeFlat,
  PaymentPayloadMandatoryFeeType,
  PaymentPayloadOptionalFeeType,
  PaymentPayloadType,
  PaymentPriorityType,
  PaymentSummaryType,
  PaystackPayloadType,
  PaystackSchoolPaymentType,
  RefreshTokenType,
  RegistrationServiceType,
  ResultCreationType,
  ResultDocument,
  ResultJobData,
  ResultObjType,
  ResultSettingComponentType,
  ResultSettingDocument,
  SchoolAccountType,
  SchoolBusDocument,
  SchoolBusValidationType,
  SchoolCreationPayloadType,
  SchoolCreationValidationType,
  SchoolFeesDocument,
  SchoolType,
  SchoolUserType,
  ScoreAndGradingType,
  ScoreParamType,
  ScorePayload,
  ScoreRecordingParamType,
  ScoreType,
  SessionDocument,
  SessionSubscriptionType,
  SingleStudentScorePayload,
  StudentAccountDocumentType,
  StudentAccountType,
  StudentClassByIdPayloadType,
  StudentClassPayloadType,
  StudentDocument,
  StudentEnrolmentType,
  StudentFeePaymentType,
  StudentFeePaymentTypeWithBursarRole,
  StudentLinkingType,
  StudentNotificationType,
  StudentPaymentHistoryType,
  StudentPopulatedType,
  StudentRegistration,
  StudentResultPopulatedType,
  StudentResultSessionType,
  StudentResultTermType,
  StudentSchoolBusSubType,
  StudentSessionSubscriptionType,
  StudentSpecificResultPayloadType,
  StudentSubjectAssignmentSubmissionsType,
  StudentSubjectPositionType,
  StudentSubjectType,
  StudentUpdateDetailsReturnType,
  StudentUpdateType,
  StudentValidationType,
  StudentWalletObjType,
  StudentWithPaymentType,
  SubjectAdditionType,
  SubjectAssignmentSubmissionsType,
  SubjectCreationType,
  SubjectCumScoreJobData,
  SubjectDocument,
  SubjectFetchingPayload,
  SubjectObjQuestionDocumentCreationType,
  SubjectOfferedType,
  SubjectPopulatedType,
  SubjectPositionJobData,
  SubjectRemovalType,
  SubjectResultDocument,
  SubjectResultProp,
  SubjectResultType,
  SubjectTermResult,
  SubmissionDocument,
  TeacherSubjectType,
  TeacherToSubjectType,
  TeacherValidationType,
  TermCreationType,
  TermDocument,
  TermResult,
  TermSettingsDocument,
  TimetableArrayType,
  TokenType,
  TransactionDocument,
  User,
  UserDocument,
  UserInJwt,
  UserReturn,
  UserWithoutPassword,
  VacationAndResumptionDatesPayload,
  VacationAndResumptionServicePayload,
  VerificationDocument,
  VerificationType,
  VerifyUserType,
  WaitingForConfirmationType,
};
