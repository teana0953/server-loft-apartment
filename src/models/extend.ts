import { IDB } from '.';

declare module 'express' {
    export interface Request {
        user: IDB.UserDocument;
    }
}