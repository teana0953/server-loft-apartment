import { query, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import FileType from 'file-type';
import { ErrorService, FileMongoHelper, QueryHelper, MongoDBService } from '../helpers';

type OutputGet = Buffer;
export const getFile = ErrorService.catchAsync(async (req: Request, res: Response<OutputGet>) => {
    let routing = req.params.routing;
    let id = req.params.id;

    let file: FileMongoHelper.IFile = await FileMongoHelper.getFileBySrc(`file/${routing}/${id}`);

    if (!file) {
        throw new ErrorService.AppError('file not found', 400);
    }

    let fileType = await FileType.fromBuffer(file.binary.buffer);
    res.contentType(fileType.mime);
    res.send(file.binary.buffer);
});
