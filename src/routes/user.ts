import express from 'express';
import BodyParser from 'body-parser';
import { Middleware } from '../middlewares';
import { UserController } from '../controllers';
import { IRequest, validateRequestBase } from '../models';

export const UserApi = express.Router();

enum ERoute {
    updateMe = '/user/update-me',
    getFriends = '/user/friends',
    addFriend = '/user/add-friend',
    getGroups = '/user/groups',
    addGroup = '/user/add-group',
    updateGroup = '/user/update-group',
    deleteGroup = '/user/delete-group/:id',
}

UserApi.route(ERoute.updateMe).put(
    Middleware.checkAuth,
    BodyParser.json({
        limit: '10mb',
    }),
    Middleware.uploadSinglePhoto('photo'),
    UserController.updateMe,
);

/// friends
UserApi.route(ERoute.getFriends).get(Middleware.checkAuth, validateRequestBase, UserController.getFriends);

UserApi.route(ERoute.addFriend).put(Middleware.checkAuth, IRequest.IUser.validateAddFriend, UserController.addFriend);

/// groups
UserApi.route(ERoute.getGroups).get(Middleware.checkAuth, validateRequestBase, UserController.getGroups);

UserApi.route(ERoute.addGroup).put(Middleware.checkAuth, IRequest.IUser.validateAddGroup, UserController.addGroup);

UserApi.route(ERoute.updateGroup).put(Middleware.checkAuth, IRequest.IUser.validateUpdateGroup, UserController.updateGroup);

UserApi.route(ERoute.deleteGroup).delete(Middleware.checkAuth, IRequest.IUser.validateDeleteGroup, UserController.deleteGroup);
