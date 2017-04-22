import * as jwt from "koa-jwt";
import * as passport from "koa-passport";

import config from "../../configs/config";

import authService from "./auth.service";
import {ApiError} from "../errors/api-error.errors";
import {errors} from "../errors/errors";

class AuthController {

    async login(ctx, next) {
        await passport.authenticate("local", async (err, user, info) => {
            let error = err || info;

            if (error) {
                ctx.status = 401;
                ctx.body = err;
                return;
            }

            if (!user) {
                ctx.status = 404;
                ctx.body = {message: "Something went wrong, please try again."};
                return;
            }

            let token = authService.signToken(user);
            ctx.body = {token};
            await next();
        })(ctx, next);
    }

    async loginAs(ctx, next) {
        let details = ctx.details;
        let id = ctx.request.body.user;
        let user = await authService.loginAs(id, details);
        let token = authService.signToken(user);
        ctx.body = {token};
    }

    loadUser = jwt({secret: config.jwt.secret, passthrough: true});

    isLoggedIn = jwt({secret: config.jwt.secret});

    async loadUserDetails(ctx, next) {
        if (!ctx.state.user) {
            return next();
        }
        ctx.details.user = ctx.state.user;
        ctx.details.isAdmin = ctx.details.user.role === "admin";
        await next();
    }

    async adminsOnly(ctx, next) {
        let user = ctx.state.user;
        if (!user) {
            throw new ApiError(errors.generic.unauthenticated);
        }
        if (user.role !== "admin") {
            throw new ApiError(errors.generic.unauthorized);
        }
        await next();
    }

    facebook = passport.authenticate("facebook", {
        scope: ["email", "public_profile", "user_about_me"],
        failureRedirect: "/signup",
        session: false
    });

    async facebookCallback(ctx, next) {
        await passport.authenticate("facebook", {
            session: false
        })(ctx, next);
    };

    async setTokenCookie(ctx, next) {
        let user = ctx.state.user;
        if (!user) {
            ctx.throw(404, "Something went wrong, please try again");
        }
        let token = authService.signToken(user);
        ctx.cookies.set("token", JSON.stringify(token));
        ctx.redirect("/");
    }
}

let singleton = new AuthController();

export default singleton;