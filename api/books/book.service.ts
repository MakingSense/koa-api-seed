import * as _ from "lodash";

import {Logger} from "../shared/logger.service";

import {DEFAULT_REQUEST_DETAILS} from "../../koa.config";
import {Book} from "./book.model";
import {ApiError} from "../errors/api-error.errors";
import {errors} from "../errors/errors";

class BookService {

    async create(bookData, details = DEFAULT_REQUEST_DETAILS) {
        let book = new Book(bookData);
        let savedBook = await book.save();
        Logger.log("info", "[BookService] [save]");
        let bookJson = savedBook.toJSON();
        Logger.log("info", "[BookService] [Create] book created successfully", {book: bookJson, details});
        return bookJson;
    }

    async findByIsbn(isbn, details = DEFAULT_REQUEST_DETAILS) {
        let book = await Book.findOne({isbn: isbn});
        if (!book) {
            return null;
        }

        if (book && book.deletedAt) {
            throw new ApiError(errors.generic.not_found);
        }

        Logger.log("info", "[BookService] [Find By Isbn] book retrieved successfully", {isbn, details});
        return book.toJSON();
    }

    async search(query: any = {}, details = DEFAULT_REQUEST_DETAILS) {
        let search: any = {};

        if (query.q) {
            search.$or = [
                {"title": {$regex: query.q, $options: "i"}},
                {"isbn": {$regex: query.q, $options: "i"}},
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

        let book = await Book.find(search).lean();

        return book;
    }

    async update(isbn, changes, details = DEFAULT_REQUEST_DETAILS) {
        let book = await Book.findOne({"isbn": isbn});

        if (!book) {
            throw new ApiError(errors.books.not_found);
        }

        book.set(changes);
        let savedUser = await book.save();
        Logger.log("info", "[BookService] [Update] book updated successfully", {user: savedUser, changes, details});
        return savedUser.toJSON();
    }

    async delete(isbn, details = DEFAULT_REQUEST_DETAILS) {
        let book = await Book.findOne({"isbn": isbn});
        book.deletedAt = new Date();
        let deletedBook = await book.save();
        Logger.log("info", "[BookService] [Delete] Admin soft-deleted book successfully", {book, details});
        return deletedBook.toJSON();
    }

    private sanitize(changes: any) {
        //noinspection TypeScriptUnresolvedFunction
        return _.omit(changes, Book.adminOnlyFields());
    }
}

let singleton = new BookService();
export default singleton;