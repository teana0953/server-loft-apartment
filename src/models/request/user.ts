import { checkSchema } from 'express-validator';
import { TValidatorSchema } from '..';
import { Group } from '../db/group';

/**
 *
 */
export interface IUserMe {
    name: string;
}

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
export interface IAddGroup {
    name: string;
    userIds: string[];
}

let addGroup: TValidatorSchema<IAddGroup> = {
    name: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
        },
        custom: {
            options: async (value, { req, location, path }) => {
                // check whether this user already create with this name
                let group = await Group.findOne({ name: value, createdUserId: req.user?._id });
                if (group) {
                    return Promise.reject();
                }
            },
            errorMessage: 'name duplicated',
        },
    },
    userIds: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['userIds can not empty'],
        },
        isArray: {
            options: {
                min: 0,
            },
            errorMessage: ['userIds should be an array'],
        },
        customSanitizer: {
            options: (value: string[]) => {
                // filter repeated id in the Array
                if (!Array.isArray(value)) value = [];
                return value.filter((value, index, array) => array.indexOf(value) === index);
            },
        },
    },
};

export const validateAddGroup = checkSchema(addGroup);
