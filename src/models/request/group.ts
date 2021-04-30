import { checkSchema } from 'express-validator';
import { TValidatorSchema } from '..';
import { Group } from '../db/group';

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
                    return false;
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

export const validateAddFriend = checkSchema(addGroup);
