import { checkSchema, ParamSchema } from 'express-validator';

type TSchema<K extends keyof any, T> = {
    [P in K]: T;
};

export type TValidatorSchema<T> = TSchema<keyof T, ParamSchema>;

export interface IMongooseBase {
    createdAt?: Date; // mongoose options timestamp
    updatedAt?: Date; // mongoose options timestamp
}

export interface IResponseBase<T = {}> {
    status: 'ok' | 'error';
    data?: T;
    total?: number;
    page?: number;
    limit?: number;
}

export interface IRequestBase {
    sort?: string;
    page?: number;
    limit?: number;
}
let requestBase: TValidatorSchema<IRequestBase> = {
    sort: {
        in: ['query'],
    },
    page: {
        in: ['query'],
        optional: true,
        isInt: {
            options: {
                min: 1,
            },
        },
    },
    limit: {
        in: ['query'],
        optional: true,
        isInt: {
            options: {
                min: 1,
            },
        },
    },
};
export const validateRequestBase = checkSchema(requestBase);

export type IJWTDecoded<T = {}> = IJWTDecodedBase & T;
export interface IJWTDecodedBase {
    iat: number;
    exp: number;
}
