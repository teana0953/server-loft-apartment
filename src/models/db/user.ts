import { Utility } from '../../helpers';
import Mongoose, { Model, Document, Schema } from 'mongoose';
import Validator from 'validator';
import Bcrypt from 'bcrypt';
import Crypto from 'crypto';

export interface IUser {
    name: string;
    email: string;
    photo?: string;
    password: string;
    passwordConfirm: string;
    passwordUpdatedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpiresTimestamp?: number;
    role: TUserRole;
}

export enum EUserRole {
    user = 'user',
    admin = 'admin',
}

export type TUserRole = keyof typeof EUserRole;

export interface IUserJWTPayload {
    id: string;
}

export interface UserDocument extends IUser, Document {
    comparePassword(inputPassword: string, userPassword: string): Promise<boolean>;
    isPasswordChanged(jwtTimestamp: number): boolean;
    getPasswordResetToken(): string;
}

export interface UserModel extends Model<UserDocument> {}

const userSchema: Schema<UserDocument> = new Mongoose.Schema<UserDocument>(
    {
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
        photo: {
            type: String,
        },
        password: {
            type: String,
            required: [true, 'password can not empty'],
            minlength: 8,
            select: false,
        },

        // only works on create and save
        passwordConfirm: {
            type: String,
            required: [true, 'passwordConfirm can not empty'],
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
        role: {
            type: String,
            enum: Utility.convertEnumValueToArray(EUserRole),
            default: 'user',
        },
    },
    {
        collection: 'User',
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
);

userSchema.pre('save', async function (next) {
    // only encrypt password when it modified
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await Bcrypt.hash(this.password, 12);

    this.passwordUpdatedAt = new Date(Date.now() - 1000);

    this.passwordConfirm = undefined;

    return next();
});

userSchema.methods.comparePassword = async function (inputPassword, userPassword) {
    return await Bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.isPasswordChanged = function (jwtTimestamp: number) {
    if (this.passwordUpdatedAt) {
        const updatedTimestamp: number = Math.round(this.passwordUpdatedAt.getTime() / 1000);

        return jwtTimestamp < updatedTimestamp;
    }

    return false;
};

userSchema.methods.getPasswordResetToken = function () {
    const resetToken = Crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = Crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpiresTimestamp = Date.now() + Number(process.env.RESET_PASSWORD_EXPIRES_MIN) * 60 * 1000;

    return resetToken;
};

export const User = Mongoose.model<UserDocument, UserModel>('User', userSchema);