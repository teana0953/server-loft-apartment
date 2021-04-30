import Mongoose, { Model, Document, Schema } from 'mongoose';

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

const GroupSchemaDefinition: Mongoose.SchemaDefinitionProperty<IGroup> = {
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
                if (value.length === 0) return false;
                return true;
            },
            message: 'userIds can not empty',
        },
    },
    createdUserId: {
        type: String,
    },
};

export interface GroupDocument extends IGroup, Document {}

export interface GroupModel extends Model<GroupDocument> {}

const groupSchema: Schema<GroupDocument> = new Mongoose.Schema<GroupDocument>(GroupSchemaDefinition, {
    collection: 'Group',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

groupSchema.pre('save', async function (next) {
    // TODO
    // check whether userIds be empty, if empty => delete this group

    return next();
});

export const Group = Mongoose.model<GroupDocument, GroupModel>('Group', groupSchema);
