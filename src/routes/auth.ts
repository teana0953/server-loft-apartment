import express from 'express';
import BodyParser from 'body-parser';
import { AuthController } from '../controllers';
import { Middleware } from '../middlewares';
import { IRequest } from '../models';

export const AuthApi = express.Router();

AuthApi.route(`/signup/:token`).get(IRequest.IAuth.validateSignupWithToken, AuthController.signupWithToken);

AuthApi.route(`/signup`).post(
    BodyParser.json({
        limit: '10mb',
    }),
    Middleware.uploadSinglePhoto('photo'),
    AuthController.signup,
);

AuthApi.route(`/signup-google`).post(AuthController.signupGoogle);

AuthApi.route('/check-auth').get(Middleware.checkAuth, AuthController.checkAuth);

AuthApi.route(`/login`).post(AuthController.login);

AuthApi.route(`/logout`).get(Middleware.checkAuth, AuthController.logout);

AuthApi.route(`/forgot-password`).post(AuthController.forgotPassword);

AuthApi.route(`/reset-password/:token`).put(AuthController.resetPassword);

AuthApi.route(`/update-my-password`).put(Middleware.checkAuth, AuthController.updatePassword);
