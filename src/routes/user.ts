import express from 'express';
import BodyParser from 'body-parser';
import { Middleware } from '../middlewares';
import { UserController } from '../controllers';
import { IRequest, validateRequestBase } from '../models';

export const UserApi = express.Router();

UserApi.route(`/user/update-me`).put(
    Middleware.checkAuth,
    BodyParser.json({
        limit: '10mb',
    }),
    Middleware.uploadSinglePhoto('photo'),
    UserController.updateMe,
);

/// friends
UserApi.route('/user/friends').get(Middleware.checkAuth, validateRequestBase, UserController.getFriends);

UserApi.route('/user/add-friend').put(Middleware.checkAuth, IRequest.IUser.validateAddFriend, UserController.addFriend);
