import * as _ from "lodash";
import {Schema, Document, Model, model} from "mongoose";
import * as timestamps from "mongoose-timestamp";

import {Logger} from "../shared/logger.service";

export declare interface BookJson {
    isbn: string;
    title: string;
    year: number;
    price: number;
    deletedAt: any;
}

export declare interface BookDocument extends BookJson, Document {
}

export declare interface BookModel extends Model<BookDocument> {
}

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

Logger.rewriters.push(function (level, msg, meta) {
    if (meta.book) {
        meta.book = _.pick(meta.book, "isbn", "title", "year", "price");
    }
    return meta;
});

let Book = model<BookDocument, BookModel>("Book", BookSchema);

export {Book};