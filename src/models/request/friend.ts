import { checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';
import { TValidatorSchema } from '..';
import { User } from '../db/user';

/**
 *
 */
export interface IAddFriend {
    name?: string;
    email: string;
}

let addFriend: TValidatorSchema<IAddFriend> = {
    email: {
        in: ['body'],
        isEmail: {
            bail: true,
        },
        normalizeEmail: {
            options: {
                all_lowercase: true,
            },
        },
        errorMessage: 'email format invalid',
    },
    name: {},
};

export const validateAddFriend = checkSchema(addFriend);

/**
 *
 */
export interface IDeleteFriend {
    id: string;
}

let deleteFriend: TValidatorSchema<IDeleteFriend> = {
    id: {
        in: ['params'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['id can not empty'],
        },
        custom: {
            options: async (value, { req, location, path }) => {
                // check whether this user already create with this name
                let friend = await User.findOne({
                    _id: new ObjectId(req.params?.id),
                });
                if (!friend) {
                    return Promise.reject();
                }
            },
            errorMessage: 'friend not exist',
        },
    },
};

export const validateDeleteFriend = checkSchema(deleteFriend);
