import mongoose, { Schema } from 'mongoose';

const adminTokenSchema = new mongoose.Schema(
  {
    admin_id: { type: Schema.Types.ObjectId, ref: 'Admin' },
    role: { type: String, required: true },
    purpose: { type: String, required: true },
    token: { type: String, required: true },
    created_at: {
      type: Date,
      default: Date.now(),
      expires: 1800,
    },
  },
  {
    timestamps: true,
  }
);

const superAdminTokenSchema = new mongoose.Schema(
  {
    super_admin_id: { type: Schema.Types.ObjectId, ref: 'SuperAdmin' },
    role: { type: String, required: true },
    purpose: { type: String, required: true },
    token: { type: String, required: true },
    created_at: {
      type: Date,
      default: Date.now(),
      expires: 3000,
    },
  },
  {
    timestamps: true,
  }
);

const parentTokenSchema = new mongoose.Schema(
  {
    parent_id: { type: Schema.Types.ObjectId, ref: 'Parent' },
    token: { type: String, required: true },
    purpose: { type: String, required: true },
    role: { type: String, required: true },
    created_at: {
      type: Date,
      default: Date.now(),
      expires: 1800,
    },
  },
  {
    timestamps: true,
  }
);

const studentTokenSchema = new mongoose.Schema(
  {
    student_id: { type: Schema.Types.ObjectId, ref: 'Student' },
    token: { type: String, required: true },
    purpose: { type: String, required: true },
    role: { type: String, required: true },
    created_at: {
      type: Date,
      default: Date.now(),
      expires: 1800,
    },
  },
  {
    timestamps: true,
  }
);

const teacherTokenSchema = new mongoose.Schema(
  {
    teacher_id: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    token: { type: String, required: true },
    purpose: { type: String, required: true },
    role: { type: String, required: true },
    created_at: {
      type: Date,
      default: Date.now(),
      expires: 1800,
    },
  },
  {
    timestamps: true,
  }
);

const AdminToken = mongoose.model('AdminToken', adminTokenSchema);
const SuperAdminToken = mongoose.model(
  'SuperAdminToken',
  superAdminTokenSchema
);

const ParentToken = mongoose.model('ParentToken', parentTokenSchema);
const StudentToken = mongoose.model('StudentToken', studentTokenSchema);
const TeacherToken = mongoose.model('TeacherToken', teacherTokenSchema);

export {
  AdminToken,
  ParentToken,
  StudentToken,
  SuperAdminToken,
  TeacherToken
};

