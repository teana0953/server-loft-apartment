import express from 'express';
import BodyParser from 'body-parser';
import { Middleware } from '../middlewares';
import { UserController } from '../controllers';
import { IRequest } from '../models';

export const UserApi = express.Router();

UserApi.route(`/user/update-me`).put(
    Middleware.checkAuth,
    BodyParser.json({
        limit: '10mb',
    }),
    Middleware.uploadSinglePhoto('photo'),
    UserController.updateMe,
);

UserApi.put('/user/add-friend', Middleware.checkAuth, IRequest.IUser.validateAddFriend, UserController.addFriend);
