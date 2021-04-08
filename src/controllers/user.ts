import e, { Request, Response } from 'express';
import { IDB, IResponse, IRequest, IResponseBase } from '../models';
import { ErrorService, FileMongoHelper, MongoDBService, PhotoHelper } from '../helpers';
import { UpdateQuery } from 'mongoose';
import { validationResult } from 'express-validator';

const UserPhotoCollectionName = 'FileUserPhoto';

/**
 * Update me
 */
export type InputUpdateMe = IRequest.IUser.IUserMe;
export type OutputUpdateMe = IResponseBase<IResponse.IAuth.ISignup>;
export const updateMe = ErrorService.catchAsync(async (req: Request<InputUpdateMe>, res: Response<OutputUpdateMe>) => {
    let input: InputUpdateMe = req.body;

    let updateQuery: UpdateQuery<IDB.UserDocument> = {
        name: input.name,
    };

    let photoOriginalUrl: string = undefined;
    let photoUrl: string = undefined;
    if (req.file) {
        photoOriginalUrl = await savePhoto(req.file.buffer, req.user.photoOriginalUrl);

        req.file.buffer = await PhotoHelper.resize(req.file.buffer, {
            format: 'jpeg',
            height: 120,
            width: 120,
        });
        photoUrl = await savePhoto(req.file.buffer, req.user.photoUrl);

        updateQuery = {
            ...updateQuery,
            photoUrl: photoUrl,
            photoOriginalUrl: photoOriginalUrl,
        };
    }

    let user = await IDB.User.findByIdAndUpdate(req.user.id, updateQuery, {
        new: true,
        runValidators: true,
    });

    res.json({
        status: 'ok',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            photoUrl: user.photoUrl,
            photoOriginalUrl: user.photoOriginalUrl,
        },
    });
});

/**
 * save photo
 * @param buffer
 * @param url
 * @returns
 */
export async function savePhoto(buffer: Buffer, url: string): Promise<string> {
    let photoId: string = undefined;
    if (url) {
        photoId = (await FileMongoHelper.parseSrc(url)).id;
    }

    return await FileMongoHelper.saveFile(buffer, UserPhotoCollectionName, photoId);
}

/**
 * Add friend
 */
export type InputAddFriend = IRequest.IUser.IAddFriend;
export type OutputAddFriend = IResponseBase;
export const addFriend = ErrorService.catchAsync(async (req: Request<InputAddFriend>, res: Response<OutputAddFriend>) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input: InputAddFriend = req.body;
    let user = req.user;

    let friend = await IDB.User.findOne({ email: input.email });
    if (!!friend) {
        if (user.friends.indexOf(friend.id) < 0) {
            user.friends.push({
                id: friend.id,
            });
            await user.save({ validateBeforeSave: false });
        }
    } else {
        // if not exist, create user
        let newUser = new IDB.User();
        newUser.name = input.name || input.email.split('@')[0];
        newUser.email = input.email;
        newUser.isRegistered = false;
        newUser.isGoogleAuth = false;
        newUser.friends = [
            {
                id: user.id,
            },
        ];

        let result = await newUser.save({ validateBeforeSave: false });
        user.friends.push({
            id: result.id,
        });
        await user.save({ validateBeforeSave: false });
    }

    res.json({
        status: 'ok',
    });
});
