import * as bodyParser from 'koa-body';
import * as compress from "koa-compress";
import * as path from 'path';
import * as passport from 'koa-passport';
import * as randomstring from 'randomstring';
import config from "./configs/config";

function generateRequestId() {
    return randomstring.generate({
        length: 8,
        charset: 'alphanumeric',
        capitalization: 'lowercase'
    });
}

let compression = compress({
    threshold: 2048,
    flush: require("zlib").Z_SYNC_FLUSH
});

export default (app) => {
    if (config.compression) {
        app.use(compression);
    }
    app.use(bodyParser({formidable: {uploadDir: path.join(__dirname, 'uploads')}}));
    app.use(passport.initialize());
    app.use(async(ctx, next) => {
        ctx.details = {
            requestId: generateRequestId(),
            user: null,
            isAdmin: false,
            source: 'API'
        };
        await next();
    });
};

const DEFAULT_REQUEST_DETAILS = {
    isAdmin: true,
    source: 'TEST',
    user: {
        _id: null
    }
};

export {DEFAULT_REQUEST_DETAILS};