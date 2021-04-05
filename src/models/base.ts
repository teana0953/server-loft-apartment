import { ParamSchema } from 'express-validator';

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

export type IJWTDecoded<T = {}> = IJWTDecodedBase & T;
export interface IJWTDecodedBase {
    iat: number;
    exp: number;
}
