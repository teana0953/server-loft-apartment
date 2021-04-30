import express from 'express';
import { Middleware } from '../middlewares';
import { GroupController } from '../controllers';
import { IRequest, validateRequestBase } from '../models';

export const GroupApi = express.Router();

enum ERoute {
    getGroups = '/groups',
    addGroup = '/group',
    updateGroup = '/group',
    deleteGroup = '/group/:id',
}

/// groups
GroupApi.route(ERoute.getGroups).get(Middleware.checkAuth, validateRequestBase, GroupController.getGroups);

GroupApi.route(ERoute.addGroup).post(Middleware.checkAuth, IRequest.IGroup.validateAddGroup, GroupController.addGroup);

GroupApi.route(ERoute.updateGroup).put(Middleware.checkAuth, IRequest.IGroup.validateUpdateGroup, GroupController.updateGroup);

GroupApi.route(ERoute.deleteGroup).delete(Middleware.checkAuth, IRequest.IGroup.validateDeleteGroup, GroupController.deleteGroup);
