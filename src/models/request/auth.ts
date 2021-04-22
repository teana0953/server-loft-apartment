import { checkSchema } from 'express-validator';
import { IDB, TValidatorSchema } from '..';

export interface ISignup {
    name: string;
    email: string;
    photo?: string;
    password: string;
    passwordConfirm: string;
    role?: IDB.TUserRole;
}

export interface ISignupWithToken {
    token: string;
}
let signupWithToken: TValidatorSchema<ISignupWithToken> = {
    token: {
        in: ['params'],
        exists: {
            options: {
                checkNull: true,
            },
        },
        errorMessage: 'token is required',
    },
};
export const validateSignupWithToken = checkSchema(signupWithToken);

export interface ISignupGoogle {
    googleIdToken: string;
}

export interface ILogin {
    email: string;
    password: string;
}

export interface IForgotPassword {
    email: string;
}

export interface IResetPassword {
    token: string;
    password: string;
    passwordConfirm: string;
}

export interface IUpdatePassword {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
}
