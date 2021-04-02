import { IDB } from "..";

export interface ISignup {
    name: string;
    email: string;
    photo?: string;
    password: string;
    passwordConfirm: string;
    role?: IDB.TUserRole;
}

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
