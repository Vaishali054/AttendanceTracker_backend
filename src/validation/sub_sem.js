const z = require('zod');

const subjectSchema = z.object({
  subjectName: z.string().min(3, 'Subject name must be at least 3 characters long').max(50, 'Subject name can\'t exceed 50 characters'),
  totalClasses: z.number().int().default(0),
});

const semSchema = z.object({
  Sem: z.number().int().positive('Semester should be a positive integer').min(1, 'Semester should be greater than or equal to 1'),
});

const branchSchema = z.object({
  Branch: z.string().min(3, 'Branch name must be at least 3 characters long').max(50, 'Branch name can\'t exceed 50 characters'),
});

module.exports = {
  subjectSchema,
  semSchema,
  branchSchema,
};
