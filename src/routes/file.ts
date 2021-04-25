import express from 'express';
import { Middleware } from '../middlewares';
import { FileController } from '../../src/controllers';

export const FileApi = express.Router();

enum ERoute {
    getFile = '/file/:routing/:id',
}

FileApi.route(ERoute.getFile).get(FileController.getFile);
