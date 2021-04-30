import express from 'express';
import BodyParser from 'body-parser';
import { Middleware } from '../middlewares';
import { UserController } from '../controllers';

export const UserApi = express.Router();

enum ERoute {
    updateMe = '/user/update-me',
}

UserApi.route(ERoute.updateMe).put(
    Middleware.checkAuth,
    BodyParser.json({
        limit: '10mb',
    }),
    Middleware.uploadSinglePhoto('photo'),
    UserController.updateMe,
);
