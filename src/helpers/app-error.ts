import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    private statusCode: number = 500;
    private status: string;
    private isOperational: boolean = false;

    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * catch async
 * @param fn
 * @returns
 */
export function catchAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}
