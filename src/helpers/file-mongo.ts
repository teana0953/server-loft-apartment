import { ObjectId, Binary, Collection } from 'mongodb';
import { MongoDBService } from '.';

export namespace FileMongoHelper {
    export interface IFile {
        binary: Binary;
    }

    export type MongoData<T> = {
        _id?: ObjectId | string;
        createdAt?: Date;
        updatedAt?: Date;
    } & T;

    export interface IFileMongoSrc {
        collectionName: string;
        id: string;
    }

    /**
     * Get file document by src
     * @param src format: file/{{collectionName}}/{{id}}
     */
    export async function getFileBySrc(src: string): Promise<MongoData<IFile>> {
        if (!src) {
            throw new Error('src can not empty');
        }

        let parsedSrc = await parseSrc(src);

        let id: ObjectId = convertStrToObjectId(parsedSrc.id);

        let file: MongoData<IFile> = await MongoDBService.db.collection(parsedSrc.collectionName).findOne({ _id: new ObjectId(id) });

        return file;
    }

    /**
     * Save file
     * @param buffer
     * @param collectionName
     * @param id
     * @returns url
     */
    export async function saveFile(buffer: Buffer, collectionName: string): Promise<string>;
    export async function saveFile(buffer: Buffer, collectionName: string, id: string): Promise<string>;
    export async function saveFile(buffer: Buffer, collectionName: string, id?: string): Promise<string> {
        let collection: Collection<MongoData<IFile>> = MongoDBService.db.collection(collectionName);
        let binary: Binary = new Binary(buffer);

        let isUpdate: boolean = !!id;
        if (isUpdate) {
            let result = await collection.findOneAndUpdate(
                { _id: convertStrToObjectId(id) },
                {
                    $set: {
                        binary: binary,
                        updatedAt: new Date(),
                    },
                },
            );
            if (!result.ok) {
                throw new Error('file not found');
            }

            return `file/${convertPascalCaseToDash(collectionName)}/${id}`;
        }

        let result = await collection.insertOne({
            binary: binary,
            createdAt: new Date(),
        });

        return `file/${convertPascalCaseToDash(collectionName)}/${result.insertedId.toHexString()}`;
    }

    /**
     *
     * @param src
     * @returns
     */
    export async function parseSrc(src: string): Promise<IFileMongoSrc> {
        if (!src) {
            throw new Error('src can not empty');
        }

        let srcs = src.split('/');
        let collectionName = srcs[1];
        if (!/^file/.test(collectionName)) {
            throw new Error('collection format invalid');
        }
        
        collectionName = covertDashToPascalCase(collectionName);
        let id = srcs[2];

        return {
            collectionName,
            id,
        };
    }

    /**
     * Convert pascal case to dash
     * @param value
     * @returns
     */
    function convertPascalCaseToDash(value: string): string {
        if (!value) {
            throw new Error('collection name can not empty');
        }

        value = value.replace(/^([A-Z])/, ([first]) => first.toLowerCase()).replace(/([A-Z])/g, ([letter]) => `-${letter.toLowerCase()}`);
        return value;
    }

    /**
     * Convert dash to pascal case
     * @param value
     * @returns
     */
    function covertDashToPascalCase(value: string): string {
        if (!value) {
            throw new Error('collection name can not empty');
        }

        return value
            .split('-')
            .map((str) => `${str[0].toUpperCase()}${str.substring(1)}`)
            .join('');
    }

    /**
     * Covert string to ObjectId
     * @param id
     * @returns
     */
    function convertStrToObjectId(id: string): ObjectId {
        try {
            return new ObjectId(id);
        } catch (error) {
            throw new Error('id format invalid');
        }
    }
}
