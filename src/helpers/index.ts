export * as ErrorService from './app-error';
export * from './utility';

export * from './mongodb';
import { MongoDBHelper } from './mongodb';
export const MongoDBService = new MongoDBHelper();

export * from './query';
export * from './photo';
export * from './file-mongo';

import { GoogleAuthHelper } from './google-auth';
export const GoogleAuthService = new GoogleAuthHelper(process.env.GOOGLE_CLIENT_ID);

export * from './email';
import { EmailHelper } from './email';
export const EmailService = new EmailHelper();
EmailService.config = {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    isSecure: process.env.EMAIL_SECURE === 'true' ? true : false,
    account: process.env.EMAIL_ACCOUNT,
    password: process.env.EMAIL_PASSWORD,
};
EmailService.initiation();