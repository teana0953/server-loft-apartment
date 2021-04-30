import express from 'express';
import { Middleware } from '../middlewares';
import { GroupController } from '../controllers';
import { IRequest, validateRequestBase } from '../models';

export const GroupApi = express.Router();

enum ERoute {
    groups = '/groups',
    group = '/group',
    deleteGroup = '/group/:id',
}

/// groups
GroupApi.route(ERoute.groups).get(Middleware.checkAuth, validateRequestBase, GroupController.getGroups);

GroupApi.route(ERoute.group).post(Middleware.checkAuth, IRequest.IGroup.validateAddGroup, GroupController.addGroup);

GroupApi.route(ERoute.group).put(Middleware.checkAuth, IRequest.IGroup.validateUpdateGroup, GroupController.updateGroup);

GroupApi.route(ERoute.deleteGroup).delete(Middleware.checkAuth, IRequest.IGroup.validateDeleteGroup, GroupController.deleteGroup);
