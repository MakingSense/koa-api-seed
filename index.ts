require('dotenv').config({silent: true});

import config from "./configs/config";

import * as koa from 'koa';
import api from './api/api.routes';
import auth from './api/auth.routes';

import setupKoa from './koa.config'
import connectToDb from './db.config';
import errorHandler from './api/error-handler.middleware';

let app = new koa();

connectToDb(app);
setupKoa(app);
app.use(errorHandler);

app.use(auth.routes());
app.use(api.routes());

let server = app.listen(config.port, function () {
    console.log(`Koa server running on port ${server.address().port}`);
});