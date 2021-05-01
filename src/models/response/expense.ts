import { IExpenseUser } from '../db/expense';

export interface IExpense {
    id: string;
    name: string;
    cost: number;
    payerId: string;
    users: IExpenseUser[];
    date: Date;
    createdUserId: string;
}
