import * as Router from "koa-router";

import authCtrl from "./auth/auth.controller";

let status = new Router();

status.prefix("/status");

status.use(authCtrl.loadUser);
status.use(authCtrl.loadUserDetails);

status.get("/", async (ctx, next) => {
    ctx.body = "ok";
    await next();
});

export default status;
