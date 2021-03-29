import { IMongooseBase } from "../base";
import { IDB } from "../db";

export interface ISignup extends IMongooseBase {
    id: string;
    name: string;
    email: string;
    photo?: string;
    role: IDB.TUserRole;
}