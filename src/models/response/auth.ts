import { IMongooseBase } from '../base';
import { IDB } from '../db';

export interface ISignup extends IMongooseBase {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    photoOriginalUrl?: string;
    role: IDB.TUserRole;
}
