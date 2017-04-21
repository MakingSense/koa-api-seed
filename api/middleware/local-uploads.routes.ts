import * as send from "koa-send";

import config from "../../configs/config";

let uploadsBase = config.uploads.base;
let root = config.uploads.local.path;

export default async function (ctx, next) {
    if (ctx.request.method === "GET" && ctx.request.url.startsWith(uploadsBase)) {
        await send(ctx, ctx.path, { root });
    }
    await next();
}
