import {Logger} from './shared/logger.service';
import config from '../configs/config';
import {ApiError} from './errors/api-error.errors';

export default async function (ctx, next) {
    let details = ctx.details;
    try {
        await next();
    } catch (err) {
        let error = {error: err.error || err.message};
        ctx.body = {errors: [error], requestId: details.requestId};

        if (err.name === "UnauthorizedError") {
            ctx.status = 401;
            Logger.log("error", "[Http] [Unauthorized] A user attempted to perform an action he was not authorized to perform", {
                err,
                details,
                status: ctx.status
            });
            return;
        }

        if (err.name === "ValidationError") {
            ctx.status = 400;
            ctx.body = {errors: err.errors, requestId: details.requestId};
            Logger.log("error", "[Http] [Validation] A validation error occurred", {
                err,
                details,
                status: ctx.status,
                body: ctx.request.body
            });
            return;
        }

        if (err instanceof ApiError) {
            ctx.status = err.statusCode;
            Logger.log("error", "[Http] [API] An API Error occurred", {
                err,
                details,
                status: ctx.status,
                body: ctx.request.body,
                query: ctx.request.query
            });
            return;
        }

        // if unknown error, add stack trace information to facilitate troubleshooting
        ctx.body.errors[0].stack = err.stack;

        if (config.env === "production") {
            // do not leak error data in production
            ctx.body.errors = [{error: "Internal Server Error, please reach out to support."}];
        }
        Logger.log("error", "[Http] [API] An Error occurred", {
            err,
            details,
            status: 500,
            body: ctx.request.body,
            query: ctx.request.query
        });
        ctx.status = 500;
        return;
    }
}