import { Controller } from '.';
import { IDB, IResponse, IRequest, IResponseBase, IRequestBase } from '../models';
import { ErrorService, QueryHelper } from '../helpers';
import { ObjectId } from 'mongodb';
import { validationResult } from 'express-validator';

export { addExpense, getExpenses };

/**
 * Add Expense
 */
type InputAddExpense = IRequest.IExpense.IAddExpense;
type OutputAddExpense = IResponseBase;
const addExpense = new Controller<InputAddExpense, OutputAddExpense>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input = req.body;
    let user = req.user;

    let userIds: string[] = input.users.map((user) => user.id);

    // check repeat users
    if (userIds.some((item, index, array) => array.indexOf(item) !== index)) {
        throw new ErrorService.AppError('user in users duplicated', 400);
    }

    // check whether all users are friends
    if (
        userIds.some((id) => {
            if (id === user.id) return false;
            return user.friends.findIndex((user) => user.id === id) < 0;
        })
    ) {
        throw new ErrorService.AppError('user in users not your friend', 400);
    }

    // check all user id exists in db
    let users: IDB.UserDocument[] = [];
    await Promise.all(
        userIds.map(async (id) => {
            let user = await IDB.User.findById(new ObjectId(id));
            if (!user) {
                throw new ErrorService.AppError('user not exist', 400);
            }

            users.push(user);
        }),
    );

    // check cost and sum of splitCost is the same
    let sum: number = 0;
    input.users.forEach((user) => (sum += user.splitCost));
    if (sum !== input.cost) {
        throw new ErrorService.AppError('cost and sum of splitCost not the same', 400);
    }

    let expense = await IDB.Expense.create({
        name: input.name,
        cost: input.cost,
        payerId: input.payerId,
        users: input.users,
        date: input.date,
        createdUserId: user.id,
    });

    res.json({
        status: 'ok',
    });
}).func;

/**
 * Get expenses
 */
type InputGetExpense = IRequestBase;
type OutputGetExpenses = IResponseBase<IResponse.IExpense.IExpense[]>;
const getExpenses = new Controller<InputGetExpense, OutputGetExpenses>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input = req.params;
    let user = req.user;

    let oriQuery = IDB.Expense.find({ 'users.id': user.id });
    let queryService = await new QueryHelper<IDB.ExpenseDocument[], IDB.ExpenseDocument>(IDB.Expense.find({ 'users.id': user.id }), req.query);
    let total: number = await oriQuery.countDocuments();

    queryService = queryService //
        .sort()
        .paginate();

    let result = await queryService.query;

    res.json({
        status: 'ok',
        total: total,
        page: queryService.page,
        limit: queryService.limit,
        data: result.map((item) => {
            return {
                id: item.id,
                name: item.name,
                cost: item.cost,
                payerId: item.payerId,
                users: item.users,
                date: item.date,
                createdUserId: item.createdUserId,
            };
        }),
    });
}).func;
