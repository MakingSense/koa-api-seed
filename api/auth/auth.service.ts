import * as jwt from 'jsonwebtoken';
import {ObjectID} from 'mongodb';

import config from '../../configs/config';

import userService from '../users/user.service';
import {Logger} from '../shared/logger.service';
import {ApiError} from '../errors/api-error.errors';
import {errors} from '../errors/errors';
import {User} from "../users/user.model";
import {DEFAULT_REQUEST_DETAILS} from "../../koa.config";

const aWeek = 60 * 60 * 24 * 7;


class AuthService {

    async login(email, password, details = DEFAULT_REQUEST_DETAILS) {
        if (!email) {
            Logger.log('error', '[AuthService] [Login] you need to provide an email', {email, details});
            throw new ApiError(errors.auth.no_username);
        }

        if (!password) {
            Logger.log('error', '[AuthService] [Login] you need to provide a password', {email, details});
            throw new ApiError(errors.auth.no_password);
        }

        let user = await userService.checkEmailAndPassword(email, password);
        let token = this.signToken(user);
        Logger.log('info', '[AuthService] [Login] User logged in successfully', {email, user, details});
        return {user, token};
    }

    async loginAs(idOrEmail, details = DEFAULT_REQUEST_DETAILS) {
        if (!details.isAdmin) {
            throw new ApiError(errors.generic.unauthorized);
        }
        let user = await ObjectID.isValid(idOrEmail) ? userService.findById(idOrEmail) : userService.findByEmail(idOrEmail);
        let token = this.signToken(user);
        Logger.log('info', '[AuthService] [Login] Admin User logged in as a user successfully', {idOrEmail, user, details});
        return {user, token};
    }

    signToken(userData) {
        let user : any = new User(userData);
        return jwt.sign(user.token, config.jwt.secret, {expiresIn: aWeek});
    }
}

let singleton = new AuthService();
export default singleton;