import {Logger} from "../shared/logger.service";
import {ApiError} from "../errors/api-error.errors";
import {errors} from "../errors/errors";

export default async function errorHandler(ctx, next) {
    try {
        await next();
    } catch (err) {
        if (err instanceof ApiError) {
            ctx.socket.emit(err.event || "socket-error", err.message);
            Logger.log("error", "[Socket] [API] A socket error occurred", {err});
            return;
        }

        ctx.socket.emit("socket-error", "An unexpected error occurred");
        Logger.log("error", "[Socket] [API] An unexpected socket error occurred", {err});
        return;
    }
}