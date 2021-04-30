import { UserController } from 'src/controllers';
import { IMongooseBase } from '../base';
import { IDB } from '../db';

export interface ISignup extends IMongooseBase {
    id: string;
    name: string;
    email: string;
    friends: IDB.IUserFriend[];
    groups: IDB.IUserGroup[];
    photoUrl?: string;
    photoOriginalUrl?: string;
    role: IDB.TUserRole;
}

export interface ISignupWithToken {
    id: string;
    name: string;
    email: string;
}
