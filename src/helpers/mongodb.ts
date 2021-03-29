import Mongoose from 'mongoose';

export class MongoDBHelper {
    /**
     *
     */
    private _connectionUrl: string = undefined;
    public get connectionUrl(): string {
        return this._connectionUrl;
    }
    public set connectionUrl(url: string) {
        this._connectionUrl = url;
    }

    private _db: Mongoose.Connection = undefined;
    public get db(): Mongoose.Connection {
        return this._db;
    }

    /**
     *
     */
    public async initiation(): Promise<void> {
        try {
            await Mongoose.connect(this.connectionUrl, {
                useNewUrlParser: true,
                useCreateIndex: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
            });

            this._db = Mongoose.connection;
        } catch (error) {
            throw error;
        }
    }
}

export namespace MongoDBHelper {}
