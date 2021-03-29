import express from 'express';
import { ServerController } from '../../src/controllers';

export const ServerApi = express.Router();

ServerApi.route(`/about`).get(ServerController.getServerInfo);
