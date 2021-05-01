import Mongoose, { Model, Document, Schema } from 'mongoose';
import { MongooseBase } from './base';

//#region Interfaces
export interface IExpenseUser {
    id: string;
    splitCost: number;
}

export interface ExpenseDocument extends IExpense, Document {}

export interface ExpenseModel extends Model<ExpenseDocument> {}
export interface IExpense {
    /**
     *
     */
    name: string;

    /**
     *
     */
    cost: number;

    /**
     *
     */
    payerId: string;

    /**
     * the users which in the group
     */
    users: IExpenseUser[];

    /**
     *
     */
    date: Date;

    /**
     * the user who create the group
     */
    createdUserId: string;
}
//#endregion Interfaces

const SchemaDefinition: Mongoose.SchemaDefinitionProperty<IExpense> = {
    name: {
        type: String,
        required: [true, 'name can not empty'],
    },
    cost: {
        type: Number,
        required: [true, 'cost can not empty'],
        validate: {
            validator: function (value) {
                return !!value && value > 0;
            },
            message: 'cost should be > 0',
        },
    },
    payerId: {
        type: String,
        required: [true, 'payerId can not empty'],
    },
    users: [
        {
            _id: false,
            id: {
                type: String,
                required: [true, 'id can not empty'],
            },
            splitCost: {
                type: Number,
                required: [true, 'splitCost can not empty'],
                validate: {
                    validator: function (value) {
                        return !!value && value > 0;
                    },
                    message: 'splitCost should be > 0',
                },
            },
        },
    ],
    date: {
        type: Date,
        required: [true, 'date can not empty'],
    },
    createdUserId: {
        type: String,
    },
};

const Base = new MongooseBase<IExpense, any, ExpenseDocument>({
    collectionName: 'Expense',
    schemaDefinition: SchemaDefinition,
    schemaOptions: {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
});

export const Expense = Base.getModel();
