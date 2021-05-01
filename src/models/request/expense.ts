import { checkSchema } from 'express-validator';
import { TValidatorSchema } from '..';
import { ObjectId } from 'mongodb';
import { Expense, IExpenseUser } from '../db/expense';
import { User } from '../db/user';

/**
 *
 */
export interface IAddExpense {
    name: string;
    cost: number;
    payerId: string;
    users: IExpenseUser[];
    date: Date;
}

let addExpense: TValidatorSchema<IAddExpense> = {
    name: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
        },
    },
    cost: {
        in: ['body'],
        isFloat: {
            options: {
                gt: 0,
            },
            errorMessage: ['cost should be > 0'],
        },
    },
    payerId: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['payerId can not empty'],
        },
        custom: {
            options: async (value, { req, location, path }) => {
                // check payerId is in users
                if ((req.body?.users || []).findIndex((user) => user.id === value) < 0) {
                    return Promise.reject();
                }

                let user = await User.findOne({
                    _id: new ObjectId(value),
                });
                if (!user) {
                    return Promise.reject();
                }
            },
            errorMessage: 'payer not exist',
        },
    },
    users: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['users can not empty'],
        },
        isArray: {
            options: {
                min: 2,
            },
            errorMessage: ['users should be at least have two'],
        },
    },
    date: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['date can not empty'],
        },
        custom: {
            options: (value, { req, location, path }) => {
                return !isNaN(Date.parse(value));
            },
            errorMessage: 'date invalid format',
        },
    },
};

export const validateAddExpense = checkSchema(addExpense);

/**
 *
 */
export interface IUpdateExpense extends IAddExpense {
    id: string;
}

let updateExpense: TValidatorSchema<IUpdateExpense> = {
    id: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['id can not empty'],
        },
        custom: {
            options: async (value, { req, location, path }) => {
                // check whether this user already create with this name
                let expense = await Expense.findOne({
                    _id: new ObjectId(req.body.id),
                });
                if (!expense) {
                    return Promise.reject();
                }
            },
            errorMessage: 'expense not exist',
        },
    },
    name: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
        },
    },
    cost: {
        in: ['body'],
        isFloat: {
            options: {
                gt: 0,
            },
            errorMessage: ['cost should be > 0'],
        },
    },
    payerId: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['payerId can not empty'],
        },
        custom: {
            options: async (value, { req, location, path }) => {
                let user = await User.findOne({
                    _id: new ObjectId(value),
                });
                if (!user) {
                    return Promise.reject();
                }
            },
            errorMessage: 'payer not exist',
        },
    },
    users: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['users can not empty'],
        },
        isArray: {
            options: {
                min: 1,
            },
            errorMessage: ['users should be at least have one'],
        },
    },
    date: {
        in: ['body'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['date can not empty'],
        },
        isDate: {
            bail: true,
            errorMessage: ['date format error'],
        },
    },
};

export const validateUpdateExpense = checkSchema(updateExpense);

/**
 *
 */
export interface IDeleteExpense {
    id: string;
}

let deleteExpense: TValidatorSchema<IDeleteExpense> = {
    id: {
        in: ['params'],
        exists: {
            options: {
                checkNull: true,
            },
            errorMessage: ['id can not empty'],
        },
        custom: {
            options: async (value, { req, location, path }) => {
                let expense = await Expense.findOne({
                    _id: new ObjectId(req.params?.id),
                });
                if (!expense) {
                    return Promise.reject();
                }
            },
            errorMessage: 'expense not exist',
        },
    },
};

export const validateDeleteExpense = checkSchema(deleteExpense);
