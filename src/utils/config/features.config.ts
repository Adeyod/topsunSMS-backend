import { FeatureKey } from "../../constants/types";

export const FEATURES: Record<FeatureKey, {
  name: string;
  dependencies:FeatureKey[];
  subFeatures: Record<string, any>;
}> = {
  feeManagement: {
    name: "Fee Management",
    dependencies: [],
    subFeatures: {},
  },

  paymentManagement: {
    name: "Payment Management",
    dependencies: ["feeManagement"],

    subFeatures: {
      manualPayment: {
        name: "Manual Payment",
      },

      automaticPayment: {
        name: "Automatic Payment",
      },
    },
  },

  cbtManagement: {
    name: "CBT Management",
    dependencies: [],

    subFeatures: {
      assessments: {
        test: {
          name: "Test CBT",
        },
        exam: {
          name: "Exam CBT",
        },
        assignment: {
          name: "Assignment CBT",
        },
      },
    },
  },

  assignmentManagement: {
    name: "Assignment Management",
    dependencies: [],
    subFeatures: {},
  },

  attendanceManagement: {
    name: "Attendance Management",
    dependencies: [],
    subFeatures: {},
  },

  lessonNoteManagement: {
    name: "Lesson Note Management",
    dependencies: [],
    subFeatures: {},
  },
};


/**
 * FEATURES
│
├── Fee Management
│
├── Payment Management
│     ├── Manual Payment
│     └── Automatic Payment
│
├── CBT Management
│     └── Assessments
│           ├── Test
│           ├── Exam
│           └── Assignment
│
├── Assignment Management
├── Attendance Management
└── Lesson Note Management
 */
