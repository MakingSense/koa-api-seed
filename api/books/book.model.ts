import * as _ from "lodash";
import {Schema, Document, Model, model} from "mongoose";
import * as crypto from "crypto";
import {promisify} from "bluebird";
import * as timestamps from "mongoose-timestamp";
import config from "../../configs/config";

import {Logger} from "../shared/logger.service";

export declare interface BookJson {
    isbn: string;
    title: string;
    year: number;
    price: number;
    deletedAt: any;
}

export declare interface BookDocument extends BookJson, Document {
    toJSON(): BookJson;
}

export declare interface BookModel extends Model<BookDocument> {
    adminOnlyFields(): string[];
}

const validRoles = ["user", "admin"];


let pbkdf2Async: any = promisify(<any>crypto.pbkdf2);

let BookSchema = new Schema({
    isbn: {type: String, required: true},
    title: {type: String, required: true},
    year: {type: Number, default: null, required: true},
    price: {type: Number, default: null, required: true},
    deletedAt: Date
});

BookSchema.plugin(timestamps);


BookSchema.static("adminOnlyFields", function () {
});

BookSchema.static("validRoles", function () {
    return validRoles;
});

/**
 * Validations
 */


// Validate email is not taken
// BookSchema
//     .path("email")
//     .validate(async function (value, respond) {
//         let self = this;
//
//         //if the email field hasn't been touched, skip this validation
//         if (!this.isModified("email")) {
//             return respond(true);
//         }
//
//         let book = await this.constructor.findOne({email: value});
//
//         if (book) {
//             if (self.id === book.id) return respond(true);
//             return respond(false);
//         }
//
//         respond(true);
//     }, "The specified email address is already in use.");

let validatePresenceOf = function (value) {
    return value && value.length;
};

/**
 * Pre-save hook
 */
BookSchema
    .pre("save", function (next) {
        if (!this.isNew) {
            next();
            return;
        }

        next();
    });

/**
 * Pre-save hook
 */
// BookSchema
//     .pre("save", true, async function (next, done: any) {
//         next();
//     });

/**
 * Methods
 */
// BookSchema.methods = {
//
// };

BookSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        return ret;
    }
});

Logger.rewriters.push(function (level, msg, meta) {
    if (meta.book) {
        meta.book = _.pick(meta.book, "isbn", "title", "year", "price");
    }
    return meta;
});

let Book = model<BookDocument, BookModel>("Book", BookSchema);

export {Book};