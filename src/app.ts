import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import Express from 'express';
import Cors from 'cors';
import RateLimit from 'express-rate-limit';
import Helmet from 'helmet';
import MongoSanitize from 'express-mongo-sanitize';
import XSSClean from 'xss-clean';
import { ErrorService } from './helpers';
import { ErrorController } from './controllers';

import { ServerApi, AuthApi, DemoApi } from './routes';

export const app = Express();

// set secure http headers, should position at first
app.use(Helmet());

app.disable('x-powered-by');

app.use(Cors());

app.use(Express.static(`${__dirname}/public`));

app.use(BodyParser.json({
    limit: '100kb'
}));

app.use(CookieParser());

// data sanitization against NoSQL query injection
app.use(MongoSanitize());

// data sanitization against XSS
app.use(XSSClean());

// rate limiting from same api
const limiter = RateLimit({
    max: Number(process.env.REQUEST_NUMBER_LIMIT), // request numbers
    windowMs: Number(process.env.REQUEST_LIMIT_PER_HOUR) * 60 * 1000,
    message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// load all routes
app.use(process.env.API_BASE, [ServerApi, AuthApi, DemoApi]);

// handle not found error
app.all('*', (req, res, next) => {
    next(new ErrorService.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// handle global error
app.use(ErrorController.handleGlobalError);
