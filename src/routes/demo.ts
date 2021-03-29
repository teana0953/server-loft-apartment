import express from 'express';
import { Middleware } from '../middlewares';
import { DemoController } from '../../src/controllers';

export const DemoApi = express.Router();

DemoApi.route(`/demo`).post(DemoController.createDemo);

DemoApi.route(`/demo-all`).get(Middleware.checkAuth, Middleware.checkPermission(['user', 'admin']), DemoController.getAllDemos);
