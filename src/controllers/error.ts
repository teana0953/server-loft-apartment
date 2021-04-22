import { Response } from 'express';
import { Result, ValidationError } from 'express-validator';
import { Error } from 'mongoose';
import { ErrorService } from '../helpers';

/**
 * handle global error
 * @param err
 * @param req
 * @param res
 * @param next
 */
export function handleGlobalError(err, req, res: Response, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'production') {
        let error = { ...err, message: err.message };

        if (err.name === 'MongoError' || err instanceof Error) {
            error = handleMongooseError(err);
        }
        if (err.name === 'JsonWebTokenError') {
            error = handleJWTError();
        }
        if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError();
        }
        if (err.name === 'MulterError') {
            error = handleMulterError(error);
        }
        if (typeof err.isEmpty === 'function') {
            error = handleValidationError(err);
        }

        sendErrorProd(error, res);
    } else {
        if (err.name === 'JsonWebTokenError') {
            err = handleJWTError();
        }
        if (err.name === 'TokenExpiredError') {
            err = handleJWTExpiredError();
        }
        sendErrorDev(err, res);
    }
}

/**
 * handle mongoose error
 * @param err
 * @returns
 */
function handleMongooseError(err: Error): ErrorService.AppError {
    return new ErrorService.AppError(err.message, 400);
}

function handleJWTError() {
    return new ErrorService.AppError('invalid token', 401);
}

function handleJWTExpiredError() {
    return new ErrorService.AppError('token expired', 401);
}

function handleMulterError(err: Error) {
    return new ErrorService.AppError(`file-handle: ${err.message}`, 400);
}

function handleValidationError(err: Result<ValidationError>) {
    return new ErrorService.AppError(
        err
            .array()
            .map((item) => item.msg)
            .join('; '),
        400,
    );
}

/**
 * send error in development mode
 * @param err
 * @param res
 */
function sendErrorDev(err, res: Response) {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
}

/**
 * send error in production mode
 * @param err
 * @param res
 */
function sendErrorProd(err, res: Response) {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'unknown error',
        });
    }
}
