import { checkSchema } from 'express-validator';
import { TValidatorSchema } from '..';

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
