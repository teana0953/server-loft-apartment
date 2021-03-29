import { IDB, IRequest, IResponse, IResponseBase } from '../models';
import { EmailService, ErrorService } from '../helpers';
import { CookieOptions, Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import Crypto from 'crypto';

export type OutputUserToken = IResponseBase<IResponse.IAuth.ISignup>;

/**
 * Sign up
 */
export type InputSignup = IRequest.IAuth.ISignup;
export type OutputSignup = OutputUserToken;
export const signup = ErrorService.catchAsync(async (req: Request<InputSignup>, res: Response<OutputSignup>) => {
    let input: InputSignup = req.body;

    const newUser = await IDB.User.create({
        name: input.name,
        email: input.email,
        password: input.password,
        passwordConfirm: input.passwordConfirm,
        photo: input.photo,
        role: input.role,
    });

    res.json(getUserWithCookieToken(newUser, res));
});

/**
 * Login
 */
export type InputLogin = IRequest.IAuth.ILogin;
export type OutputLogin = OutputUserToken;
export const login = ErrorService.catchAsync(async (req: Request<InputLogin>, res: Response<OutputLogin>) => {
    let input: InputLogin = req.body;

    const errorMessage: string = 'invalid email or password';
    const { email, password } = input;

    if (!email || !password) {
        throw new ErrorService.AppError('email or password can not empty', 400);
    }

    const user = await IDB.User.findOne({ email: input.email }).select('+password');
    if (!user) {
        throw new ErrorService.AppError(errorMessage, 401);
    }

    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
        throw new ErrorService.AppError(errorMessage, 401);
    }

    res.json(getUserWithCookieToken(user, res));
});

/**
 * Logout
 */
export type OutputLogout = Date;
export const logout = ErrorService.catchAsync(async (req: Request, res: Response<OutputLogout>) => {
    const user = await IDB.User.findById(req.user?.id);
    if (!user) {
        throw new ErrorService.AppError('invalid', 401);
    }

    res.cookie('token', null, { expires: new Date() });

    res.send(new Date());
});

/**
 * Forgot password
 */
export type InputForgotPassword = IRequest.IAuth.IForgotPassword;
export type OutputForgotPassword = IResponseBase;
export const forgotPassword = ErrorService.catchAsync(async (req: Request<InputForgotPassword>, res: Response<OutputForgotPassword>) => {
    let input: InputForgotPassword = req.body;

    const { email } = input;

    if (!email) {
        throw new ErrorService.AppError('email can not empty', 400);
    }

    const user = await IDB.User.findOne({ email: input.email });
    if (!user) {
        throw new ErrorService.AppError('no user with this email', 401);
    }

    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
        const resetUrl: string = `${req.protocol}}://${req.get('host')}${process.env.API_BASE}/reset-password/${resetToken}`;
        const message: string = `
        <h3>Forgot your password? Please visit this link:</h3>
        <a href="${resetUrl}">${resetUrl}</a>
        <h3>If you didn't forget your password, please ignore this email.</h3>
        `;

        await EmailService.sendEmail({
            to: input.email,
            subject: 'password reset token (valid for 10 min)',
            html: message,
        });

        res.json({
            status: 'ok',
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpiresTimestamp = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ErrorService.AppError('there was an error sending the email.', 500);
    }
});

/**
 * Reset password
 */
export type InputResetPassword = IRequest.IAuth.IResetPassword;
export type OutputResetPassword = OutputUserToken;
export const resetPassword = ErrorService.catchAsync(async (req: Request<InputResetPassword>, res: Response<OutputResetPassword>) => {
    let input: InputResetPassword = req.body;
    input.token = req.params?.token;

    if (!input.token) {
        throw new ErrorService.AppError('token can not empty', 400);
    }

    const hashedToken: string = Crypto.createHash('sha256').update(input.token).digest('hex');

    const user = await IDB.User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiresTimestamp: {
            $gt: Date.now(),
        },
    });

    if (!user) {
        throw new ErrorService.AppError('token is invalid or exipred', 400);
    }

    user.password = input.password;
    user.passwordConfirm = input.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresTimestamp = undefined;
    await user.save();

    res.json(getUserWithCookieToken(user, res));
});

/**
 * Update password
 */
export type InputUpdatePassword = IRequest.IAuth.IUpdatePassword;
export type OutputUpdatePassword = OutputUserToken;
export const updatePassword = ErrorService.catchAsync(async (req: Request<InputUpdatePassword>, res: Response<OutputUpdatePassword>) => {
    let input: InputUpdatePassword = req.body;

    const user = await IDB.User.findById(req.user?.id).select('+password');

    if (!(await user.comparePassword(input.passwordCurrent, user.password))) {
        throw new ErrorService.AppError('your current password is wrong', 401);
    }

    user.password = input.password;
    user.passwordConfirm = input.passwordConfirm;
    await user.save();

    res.json(getUserWithCookieToken(user, res));
});

/**
 * Get token
 * @param payload
 * @returns
 */
function getToken(payload: IDB.IUserJWTPayload): string {
    return JWT.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_COOKIE_EXPIRES_IN_HOUR + 'h',
    });
}

/**
 * Get user with token
 * @param user
 * @returns
 */
function getUserWithCookieToken(user: IDB.UserDocument, res: Response): OutputUserToken {
    const token: string = getToken({
        id: user.id,
    });

    const cookieOptions: CookieOptions = {
        expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN_HOUR) * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('token', token, cookieOptions);

    return {
        status: 'ok',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            photo: user.photo,
            role: user.role,
        },
    };
}
