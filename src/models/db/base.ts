import Mongoose, { Document } from 'mongoose';

export class MongooseBase<T, E, D extends Document> {
    /**
     *
     */
    private _collectionName: string = undefined;
    public get collectionName(): string {
        return this._collectionName;
    }

    /**
     *
     */
    private _schemaDefinition: Mongoose.SchemaDefinitionProperty<T> = undefined;
    public get schemaDefinition(): Mongoose.SchemaDefinitionProperty<T> {
        return this._schemaDefinition;
    }

    /**
     *
     */
    private _schema: Mongoose.Schema<D> = undefined;
    public get schema(): Mongoose.Schema<D> {
        return this._schema;
    }

    constructor(configs: MongooseBase.IConfigs<T>) {
        this._collectionName = configs.collectionName;
        this._schemaDefinition = configs.schemaDefinition;
        this._schema = new Mongoose.Schema<D, Mongoose.Model<D>>(this._schemaDefinition, {
            collection: this.collectionName,
            ...configs.schemaOptions,
        });
    }

    /**
     * add extend method
     * @param name method name
     * @param func
     */
    public addMethod(name: keyof E, func: (this: D, ...args: any[]) => any) {
        this._schema.methods[`${name}`] = func;
    }

    /**
     * get model
     */
    public getModel(): Mongoose.Model<D> {
        return Mongoose.model<D, Mongoose.Model<D>>(this._collectionName, this._schema);
    }
}

export namespace MongooseBase {
    export interface IConfigs<T> {
        collectionName: string;
        schemaDefinition: Mongoose.SchemaDefinitionProperty<T>;
        schemaOptions: Mongoose.SchemaOptions;
    }
}
