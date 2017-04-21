import * as _ from 'lodash';
import {Schema, Document, Model, model} from 'mongoose';
import * as crypto from 'crypto';
import {promisify} from 'bluebird';
import * as timestamps from 'mongoose-timestamp';
import config from "../../configs/config";

import {Logger} from "../shared/logger.service";

export declare interface UserJson {
    id: string;
    firstName: string;
    lastName: string;
    address: any;
    mobilePhone: string;
    homePhone: string;
    email: string;
    password: string;
    provider: string;
    media: {
        profilePhoto: string;
    };
    role: string;
    deletedAt: any;
    stats: any;
    token: any;
}

export declare interface UserDocument extends UserJson, Document {
    authenticate(plainText): boolean;
    makeSalt(): string;
    encryptPassword(password): string;
    toJSON(): UserJson;
}

export declare interface UserModel extends Model<UserDocument> {
    adminOnlyFields(): string[];
    validRoles(): string[];
}

const validRoles = ["user", "admin"];

const authTypes = ['github', 'twitter', 'facebook', 'google'];

let pbkdf2Async: any = promisify(<any>crypto.pbkdf2);

let UserSchema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    address: {
        line: String,
        line2: String,
        city: String,
        state: String,
        country: String,
    },
    mobilePhone: String,
    homePhone: String,
    email: {type: String, default: null},
    provider: String,
    role: {type: String, default: 'user'},
    google: {},
    facebook: {},
    media: {
        profilePhoto: String
    },
    stats: {
        lastLogin: Date,
        timesLoggedIn: {type: Number, default: 0}
    },
    hashedPassword: {type: String, select: false},
    salt: {type: String, select: false},
    deletedAt: Date
});

UserSchema.plugin(timestamps);


UserSchema.static('adminOnlyFields', function () {
    return ['salt', 'password', 'hashedPassword', 'role', 'provider'];
});

UserSchema.static("validRoles", function () {
    return validRoles;
});

/**
 * Virtuals
 */
UserSchema
    .virtual('password')
    .set(async function (password) {
        this._password = password;
        this.salt = this.makeSalt();
    })
    .get(function () {
        return this._password;
    });

// Public profile information
UserSchema
    .virtual('profile')
    .get(() => ({
        name: this.name,
        role: this.role
    }));

// Non-sensitive info we'll be putting in the token
UserSchema
    .virtual('token')
    .get(function () {
        return {
            '_id': this._id,
            'role': this.role,
            'firstName': this.firstName,
            'lastName': this.lastName
        }
    });

/**
 * Validations
 */

// Validate empty email
UserSchema
    .path('email')
    .validate(email => {
        //only required if user did not use oauth to signin/signup.
        if (authTypes.indexOf(this.provider) !== -1) {
            return true;
        }
        return email && email.length;
    }, 'Email cannot be blank');

// Validate empty password
UserSchema
    .path('hashedPassword')
    .validate(hashedPassword => {
        if (authTypes.indexOf(this.provider) !== -1) return true;
        return hashedPassword.length;
    }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
    .path('email')
    .validate(async function (value, respond) {
        let self = this;

        //if the email field hasn't been touched, skip this validation
        if (!this.isModified('email')) {
            return respond(true);
        }

        let user = await this.constructor.findOne({email: value});

        if (user) {
            if (self.id === user.id) return respond(true);
            return respond(false);
        }

        respond(true);
    }, 'The specified email address is already in use.');

let validatePresenceOf = function (value) {
    return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', function (next) {
        if (!this.isNew) {
            next();
            return;
        }

        if (!validatePresenceOf(this._password) && authTypes.indexOf(this.provider) === -1) {
            return next(this.invalidate('hashedPassword', 'A password must be set', undefined));
        }

        next();
    });

/**
 * Pre-save hook
 */
UserSchema
    .pre('save', true, async function (next, done) {
        if (!this._password) {
            next();
            return done();
        }
        next();
        try {
            let encryptedPassword = await this.encryptPassword(this._password);
            this.hashedPassword = encryptedPassword;
            done();
        } catch (e) {
            done(e);
        }
    });

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: async function (plainText) {
        let encryptedPassword = await this.encryptPassword(plainText);
        return encryptedPassword === this.hashedPassword;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function () {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Encrypt password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    encryptPassword: async function (password) {
        if (!password || !this.salt) return '';
        let salt = new Buffer(this.salt, 'base64');
        let encrypted = await pbkdf2Async(password, salt, config.iterations, 64, 'sha512');
        return encrypted.toString('base64');
    }

};

UserSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret.hashedPassword;
        delete ret.salt;
        return ret;
    }
});

Logger.rewriters.push(function (level, msg, meta) {
    if (meta.user) {
        meta.user = _.pick(meta.user, "_id", "firstName", "lastName", "email", "role");
    }
    return meta;
});

let User = model<UserDocument, UserModel>("User", UserSchema);

export {User};