import { checkSchema } from 'express-validator';
import { TValidatorSchema } from '..';
import { Group } from '../db/group';
import { ObjectId } from 'mongodb';

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
            options: (value: string[], { req }) => {
                // filter repeated id in the Array
                if (!Array.isArray(value)) value = [];
                value.push(req.user.id);
                return value.filter((value, index, array) => array.indexOf(value) === index);
            },
        },
    },
};

export const validateAddGroup = checkSchema(addGroup);

/**
 *
 */
export interface IUpdateGroup {
    id: string;
    name: string;
    userIds: string[];
}

let updateGroup: TValidatorSchema<IUpdateGroup> = {
    id: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['id can not empty'],
        },
        custom: {
            options: async (value, { req, location, path }) => {
                // check whether this user already create with this name
                let group = await Group.findOne({
                    _id: new ObjectId(req.body.id),
                    createdUserId: req.user.id,
                });
                if (!group) {
                    return Promise.reject();
                }
            },
            errorMessage: 'group not exist',
        },
    },
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
                let group = await Group.findOne({
                    _id: {
                        $ne: new ObjectId(req.body.id),
                    },
                    name: value,
                    createdUserId: req.user?._id,
                });
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
            options: (value: string[], { req }) => {
                // filter repeated id in the Array
                if (!Array.isArray(value)) value = [];
                value.push(req.user.id);
                return value.filter((value, index, array) => array.indexOf(value) === index);
            },
        },
    },
};

export const validateUpdateGroup = checkSchema(updateGroup);

/**
 *
 */
export interface IDeleteGroup {
    id: string;
}

let deleteGroup: TValidatorSchema<IDeleteGroup> = {
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
                let group = await Group.findOne({
                    _id: new ObjectId(req.params?.id),
                    createdUserId: req.user.id,
                });
                if (!group) {
                    return Promise.reject();
                }
            },
            errorMessage: 'group not exist',
        },
    },
};

export const validateDeleteGroup = checkSchema(deleteGroup);
