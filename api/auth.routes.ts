import * as Router from 'koa-router';
import authCtrl from './auth/auth.controller';
import config from "../configs/config";

require('./auth/strategies/local.passport');

let auth = Router();

auth.prefix('/auth');


/**
 * Mount routers
 */
auth.use(authCtrl.loadUser);
auth.use(authCtrl.loadUserDetails);

auth.post('/local', authCtrl.login);
auth.post('/local/as', authCtrl.loginAs);

if (config.facebook.clientId && config.facebook.clientSecret) {
    require('./auth/strategies/facebook.passport');
    auth.get('/facebook', authCtrl.facebook);
    auth.get('/facebook/callback', authCtrl.facebookCallback, authCtrl.setTokenCookie);
}

export default auth;