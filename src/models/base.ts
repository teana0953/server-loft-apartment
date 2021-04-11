export interface IMongooseBase {
    createdAt?: Date; // mongoose options timestamp
    updatedAt?: Date; // mongoose options timestamp
}

export interface IResponseBase<T = {}> {
    status: 'ok' | 'error';
    token?: string;
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
