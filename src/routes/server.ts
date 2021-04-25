import express from 'express';
import { ServerController } from '../../src/controllers';

export const ServerApi = express.Router();

enum ERoute {
    getServerInfo = '/about',
}

ServerApi.route(ERoute.getServerInfo).get(ServerController.getServerInfo);
