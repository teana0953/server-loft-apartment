import express from 'express';
import { Middleware } from '../middlewares';
import { FileController } from '../../src/controllers';

export const FileApi = express.Router();

FileApi.route(`/file/:routing/:id`).get(FileController.getFile);
