import {Logger} from './shared/logger.service';

import {ApiError} from "./errors/api-error.errors";

export default async function (ctx, next) {
    let details = ctx.details;
    try {
        await next();
    } catch (err) {
        if (err.name === 'ValidationError') {
            ctx.status = 400;
            ctx.body = {errors: err.errors};
            Logger.log('error', '[Http] [Validation] A validation error occurred', {err, details});
            return;
        }

        if (err instanceof ApiError) {
            ctx.status = err.statusCode;
            ctx.body = {errors: [err.error]};
            Logger.log('error', '[Http] [API] An API Error occurred', {err, details});
            return;
        }

        Logger.log('error', '[Http] [API] An Error occurred', {err, details});
        ctx.body = err;
        throw err;
    }
}