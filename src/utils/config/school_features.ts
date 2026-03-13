export const schoolFeatures = {
  feeManagement: true,

  paymentManagement: {
    enabled: true,
    mode: "manual",
  },

  cbtManagement: {
    enabled: true,
    assessments: {
      test: true,
      exam: true,
      assignment: false,
    },
  },

  assignmentManagement: true,
  attendanceManagement: true,
  lessonNoteManagement: false,
};
