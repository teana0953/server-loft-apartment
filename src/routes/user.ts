import express from 'express';
import BodyParser from 'body-parser';
import { Middleware } from '../middlewares';
import { UserController } from '../controllers';
import { IRequest, validateRequestBase } from '../models';

export const UserApi = express.Router();

UserApi.put(
    `/user/update-me`,
    Middleware.checkAuth,
    BodyParser.json({
        limit: '10mb',
    }),
    Middleware.uploadSinglePhoto('photo'),
    UserController.updateMe,
);

/// friends
UserApi.get('/user/friends', Middleware.checkAuth, validateRequestBase, UserController.getFriends);

UserApi.put('/user/add-friend', Middleware.checkAuth, IRequest.IUser.validateAddFriend, UserController.addFriend);
