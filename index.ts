require("dotenv").config({silent: true});

import config from "./configs/config";

import * as koa from "koa";
import * as IO from "koa-socket";
import * as socketRedis from "socket.io-redis";

import api from "./api/api.routes";
import auth from "./api/auth.routes";
import status from "./api/status.routes";

import localUploads from "./api/middleware/local-uploads.routes";

import setupKoa from "./koa.config";
import setUpSocketRoutes from "./api/sockets.routes";

import connectToDb from "./db.config";
import errorHandler from "./api/middleware/error-handler.middleware";

let app = new koa();
let io = new IO();

io.attach(app);

connectToDb(app);
setupKoa(app);
app.use(errorHandler);

app.use(auth.routes());
app.use(api.routes());
app.use(status.routes());

app.use(auth.allowedMethods());
app.use(api.allowedMethods());

if (config.uploads.strategy === "local") {
    app.use(localUploads);
}

if (config.websockets.useAdapter) {
    app._io.adapter(socketRedis({host: config.redis.host, port: config.redis.port}));
}

setUpSocketRoutes(io);

let server = app.listen(config.port, function () {
    console.log(`Koa server running on port ${server.address().port}`);
});