import * as mongoose from 'mongoose';
import * as timestamps from 'mongoose-timestamp';
import * as crypto from 'crypto';
import * as moment from 'moment';
import {promisify} from 'bluebird';
import {Schema} from 'mongoose';
import * as base64url from 'base64-url';

import config from '../../configs/config';

let pbkdf2Async: any = promisify(<any>crypto.pbkdf2);

let ForgotPasswordSchema = new mongoose.Schema({
    user: {
        reference: {type: Schema.Types.ObjectId, ref: 'User'},
        firstName: String,
        lastName: String,
        email: String
    },
    code: String,
    validUntil: Date,
    usedOn: Date,
    status: {type: String, enum: ['used', 'valid', 'invalid'], default: 'valid'}
});

ForgotPasswordSchema.plugin(timestamps);

ForgotPasswordSchema.methods = {
    isValid: function () {
        return moment() < moment(this.validUntil) && this.status === 'valid';
    },

    use: async function () {
        if (!this.isValid()) {
            throw new Error('Invalid Forgot Password request');
        }
        this.usedOn = moment().toDate();
        this.status = 'used';
        return this.save();
    },

    /**
     * Make Code
     *
     * @return {String}
     * @api public
     */
    makeCode: function () {
        return base64url.encode(crypto.randomBytes(32));
    },
};

ForgotPasswordSchema.pre('save', true, async function (next, done) {
    if (!this.isModified('user')) {
        next();
        done();
        return;
    }

    if (!this.user.reference) {
        return next(this.invalidate('A user needs to be set for a forgot password request'));
    }

    next();
    let User = mongoose.model('User');
    try {
        let user: any = await User.findById(this.user.reference);
        this.user.firstName = user.firstName;
        this.user.lastName = user.lastName;
        this.user.email = user.email;
        done();
    } catch (e) {
        done(e);
    }
});

ForgotPasswordSchema.pre('save', function (next) {
    if (!this.validUntil) {
        this.validUntil = moment().add(config.forgotPassword.duration.amount, config.forgotPassword.duration.unit).toDate();
    }
    next();
});

ForgotPasswordSchema.pre('save', function (next) {
    if (!this.code) {
        this.code = this.makeCode();
    }
    next();
});

ForgotPasswordSchema.post('init', async function (doc: any, next) {
    let hasExpired = doc.validUntil < new Date();
    if (hasExpired && doc.status === 'valid') {
        doc.status = 'invalid';
        await doc.save();
        next();
    }
    next();
});

let ForgotPassword = mongoose.model('ForgotPassword', ForgotPasswordSchema);

export {ForgotPassword};