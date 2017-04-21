import AuthService from "./auth.service";
import {Logger} from "../shared/logger.service";

class AuthSocketController {
    async authenticate(ctx, next) {
        Logger.log("info", "[Sockets] [authenticate] A user is authenticating", {id: ctx.socket.id, data: ctx.data});

        let token = ctx.data && ctx.data.token;
        // Throws an exception if check fails
        AuthService.checkToken(token);

        // Store token in socket to use it later on every subscription request
        ctx.socket.token = token;

        // Emit event to let socket user know that operation succeeded
        ctx.socket.emit("authenticated");

        // A koa-compose error is triggered if we use this
        //    await next();
    }
}

let singleton = new AuthSocketController();

export default singleton;

