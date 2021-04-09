import e, { Request, Response } from 'express';
import { IDB, IResponse, IRequest, IResponseBase, IRequestBase } from '../models';
import { ErrorService, FileMongoHelper, MongoDBService, PhotoHelper, QueryHelper } from '../helpers';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { validationResult } from 'express-validator';
import ActionEmail from '../action/email';

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
export type OutputAddFriend = IResponseBase<IResponse.IUser.IFriend>;
export const addFriend = ErrorService.catchAsync(async (req: Request<InputAddFriend>, res: Response<OutputAddFriend>) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input: InputAddFriend = req.body;
    let user = req.user;

    let friend = await IDB.User.findOne({ email: input.email });
    if (!!friend) {
        if (!checkFriendIsExist(friend.id, user.friends)) {
            user.friends.push({
                id: friend.id,
            });
            await user.save({ validateBeforeSave: false });
        }

        if (!checkFriendIsExist(user.id, friend.friends)) {
            friend.friends.push({
                id: user.id,
            });
        }
    } else {
        // if not exist, create user
        friend = new IDB.User();
        friend.name = input.name || input.email.split('@')[0];
        friend.email = input.email;
        friend.isRegistered = false;
        friend.isGoogleAuth = false;
        friend.friends = [
            {
                id: user.id,
            },
        ];

        // TODO send invited email
        ActionEmail.action$.next({
            to: [input.email],
            subject: '<No Reply> Invite you to join loft-apartment',
            html: `
            <h1>Welcome to join loft-apartment</h1>
            `,
        });

        let result = await friend.save();
        user.friends.push({
            id: result.id,
        });
        await user.save({ validateBeforeSave: false });
    }

    res.json({
        status: 'ok',
        data: {
            id: friend.id,
            name: friend.name,
            email: friend.email,
            photoUrl: friend.photoUrl,
        },
    });
});

/**
 * Get friend
 */
export type InputGetFriend = IRequestBase;
export type OutputGetFriend = IResponseBase<IResponse.IUser.IFriend[]>;
export const getFriends = ErrorService.catchAsync(async (req: Request<InputGetFriend>, res: Response<OutputGetFriend>) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input: InputGetFriend = req.params;
    let user = req.user;
    let friendIds = user.friends.map((item) => new ObjectId(item.id));

    let oriQuery = IDB.User.find({ _id: { $in: friendIds } });
    let queryService = await new QueryHelper<IDB.UserDocument[], IDB.UserDocument>(IDB.User.find({ _id: { $in: friendIds } }), req.query);
    let total: number = await oriQuery.countDocuments();

    queryService = queryService //
        .sort()
        .paginate();

    let result = await queryService.query;

    res.json({
        status: 'ok',
        total: total,
        page: queryService.page,
        limit: queryService.limit,
        data: result.map((item) => {
            return {
                id: item.id,
                name: item.name,
                email: item.email,
                photoUrl: item.photoUrl,
            };
        }),
    });
});

function checkFriendIsExist(userId: string, friends: IDB.IUserFriend[]): boolean {
    return friends.findIndex((item) => item.id === userId) > -1;
}
