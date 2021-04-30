import express from 'express';
import BodyParser from 'body-parser';
import { Middleware } from '../middlewares';
import { FriendController } from '../controllers';
import { IRequest, validateRequestBase } from '../models';

export const FriendApi = express.Router();

enum ERoute {
    getFriends = '/friends',
    addFriend = '/friend',
}

FriendApi.route(ERoute.getFriends).get(Middleware.checkAuth, validateRequestBase, FriendController.getFriends);

FriendApi.route(ERoute.addFriend).post(Middleware.checkAuth, IRequest.IFriend.validateAddFriend, FriendController.addFriend);
