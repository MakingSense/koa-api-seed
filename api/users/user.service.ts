import * as _ from "lodash";

import {UserEmailService} from "./user-email.service";
import {Logger} from "../shared/logger.service";

import {DEFAULT_REQUEST_DETAILS} from "../../koa.config";
import {User} from "./user.model";
import Auth0Service from "../auth/auth0.service";
import {ApiError} from "../errors/api-error.errors";
import {errors} from "../errors/errors";
import {ForgotPassword} from "./forgot-password-request.model";
import authService from "../auth/auth.service";
import * as request from "request-promise";

class UserService {


    async create(userData, details = DEFAULT_REQUEST_DETAILS) {
        let userToCreate = {
            "email": userData.email,
            "password": userData.password,
            "connection": "Username-Password-Authentication",
            // "user_metadata":
            //     {
            //         firstName: userData.firstName,
            //         lastName: userData.lastName
            //     },
            // "email_verified": false,
            "verify_email": false
        };

        Logger.log("info", "[UserService] [Create] sent to auth0", {user: userToCreate, details});
        let auth0user = await Auth0Service.register(userToCreate);

        if (auth0user) {
            Logger.log("info", "[UserService] [Create] created in auth0", {user: auth0user, details});
            let user = new User(userData);
            let savedUser = await user.save();
            let userJson = savedUser.toJSON();
            UserEmailService.sendSignUpSuccessful(user, details);
            Logger.log("info", "[UserService] [Create] user created successfully", {user: userJson, details});
            return userJson;
        }

    }

    async findById(id, details = DEFAULT_REQUEST_DETAILS) {
        let user = await User.findById(id);

        if (!user) {
            return null;
        }

        if (user && user.deletedAt && !details.isAdmin) {
            throw new ApiError(errors.generic.not_found);
        }

        Logger.log("info", "[UserService] [Find By Id] user retrieved successfully", {id, details});
        return user.toJSON();
    }

    async findByFacebookId(id, details = DEFAULT_REQUEST_DETAILS) {
        let user = await User.findOne({"facebook.id": id});
        if (!details.isAdmin && user && user.deletedAt) {
            throw new ApiError(errors.generic.not_found);
        }
        Logger.log("info", "[UserService] [Find By Facebook Id] user retrieved successfully", {id, details});
        return user.toJSON();
    }

    async findByEmail(email, details = DEFAULT_REQUEST_DETAILS) {
        let user = await User.findOne({email});
        if (!details.isAdmin && user && user.deletedAt) {
            throw new ApiError(errors.generic.not_found);
        }
        Logger.log("info", "[UserService] [Find By Email] user retrieved successfully", {email, details});
        return user.toJSON();
    }

    async search(query: any = {}, details = DEFAULT_REQUEST_DETAILS) {
        let search: any = {};

        if (query.q) {
            search.$or = [
                {"name.first": {$regex: query.q, $options: "i"}},
                {"name.last": {$regex: query.q, $options: "i"}},
                {"email": {$regex: query.q, $options: "i"}},
            ];
        }
        if (query.active === undefined) {
            query.active = "true";
        }

        if (query.active !== "both") {
            search.deletedAt = {$exists: query.active !== "true"};
        }

        if (query.active !== "true" && !details.isAdmin) {
            throw new ApiError(errors.generic.unauthorized);
        }

        let users = await User.find(search).lean();

        return users;
    }

    async update(id, changes, details = DEFAULT_REQUEST_DETAILS) {
        if (!details.isAdmin) {
            if (id !== details.user._id) {
                throw new ApiError(errors.generic.unauthorized);
            }
            changes = this.sanitize(changes);
        }

        let user = await User.findById(id);

        if (!user) {
            throw new ApiError(errors.users.not_found);
        }

        user.set(changes);
        let savedUser = await user.save();
        Logger.log("info", "[UserService] [Update] user updated successfully", {user: savedUser, changes, details});
        return savedUser.toJSON();
    }

    async delete(id, hard = false, details = DEFAULT_REQUEST_DETAILS) {
        if (!details.isAdmin) {
            if (id !== details.user._id.toString()) {
                Logger.log("error", "[UserService] [Delete] non admin tried to delete another user", {
                    id,
                    hard,
                    details
                });
                throw new ApiError(errors.generic.unauthorized);
            }
            let user = await User.findById(id);
            user.deletedAt = new Date();
            let deletedUser = await user.save();
            Logger.log("info", "[UserService] [Delete] User soft-deleted their account", {user, details});
            return deletedUser.toJSON();
        }
        if (hard) {
            let deletedUser = await User.findByIdAndRemove(id);
            Logger.log("info", "[UserService] [Delete] Admin hard-deleted user successfully", {
                user: deletedUser,
                details
            });
            return deletedUser;
        }
        let user = await User.findById(id);
        user.deletedAt = new Date();
        let deletedUser = await user.save();
        Logger.log("info", "[UserService] [Delete] Admin soft-deleted user successfully", {user, details});
        return deletedUser.toJSON();
    }

    async checkEmailAndPassword(email, password, details = DEFAULT_REQUEST_DETAILS) {
        let user = await User.findOne({email}).select("+hashedPassword +salt");
        if (!user) {
            Logger.log("error", "[UserService] [Check Credentials] User is not registered", {email, details});
            throw new ApiError(errors.generic.unauthenticated);
        }
        let valid = await user.authenticate(password);
        if (!valid) {
            Logger.log("error", "[UserService] [Check Credentials] User provided the wrong password", {email, details});
            throw new ApiError(errors.generic.unauthorized);
        }
        if (user.deletedAt) {
            Logger.log("error", "[UserService] [Check Credentials] User marked as deleted attempted to log in", {
                email,
                details
            });
            throw new ApiError(errors.users.user_deleted);
        }
        return user.toJSON();
    }

    async changePassword(id, oldPassword, newPassword, details = DEFAULT_REQUEST_DETAILS) {

        if (!details.isAdmin && id !== details.user._id.toString()) {
            Logger.log("error", "[UserService] [Change password] Non Admin User attempted to change somebody elses password", {
                id,
                details
            });
            throw new ApiError(errors.generic.unauthorized);
        }

        let user: any = await User.findById(id).select("+hashedPassword +salt");

        if (!user) {
            Logger.log("error", "[UserService] [Change password] User attempted to change their password but their user could not be retrieved", {
                id,
                details
            });
            throw new ApiError(errors.users.not_found);
        }

        let isPasswordValid = await user.authenticate(oldPassword);

        if (!isPasswordValid) {
            Logger.log("error", "[UserService] [Change password] User attempted to change their password but provided the wrong old password", {
                id,
                details
            });
            throw new ApiError(errors.generic.unauthorized);
        }

        if (!details.isAdmin && user.deletedAt) {
            Logger.log("error", "[UserService] [Change password] User marked as deleted attempted to change their password", {
                id,
                details
            });
            throw new ApiError(errors.generic.unauthorized);
        }

        user.password = newPassword;
        let savedUser = await user.save();
        Logger.log("info", "[UserService] [Change password] User changed their password successfully", {
            user: savedUser.toJSON(),
            details
        });
        UserEmailService.sendPasswordChanged(user, details);
        return savedUser;
    }

    async changePasswordByCode(code, newPassword, details = DEFAULT_REQUEST_DETAILS) {
        let forgotPassword: any = await this.findForgotPasswordByCode(code);

        if (!forgotPassword || !forgotPassword.isValid()) {
            Logger.log("error", "[UserService] [Change password] User provided an invalid code ", {
                code,
                forgotPassword,
                details
            });
            throw new ApiError(errors.users.invalid_forgot_password_code);
        }

        let user: any = await User.findById(forgotPassword.user.reference).select("+hashedPassword +salt");

        if (!user || user.deletedAt) {
            Logger.log("error", "[UserService] [Change password] User provided valid code but their user could not be found or has been deleted.", {
                forgotPassword,
                details
            });
            throw new ApiError(errors.generic.not_found);
        }

        await forgotPassword.use();
        user.password = newPassword;
        let savedUser = await user.save();
        Logger.log("info", "[UserService] [Change password] User reset their password successfully", {
            user: savedUser.toJSON(),
            details
        });
        UserEmailService.sendPasswordChanged(user, details);
        return savedUser;
    }


    async createForgotPassword(email, details = DEFAULT_REQUEST_DETAILS) {
        let user: any = await this.findByEmail(email, details);
        if (!user) {
            Logger.log("error", "[UserService] [Change password] Email provided to create a reset password request does not exist", {
                email,
                details
            });
            throw new ApiError(errors.users.not_found);
        }
        let forgotPassword: any = new ForgotPassword();
        forgotPassword.user = {
            reference: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };
        let forgotPassReq = await forgotPassword.save();
        UserEmailService.sendForgotPassword(user, forgotPassReq.code, details);
        Logger.log("info", "[UserService] [Change password] User created a reset password request successfully", {
            email,
            details
        });
        return forgotPassReq;
    }

    async updateForgotPassword(code, changes, details = DEFAULT_REQUEST_DETAILS) {
        if (!details.isAdmin) {
            Logger.log("error", "[UserService] [Change password] Non-Admin attempted to edit a reset password request", {
                code,
                changes,
                details
            });
            throw new ApiError(errors.generic.unauthorized);
        }
        let forgotPassword: any = await this.findForgotPasswordByCode(code);
        forgotPassword.set(changes);
        Logger.log("info", "[UserService] [Change password] Admin updated a reset password request successfully", {
            code,
            changes,
            details
        });
        return forgotPassword.save();
    }

    async findForgotPasswordByCode(code, details = DEFAULT_REQUEST_DETAILS) {
        return ForgotPassword.findOne({code});
    }


    private sanitize(changes: any) {
        //noinspection TypeScriptUnresolvedFunction
        return _.omit(changes, User.adminOnlyFields());
    }

}

let singleton = new UserService();
export default singleton;