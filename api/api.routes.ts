import * as Router from 'koa-router';
import userCtrl from './users/user.controller';
import authCtrl from './auth/auth.controller';

let api = new Router();
let users = new Router();

api.prefix('/api');


/**
 * User Routes
 */
users.param('user', userCtrl.loadUser);

users.use(authCtrl.loadUser);
users.use(authCtrl.loadUserDetails);

users.post('/', userCtrl.create);
users.post('/forgot-password', userCtrl.createForgotPassword);
users.post('/forgot-password/use', userCtrl.changePasswordByCode);
users.get ('/forgot-password/:code', userCtrl.findForgotPassword);
users.put ('/forgot-password/:code', authCtrl.adminsOnly, userCtrl.updateForgotPassword);

users.use(authCtrl.isLoggedIn);

users.get('/', userCtrl.search);
users.get('/:user', userCtrl.show);
users.put('/:userId', userCtrl.update);
users.put('/:userId/password', userCtrl.changePassword);
users.delete('/:userId', userCtrl.delete);

/**
 * Mount routers
 */
api.use('/users', users.routes());

export default api;