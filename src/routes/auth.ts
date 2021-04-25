import express from 'express';
import BodyParser from 'body-parser';
import { AuthController } from '../controllers';
import { Middleware } from '../middlewares';
import { IRequest } from '../models';

export const AuthApi = express.Router();

enum ERoute {
    signupWithToken = '/signup/:token',
    signup = '/signup',
    signupGoogle = '/signup-google',
    checkAuth = '/check-auth',
    login = '/login',
    logout = '/logout',
    forgotPassword = '/forgot-password',
    resetPassword = '/reset-password/:token',
    updateMyPassword = '/update-my-password',
}

AuthApi.route(ERoute.signupWithToken).get(IRequest.IAuth.validateSignupWithToken, AuthController.signupWithToken);

AuthApi.route(ERoute.signup).post(
    BodyParser.json({
        limit: '10mb',
    }),
    Middleware.uploadSinglePhoto('photo'),
    AuthController.signup,
);

AuthApi.route(ERoute.signupGoogle).post(AuthController.signupGoogle);

AuthApi.route(ERoute.checkAuth).get(Middleware.checkAuth, AuthController.checkAuth);

AuthApi.route(ERoute.login).post(AuthController.login);

AuthApi.route(ERoute.logout).get(Middleware.checkAuth, AuthController.logout);

AuthApi.route(ERoute.forgotPassword).post(AuthController.forgotPassword);

AuthApi.route(ERoute.resetPassword).put(AuthController.resetPassword);

AuthApi.route(ERoute.updateMyPassword).put(Middleware.checkAuth, AuthController.updatePassword);
