import Multer from 'multer';
import Sharp from 'sharp';
import { ErrorService } from '../helpers';

const MulterStorage = Multer.memoryStorage();

const uploadPhoto = Multer({
    storage: MulterStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new ErrorService.AppError('not image', 400));
        }
    },
});

/**
 *
 * @param fieldName
 * @returns
 */
export const uploadSinglePhoto = (fieldName: string) => {
    return uploadPhoto.single(fieldName);
};
