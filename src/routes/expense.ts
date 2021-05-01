import express from 'express';
import { Middleware } from '../middlewares';
import { ExpenseController } from '../controllers';
import { IRequest, validateRequestBase } from '../models';

export const ExpenseApi = express.Router();

enum ERoute {
    expenses = '/expenses',
    expense = '/expense',
}

ExpenseApi.route(ERoute.expenses).get(Middleware.checkAuth, validateRequestBase, ExpenseController.getExpenses);

ExpenseApi.route(ERoute.expense).post(Middleware.checkAuth, IRequest.IExpense.validateAddExpense, ExpenseController.addExpense);
