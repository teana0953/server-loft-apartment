import express from 'express';
import BodyParser from 'body-parser';
import { Middleware } from '../middlewares';
import { FriendController } from '../controllers';
import { IRequest, validateRequestBase } from '../models';

export const FriendApi = express.Router();

enum ERoute {
    friends = '/friends',
    friend = '/friend',
    deleteFriend = '/friend/:id',
}

FriendApi.route(ERoute.friends).get(Middleware.checkAuth, validateRequestBase, FriendController.getFriends);

FriendApi.route(ERoute.friend).post(Middleware.checkAuth, IRequest.IFriend.validateAddFriend, FriendController.addFriend);

FriendApi.route(ERoute.deleteFriend).delete(Middleware.checkAuth, IRequest.IFriend.validateDeleteFriend, FriendController.deleteFriend);
