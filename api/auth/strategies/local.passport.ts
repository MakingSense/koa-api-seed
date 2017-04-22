import * as passport from "koa-passport";
import * as Local from "passport-local";

import authService from "../../auth/auth.service";

export default passport.use(new Local.Strategy({
        usernameField: "email",
        passwordField: "password"
    },
    async function (email, password, done) {
        try {
            let {user, token} = await authService.login(email, password);
            done(null, user);
        } catch (e) {
            done(e);
        }
    }
));