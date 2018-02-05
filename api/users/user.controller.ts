import {ObjectID} from "mongodb";

import UserService from "./user.service";
import AuthService from "../auth/auth.service";

import {ApiError} from "../errors/api-error.errors";
import {errors} from "../errors/errors";
import {UserDocument} from "./user.model";

class UserController {
    async create(ctx, next) {
        let requestDetails = ctx.details;
        let userData = ctx.request.body;
        let createdUser = await UserService.create(userData, requestDetails);
        ctx.body = createdUser;
    }

    async loadUser(id, ctx, next) {
        let requestDetails = ctx.details;

        if (id === "me" && ctx.state.user) {
            id = new ObjectID(ctx.state.user._id);
        }

        if (!ObjectID.isValid(id)) {
            return;
        }

        let user = await UserService.findById(id, requestDetails);
        ctx.state.user = user;
        await next();
    }

    async show(ctx, next) {
        let user = ctx.state.user;
        if (!user) {
            throw new ApiError(errors.users.not_found);
        }
        ctx.body = user;
    }

    async search(ctx, next) {
        let requestDetails = ctx.details;
        let query = ctx.request.query;
        let results = await UserService.search(query, requestDetails);
        ctx.body = results;
    }

    async createForgotPassword(ctx, next) {
        let requestDetails = ctx.details;
        let email = ctx.request.body.email;
        ctx.body = "";
        try {
            await UserService.createForgotPassword(email, requestDetails);
        } catch (err) {
            //ignore errors if the email is invalid or doesn't exist. Do not tell users whether their email exists or not.
        }
    }

    async update(ctx, next) {
        let requestDetails = ctx.details;
        let changes = ctx.request.body;
        let id = ctx.params.userId;
        let updatedUser = await UserService.update(id, changes, requestDetails);
        ctx.body = updatedUser;
    }

    async changePassword(ctx, next) {
        let requestDetails = ctx.details;
        let {oldPassword, newPassword} = ctx.request.body;
        let id = ctx.params.userId;
        let user = await UserService.changePassword(id, oldPassword, newPassword, requestDetails);
        let token = AuthService.signToken(user);
        ctx.body = {user, token};
    }

    async changePasswordByCode(ctx, next) {
        let requestDetails = ctx.details;
        let {code, password} = ctx.request.body;
        let user = await UserService.changePasswordByCode(code, password, requestDetails);
        let token = AuthService.signToken(user);
        ctx.body = {user, token};
    }


    async findForgotPassword(ctx, next) {
        let requestDetails = ctx.details;
        let {code} = ctx.params;
        let forgotPass = await UserService.findForgotPasswordByCode(code, requestDetails);
        ctx.body = forgotPass;
    }

    async updateForgotPassword(ctx, next) {
        let requestDetails = ctx.details;
        let {code} = ctx.params;
        let changes = ctx.request.body;
        let forgotPass = await UserService.updateForgotPassword(code, changes, requestDetails);
        ctx.body = forgotPass;
    }

    async delete(ctx, next) {
        let requestDetails = ctx.details;
        let hard = ctx.query.hard === "true";
        let id = ctx.params.userId;
        let removedUser = await UserService.delete(id, hard, requestDetails);
        ctx.body = removedUser;
    }

    async setImage(ctx, next) {
        let requestDetails = ctx.details;
        let user: UserDocument = ctx.state.user;
        let image = ctx.state.fileUrl;
        let changes = {
            media: {
                profilePhoto: image
            }
        };
        let updatedUser = await UserService.update(user, changes, requestDetails);
        ctx.body = updatedUser;
        await next();
    }
}

let singleton = new UserController();

export default singleton;