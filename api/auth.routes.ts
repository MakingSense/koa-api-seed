import * as Router from 'koa-router';
import authCtrl from './auth/auth.controller';

require('./auth/strategies/local.passport');
require('./auth/strategies/facebook.passport');

let auth = Router();

auth.prefix('/auth');


/**
 * Mount routers
 */
auth.use(authCtrl.loadUser);
auth.use(authCtrl.loadUserDetails);

auth.post('/local', authCtrl.login);
auth.post('/local/as', authCtrl.loginAs);

auth.get('/facebook', authCtrl.facebook);
auth.get('/facebook/callback', authCtrl.facebookCallback, authCtrl.setTokenCookie);

export default auth;