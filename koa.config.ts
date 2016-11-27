import * as bodyParser from 'koa-body';
import * as path from 'path';
import * as passport from 'koa-passport';
import * as randomstring from 'randomstring';

function generateRequestId() {
    return randomstring.generate({
        length: 8,
        charset: 'alphanumeric',
        capitalization: 'lowercase'
    });
}

export default (app) => {
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