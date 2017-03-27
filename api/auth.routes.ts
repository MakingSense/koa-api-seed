import * as Router from 'koa-router';

import authCtrl from './auth/auth.controller';
import config from '../configs/config';
import {Logger} from './shared/logger.service';

let auth = new Router();

auth.prefix('/auth');

auth.use(authCtrl.loadUser);
auth.use(authCtrl.loadUserDetails);

/**
 * Local Auth
 */
require('./auth/strategies/local.passport');
auth.post('/local', authCtrl.login);
auth.post('/local/as', authCtrl.loginAs);

/**
 * Facebook Auth
 */
if (config.facebook.clientId && config.facebook.clientSecret) {
    require('./auth/strategies/facebook.passport');
    auth.get('/facebook', authCtrl.facebook);
    auth.get('/facebook/callback', authCtrl.facebookCallback, authCtrl.setTokenCookie);
} else {
    Logger.log('warn', '[Auth] [Facebook] Facebook Authentication inactive. Please set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to activate it.');
}

export default auth;