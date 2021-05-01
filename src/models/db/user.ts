import { Utility } from '../../helpers';
import Mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import Validator from 'validator';
import Bcrypt from 'bcrypt';
import Crypto from 'crypto';
import { MongooseBase } from './base';

//#region Interfaces
export enum EUserRole {
    user = 'user',
    admin = 'admin',
}

export type TUserRole = keyof typeof EUserRole;

export interface IUserJWTPayload {
    id: string;
}

export interface IUserFriend {
    id: string;
}

export interface IUserFriendInfo extends IUserFriend {
    name: string;
    email: string;
    photoUrl?: string;
}

export interface IUserGroup {
    id: string;
}

export interface IUserExpense {
    id: string;
}

export interface UserDocument extends IUser, Document, IExtendMethod {}

export interface IExtendMethod {
    comparePassword(inputPassword: string, userPassword: string): Promise<boolean>;
    isPasswordChanged(jwtTimestamp: number): boolean;
    getPasswordResetToken(): string;
    getFriendInfos(): Promise<IUserFriendInfo[]>;
}

export interface IUser {
    /**
     *
     */
    name: string;

    /**
     *
     */
    email: string;

    /**
     * isRegistered
     * @description whether is already registered by user
     */
    isRegistered: boolean;

    /**
     * isGoogleAuth
     */
    isGoogleAuth: boolean;

    /**
     *
     */
    role: TUserRole;

    /**
     *
     */
    photoUrl?: string;

    /**
     *
     */
    photoOriginalUrl?: string;

    /**
     *
     */
    password: string;

    /**
     *
     */
    passwordConfirm: string;

    /**
     * passwordUpdatedAt
     * @description to check token is expired
     */
    passwordUpdatedAt?: Date;

    /**
     *
     */
    passwordResetToken?: string;

    /**
     *
     */
    passwordResetExpiresTimestamp?: number;

    /**
     *
     */
    inviteToken?: string;

    /**
     *
     */
    friends: IUserFriend[];

    /**
     *
     */
    groups: IUserGroup[];

    /**
     *
     */
    expenses: IUserExpense[];
}
//#endregion Interfaces

const SchemaDefinition: Mongoose.SchemaDefinitionProperty<IUser> = {
    name: {
        type: String,
        required: [true, 'name can not empty'],
    },
    email: {
        type: String,
        required: [true, 'email can not empty'],
        unique: true,
        lowercase: true,
        validate: [Validator.isEmail, 'email format invalid'],
    },
    isRegistered: {
        type: Boolean,
        default: false,
    },
    isGoogleAuth: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: Utility.convertEnumValueToArray(EUserRole),
        default: 'user',
    },
    photoUrl: {
        type: String,
    },
    photoOriginalUrl: {
        type: String,
    },
    password: {
        type: String,
        required: [
            function () {
                return this.isRegistered === true && this.isGoogleAuth !== true;
            },
            'password can not empty',
        ],
        minlength: 8,
        select: false,
    },

    // only works on create and save
    passwordConfirm: {
        type: String,
        required: [
            function () {
                return this.isRegistered === true && this.isGoogleAuth !== true;
            },
            'passwordConfirm can not empty',
        ],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'password not the same',
        },
    },
    passwordUpdatedAt: {
        type: Date,
        select: false,
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpiresTimestamp: {
        type: Number,
    },

    inviteToken: {
        type: String,
    },

    friends: [
        {
            _id: false,
            id: {
                type: String,
            },
        },
    ],
    groups: [
        {
            _id: false,
            id: {
                type: String,
            },
        },
    ],
    expenses: [
        {
            _id: false,
            id: {
                type: String,
            },
        },
    ],
};

const Base = new MongooseBase<IUser, IExtendMethod, UserDocument>({
    collectionName: 'User',
    schemaDefinition: SchemaDefinition,
    schemaOptions: {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
});

Base.schema.pre('save', async function (next) {
    // only encrypt password when it modified
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await Bcrypt.hash(this.password, 12);

    this.passwordUpdatedAt = new Date(Date.now() - 1000);

    this.passwordConfirm = undefined;

    return next();
});

//#region Extend Methods
Base.addMethod('comparePassword', async function (inputPassword, userPassword) {
    return await Bcrypt.compare(inputPassword, userPassword);
});

Base.addMethod('isPasswordChanged', function (jwtTimestamp: number) {
    if (this.passwordUpdatedAt) {
        const updatedTimestamp: number = Math.round(this.passwordUpdatedAt.getTime() / 1000);

        return jwtTimestamp < updatedTimestamp;
    }

    return false;
});

Base.addMethod('getPasswordResetToken', function () {
    const resetToken = Crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = Crypto.createHash('sha256') //
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpiresTimestamp = Date.now() + Number(process.env.RESET_PASSWORD_EXPIRES_MIN) * 60 * 1000;

    return resetToken;
});

Base.addMethod('getFriendInfos', async function () {
    let friendIds: ObjectId[] = this.friends.map((item) => new ObjectId(item.id));
    let friends = await User.find({
        _id: {
            $in: friendIds,
        },
    });

    return friends.map((friend) => {
        return {
            id: friend.id,
            name: friend.name,
            email: friend.email,
            photoUrl: friend.photoUrl,
        };
    });
});

//#endregion Extend Methods

export const User = Base.getModel();
