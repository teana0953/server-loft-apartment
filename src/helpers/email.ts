import Nodemailer from 'nodemailer';
import Validator from 'validator';

export class EmailHelper {
    /**
     *
     */
    private _config: EmailHelper.IConfig = undefined;
    public get config(): EmailHelper.IConfig {
        return this._config;
    }
    public set config(value: EmailHelper.IConfig) {
        this._config = value;
    }

    public initiation(): void {
        if (!this._config) {
            throw new Error('config can not empty');
        }

        if (!this._config.host) {
            throw new Error('host can not empty');
        }

        if (!Validator.isPort(this._config.port?.toString())) {
            throw new Error('port should between 1 - 65535');
        }

        if (!this._config.account) {
            throw new Error('account can not empty');
        }

        if (!this._config.password) {
            throw new Error('password can not empty');
        }
    }

    public async sendEmail(options: Nodemailer.SendMailOptions): Promise<void> {
        let secure: boolean = !!this._config.isSecure;
        let transporter = Nodemailer.createTransport({
            host: this._config.host,
            port: this._config.port,
            secure,
            auth: {
                user: this._config.account,
                pass: this._config.password,
            },
        });

        await transporter.sendMail({
            from: this._config.account,
            ...options
        });
    }
}

export namespace EmailHelper {
    export interface IConfig {
        host: string;
        port: number;
        isSecure?: boolean; // default false
        account: string;
        password: string;
    }
}
