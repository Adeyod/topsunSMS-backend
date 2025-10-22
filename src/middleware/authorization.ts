import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app.error';
import Admin from '../models/admin.model';
import SuperAdmin from '../models/super_admin.model';
import Parent from '../models/parents.model';
import Student from '../models/students.model';
import Teacher from '../models/teachers.model';

const permission = (
  requiredRoles: Array<
    'admin' | 'student' | 'teacher' | 'parent' | 'super_admin'
  >
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not authenticated.', 401));
      }

      const roleModels: Record<string, any> = {
        admin: Admin,
        super_admin: SuperAdmin,
        parent: Parent,
        student: Student,
        teacher: Teacher,
      };

      const userId = req.user.userId;
      const userRole = req.user.userRole;

      const model = roleModels[userRole];

      if (!model) {
        throw new Error('Invalid role');
      }

      const user = await model.findOne({
        _id: userId,
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const hasRole = requiredRoles.includes(user.role);

      if (!hasRole) {
        return next(
          new AppError('You are not authorized to view this resource.', 403)
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// const checkFeatureAccessForSchool = (featurePath: string) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const school_id = req.user?.school_id;
//     const access = await SchoolFeature.findOne({
//       school: school_id,
//       [`features.${featurePath}`]: true,
//     });

//     if (!access) {
//       throw new AppError('You do not have access to this resource.', 400);
//     }

//     next();
//   };
// };

export { permission };
