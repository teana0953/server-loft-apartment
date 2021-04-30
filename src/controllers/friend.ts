import { Controller } from '.';
import { IDB, IResponse, IRequest, IResponseBase, IRequestBase } from '../models';
import { ErrorService, QueryHelper } from '../helpers';
import { ObjectId } from 'mongodb';
import { validationResult } from 'express-validator';
import ActionEmail from '../action/email';
import Crypto from 'crypto';

export { addFriend, getFriends, deleteFriend };

/**
 * Add friend
 */
type InputAddFriend = IRequest.IFriend.IAddFriend;
type OutputAddFriend = IResponseBase<IResponse.IAuth.ISignup>;
const addFriend = new Controller<InputAddFriend, OutputAddFriend>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input = req.body;
    let user = req.user;

    // can not add self
    if (user.email === input.email) {
        throw new ErrorService.AppError('can not add self', 400);
    }

    let friend = await IDB.User.findOne({
        email: input.email,
    });
    if (!!friend) {
        if (!checkFriendIsExist(friend.id, user.friends)) {
            user.friends.push({
                id: friend.id,
            });
            await user.save({ validateBeforeSave: false });
        } else {
            throw new ErrorService.AppError(`friend is already added`, 400);
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
        let token = Crypto.randomBytes(32).toString('hex');

        let userToken = Crypto.createHash('sha256') //
            .update(token)
            .digest('hex');
        friend.inviteToken = userToken;

        const inviteUrl: string = `${req.get('Origin')}/signup/${token}`;
        ActionEmail.action$.next({
            to: [input.email],
            subject: '<No Reply> Invite you to join loft-apartment',
            html: `
            <h1>Welcome to join loft-apartment</h1>
            <a href="${inviteUrl}">${inviteUrl}</a>
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
            id: user.id,
            name: user.name,
            email: user.email,
            friends: user.friends,
            groups: user.groups,
            photoUrl: user.photoUrl,
            photoOriginalUrl: user.photoOriginalUrl,
            role: user.role,
        },
    });
}).func;

/**
 * Get friend
 */
type InputGetFriend = IRequestBase;
type OutputGetFriend = IResponseBase<IResponse.IUser.IFriend[]>;
const getFriends = new Controller<InputGetFriend, OutputGetFriend>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input = req.params;
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
}).func;

/**
 * Delete Friend
 */
type InputDeleteFriend = IRequest.IFriend.IDeleteFriend;
type OutpuDeleteFriend = IResponseBase<IResponse.IAuth.ISignup>;
const deleteFriend = new Controller<InputDeleteFriend, OutpuDeleteFriend>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input = req.params;
    let user = req.user;
    let index = user.friends.findIndex((item) => item.id === input.id);
    if (index > -1) {
        user.friends.splice(index, 1);
        await user.save({ validateBeforeSave: false });
    }

    let friend = await IDB.User.findOne({ _id: new ObjectId(input.id) });
    index = friend.friends.findIndex((item) => item.id === user.id);
    if (index > -1) {
        friend.friends.splice(index, 1);
        await friend.save({ validateBeforeSave: false });
    }

    res.json({
        status: 'ok',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            friends: user.friends,
            groups: user.groups,
            photoUrl: user.photoUrl,
            photoOriginalUrl: user.photoOriginalUrl,
            role: user.role,
        },
    });
}).func;

/**
 * check friend is exist
 * @param userId
 * @param friends
 * @returns
 */
function checkFriendIsExist(userId: string, friends: IDB.IUserFriend[]): boolean {
    return friends.findIndex((item) => item.id === userId) > -1;
}
