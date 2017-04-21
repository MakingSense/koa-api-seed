import * as compose from "koa-compose";

import {Logger} from "./shared/logger.service";
import SocketAuthController from "./auth/auth.socket-controller";
import errorHandler from "./sockets/socket-error-handler.middleware";

function setupSockets(io) {
    // This does not work as intended for some reason, there's a pending
    // issue on the koa-socket github repo for this
    // https://github.com/mattstyles/koa-socket/issues/27
    // io.use(errorHandler);

    io.on("connection", (ctx) => {
        // User is connected to the socket but not authenticated yet
        // There are a couple of modules that basically allow the JWT
        // to be sent as a query param or disable the socket temporarily
        // until the user performs the actual authentication after a given
        // timeout, but it seems to be a pretty specific and complex
        // mechanism and something simpler will work for our purposes
        Logger.log("info", "[Sockets] [connection] A user connected to socket", {id: ctx.socket.id});
    });

    io.on("authenticate", compose([
        // TODO: Remove error handler from here as soon as the issue
        // with the error handler and koa-socket gets resolved
        // https://github.com/mattstyles/koa-socket/issues/27
        errorHandler,
        SocketAuthController.authenticate
    ]));

    io.on("syn", async (ctx, next) => {
        ctx.socket.emit("ack");
    });
}

export default setupSockets;
