import * as passport from 'koa-passport';
import * as Facebook from 'passport-facebook';

import config from '../../../configs/config';

import authService from '../auth.service';
import userService from '../../users/user.service';
import {Logger} from '../../shared/logger.service';

export default passport.use(new Facebook.Strategy({
        clientID: config.facebook.clientId,
        clientSecret: config.facebook.clientSecret,
        callbackURL: '/auth/facebook/callback',
        profileFields: ['email', 'name']
    },
    async function (accessToken, refreshToken, profile, done) {
        try {
            let user = await userService.findByFacebookId(profile.id);
            if (!user) {
                //create a new one
                let userData = {
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails && profile.emails[0].value,
                    role: 'user',
                    provider: 'facebook',
                    active: true,
                    facebook: profile._json,
                    stats: {
                        lastLogin: new Date(),
                        timesLoggedIn: 1
                    }
                };
                user = await userService.create(userData);
                Logger.info(`[Http] [Auth Facebook] User signed up using Facebook. Whooray!`, {user});
            } else {
                if (user.deletedAt) {
                    Logger.log('warn', '[API] [Auth] Deleted user attempted to log in through facebook', {user});
                    return done(null, false, {message: 'This account has been disabled'});
                }

                let changes = {lastLogin: new Date, timesLoggedIn: user.stats.timesLoggedIn + 1};
                user = await userService.update(user._id, changes);
                Logger.info(`[Http] [Auth Facebook] User signed in using Facebook`, {user});
                done(null, user);
            }

        } catch (e) {
            done(e);
        }
    }
));