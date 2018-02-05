import * as jwt from "jsonwebtoken";
import {ObjectID} from "mongodb";

import config from "../../configs/config";

import userService from "../users/user.service";
import {Logger} from "../shared/logger.service";
import {ApiError} from "../errors/api-error.errors";
import {errors} from "../errors/errors";
import {User} from "../users/user.model";
import {DEFAULT_REQUEST_DETAILS} from "../../koa.config";
import { UserEmailService } from "../users/user-email.service";
import * as request from "request-promise";
import { Auth0Service as auth0Service} from "./auth0.service";

const aWeek = 60 * 60 * 24 * 7;

class AuthService {
    async login(ctx, next) {
        let {email, password} = ctx.request.body;

        if (!email) {
            Logger.log("error", "[AuthService] [Login] you need to provide an email");
            throw new ApiError(errors.auth.no_username);
        }

        if (!password) {
            Logger.log("error", "[AuthService] [Login] you need to provide a password");
            throw new ApiError(errors.auth.no_password);
        }

        const response = await auth0Service.login({email, password});

        if (!response) {
            Logger.log("error", "[AuthService] [Login] error login user against auth0");
            throw new ApiError(errors.auth.auth0_login_error);
        }

        ctx.body = response;
    }

    async loginAs(idOrEmail, details = DEFAULT_REQUEST_DETAILS) {
        if (!details.isAdmin) {
            throw new ApiError(errors.generic.unauthorized);
        }
        let user = await ObjectID.isValid(idOrEmail) ? userService.findById(idOrEmail) : userService.findByEmail(idOrEmail);
        let token = this.signToken(user);
        Logger.log("info", "[AuthService] [Login] Admin User logged in as a user successfully", {
            idOrEmail,
            user,
            details
        });
        return {user, token};
    }

    signToken(userData) {
        let user: any = new User(userData);
        return jwt.sign(user.token, config.jwt.secret, {expiresIn: aWeek});
    }

    checkToken(token) {
        try {
            // Throws an error if validation fails
            return jwt.verify(token, config.jwt.secret);
        } catch (e) {
            // Throw exception to let koa log the error
            throw new ApiError(errors.generic.unauthenticated);
        }
    }
}

let singleton = new AuthService();
export default singleton;