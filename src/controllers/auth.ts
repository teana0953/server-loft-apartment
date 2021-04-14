import { IDB, IRequest, IResponse, IResponseBase } from '../models';
import { EmailService, ErrorService, GoogleAuthService, PhotoHelper } from '../helpers';
import { Request, Response } from 'express';
import { savePhoto } from './user';
import JWT from 'jsonwebtoken';
import Crypto from 'crypto';
import { LoginTicket } from 'google-auth-library';

export type OutputUserToken = IResponseBase<IResponse.IAuth.ISignup>;

/**
 * Sign up
 */
export type InputSignup = IRequest.IAuth.ISignup;
export type OutputSignup = OutputUserToken;
export const signup = ErrorService.catchAsync(async (req: Request<InputSignup>, res: Response<OutputSignup>) => {
    let input: InputSignup = req.body;

    let photoOriginalUrl: string = undefined;
    let photoUrl: string = undefined;
    if (req.file) {
        photoOriginalUrl = await savePhoto(req.file.buffer, undefined);

        req.file.buffer = await PhotoHelper.resize(req.file.buffer, {
            format: 'jpeg',
            height: 120,
            width: 120,
        });
        photoUrl = await savePhoto(req.file.buffer, undefined);
    }

    // find not register user
    let user = await IDB.User.findOne({ email: input.email, isRegistered: false });
    if (user) {
        user.password = input.password;
        user.passwordConfirm = input.passwordConfirm;
        user.photoUrl = photoUrl;
        user.photoOriginalUrl = photoOriginalUrl;
        user.isRegistered = true;
        user.inviteToken = undefined;

        await user.save();
    } else {
        user = await IDB.User.create({
            name: input.name,
            email: input.email,
            password: input.password,
            passwordConfirm: input.passwordConfirm,
            photoUrl,
            photoOriginalUrl,
            role: input.role,
            isRegistered: true,
        });
    }

    res.json(await getUserWithCookieToken(user, res, req));
});

/**
 * Sign up with token
 */
export type InputSignupWithToken = IRequest.IAuth.ISignupWithToken;
export type OutputSignupWithToken = IResponse.IAuth.ISignupWithToken;
export const signupWithToken = ErrorService.catchAsync(async (req: Request<InputSignupWithToken>, res: Response<OutputSignupWithToken>) => {
    let input: InputSignupWithToken = req.params;

    // find not register user
    const hashedToken: string = Crypto.createHash('sha256').update(input.token).digest('hex');

    let user = await IDB.User.findOne({ inviteToken: hashedToken, isRegistered: false });
    if (user) {
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } else {
        throw new ErrorService.AppError(`token invalid`, 400);
    }
});

/**
 * Sign up Google
 * @description if already exist, will login
 */
export type InputSignupGoogle = IRequest.IAuth.ISignupGoogle;
export type OutputSignupGoogle = OutputUserToken;
export const signupGoogle = ErrorService.catchAsync(async (req: Request<InputSignupGoogle>, res: Response<OutputSignupGoogle>) => {
    let input: InputSignupGoogle = req.body;

    if (!input.googleIdToken) {
        throw new ErrorService.AppError('googleIdToken can not empty', 400);
    }

    // validate and get user info from google token
    let ticket: LoginTicket = undefined;
    let email: string = undefined;
    let name: string = undefined;
    let photoBuffer: Buffer = undefined;
    try {
        ticket = await GoogleAuthService.verify(input.googleIdToken);
        email = ticket.getPayload().email;
        name = ticket.getPayload().name;
        photoBuffer = await GoogleAuthService.getPicture(ticket.getPayload().picture);
    } catch (error) {
        throw new ErrorService.AppError(`google: ${error}`, 400);
    }

    let test = new IDB.User();
    test.name = name;
    test.email = email;
    await test.validate();

    // check whether is created
    let user: IDB.UserDocument = await IDB.User.findOne({ email: email });

    if (!user) {
        let photoOriginalUrl: string = undefined;
        let photoUrl: string = undefined;
        if (photoBuffer) {
            photoOriginalUrl = await savePhoto(photoBuffer, undefined);

            photoBuffer = await PhotoHelper.resize(photoBuffer, {
                format: 'jpeg',
                height: 120,
                width: 120,
            });
            photoUrl = await savePhoto(photoBuffer, undefined);
        }

        user = await IDB.User.create({
            name: name,
            email: email,
            photoUrl,
            photoOriginalUrl,
            role: 'user',
            isRegistered: true,
            isGoogleAuth: true,
        });
    } else {
        if (user.isGoogleAuth === false || user.isRegistered === false) {
            user.isRegistered = true;
            user.isGoogleAuth = true;
            user.inviteToken = undefined;
            await user.save();
        }
    }

    res.json(await getUserWithCookieToken(user, res, req));
});

export const checkAuth = (req: Request, res: Response<IResponseBase>) => {
    res.json({
        status: 'ok',
    });
};

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

    const user = await IDB.User.findOne({ email: input.email, isRegistered: true }).select('+password');
    if (!user) {
        throw new ErrorService.AppError(errorMessage, 401);
    }

    const isMatch = await user.comparePassword(password, user.password);
    if (!isMatch) {
        throw new ErrorService.AppError(errorMessage, 401);
    }

    res.json(await getUserWithCookieToken(user, res, req));
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

    res.json(await getUserWithCookieToken(user, res, req));
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

    res.json(await getUserWithCookieToken(user, res, req));
});

/**
 * Get token
 * @param payload
 * @returns
 */
function getToken(payload: IDB.IUserJWTPayload): string {
    return JWT.sign(payload, process.env.JWT_SECRET, {
        expiresIn: Number(process.env.JWT_COOKIE_EXPIRES_IN_HOUR) + 'h',
    });
}

/**
 * Get user with token
 * @param user
 * @returns
 */
async function getUserWithCookieToken(user: IDB.UserDocument, res: Response<any>, req: Request<any>): Promise<OutputUserToken> {
    const token: string = getToken({
        id: user.id,
    });

    // "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:/Chrome dev session" --args --disable-web-security
    // const allowedOrigins = ['http://localhost:8080'];
    // const origin = req.headers.origin;
    // if (allowedOrigins.indexOf(origin) > -1) {
    //     res.setHeader('Access-Control-Allow-Origin', origin);
    // }
    // res.header('Access-Control-Allow-Credentials', 'true');
    res.cookie('token', token, {
        expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN_HOUR) * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https', // heroku
    });

    return {
        status: 'ok',
        token: token,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            photoUrl: user.photoUrl,
            photoOriginalUrl: user.photoOriginalUrl,
            role: user.role,
        },
    };
}
