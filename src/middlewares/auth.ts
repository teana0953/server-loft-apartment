import { ErrorService } from '../helpers';
import { IDB, IJWTDecoded } from '../models';
import { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';
import JWT from 'jsonwebtoken';

/**
 *
 * @param req
 * @param res
 * @param next
 */
export const checkAuth = ErrorService.catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // check token is exist
    let token: string = undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorService.AppError('unauthorized', 401));
    }

    // verify token
    const decoded: IJWTDecoded<IDB.IUserJWTPayload> = (await promisify<string, string>(JWT.verify)(token, process.env.JWT_SECRET)) as any;

    // check user is exist
    const user = await IDB.User.findById(decoded.id).select('+passwordUpdatedAt');
    if (!user) {
        return next(new ErrorService.AppError('invalid token', 401));
    }

    // check
    if (user.isPasswordChanged(decoded.iat)) {
        return next(new ErrorService.AppError('invalid token', 401));
    }

    req.user = user;
    next();
});

/**
 *
 * @param req
 * @param res
 * @param next
 */
export const checkPermission = (roles: IDB.TUserRole[]) => {
    return ErrorService.catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const currentUserRole = req.user.role;

        if (Array.isArray(roles) && roles.length > 0) {
            if (roles.indexOf(currentUserRole) < 0) {
                return next(new ErrorService.AppError('permission denied', 403));
            }
        }

        next();
    });
};
