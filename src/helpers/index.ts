export * as ErrorService from './app-error';
export * from './utility';

export * from './mongoDB';
import { MongoDBHelper } from './mongoDB';
export const MongoDBService = new MongoDBHelper();

export * from './query';

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