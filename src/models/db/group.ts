import Mongoose, { Model, Document, Schema } from 'mongoose';
import { MongooseBase } from './base';

//#region Interfaces
export interface GroupDocument extends IGroup, Document {}

export interface GroupModel extends Model<GroupDocument> {}
export interface IGroup {
    /**
     *
     */
    name: string;

    /**
     * the users which in the group
     */
    userIds: string[];

    /**
     * the user who create the group
     */
    createdUserId: string;
}
//#endregion Interfaces

const SchemaDefinition: Mongoose.SchemaDefinitionProperty<IGroup> = {
    name: {
        type: String,
        required: [true, 'name can not empty'],
    },
    userIds: {
        type: Array,
        required: [true, 'userIds can not empty'],
        validate: {
            validator: function (value) {
                if (!Array.isArray(value)) return false;
                return true;
            },
            message: 'userIds should be array',
        },
    },
    createdUserId: {
        type: String,
    },
};

const Base = new MongooseBase<IGroup, any, GroupDocument>({
    collectionName: 'Group',
    schemaDefinition: SchemaDefinition,
    schemaOptions: {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
});

Base.schema.pre('save', async function (next) {
    // TODO
    // check whether userIds be empty, if empty => delete this group

    return next();
});

export const Group = Base.getModel();
