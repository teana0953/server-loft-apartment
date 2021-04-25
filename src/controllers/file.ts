import { Request, Response } from 'express';
import { Controller } from '.';
import FileType from 'file-type';
import { ErrorService, FileMongoHelper } from '../helpers';

type OutputGet = Buffer;
export const getFile = new Controller<any, OutputGet>(async (req, res) => {
    let routing = req.params.routing;
    let id = req.params.id;

    let file: FileMongoHelper.IFile = await FileMongoHelper.getFileBySrc(`file/${routing}/${id}`);

    if (!file) {
        throw new ErrorService.AppError('file not found', 400);
    }

    let fileType = await FileType.fromBuffer(file.binary.buffer);
    res.contentType(fileType.mime);
    res.send(file.binary.buffer);
}).func;
