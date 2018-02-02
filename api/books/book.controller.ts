import BookService from "./book.service";
import {ApiError} from "../errors/api-error.errors";
import {errors} from "../errors/errors";
import {Logger} from "../shared/logger.service";
import {Book} from "./book.model";


class BookController {

    // async loadBook(id, ctx, next) {
    //     let requestDetails = ctx.details;
    //
    //     if (id === "me" && ctx.state.user) {
    //         id = new ObjectID(ctx.state.user._id);
    //     }
    //
    //     if (!ObjectID.isValid(id)) {
    //         return;
    //     }
    //
    //     let user = await BookService.findById(id, requestDetails);
    //     ctx.state.user = user;
    //     await next();
    // }

    async show(ctx, next) {
        let book = await BookService.findByIsbn(ctx.params.isbn);
        if (!book) {
            throw new ApiError(errors.books.not_found);
        }
        ctx.body = book;
    }

    async search(ctx, next) {
        let requestDetails = ctx.details;
        let query = ctx.request.query;
        let results = await BookService.search(query, requestDetails);
        ctx.body = results;
    }

    async create(ctx, next) {
        let requestDetails = ctx.details;
        let bookData = ctx.request.body;
        let createdBook = await BookService.create(bookData, requestDetails);
        ctx.body = createdBook;
    }

    async update(ctx, next) {
        let requestDetails = ctx.details;
        let changes = ctx.request.body;
        let isbn = ctx.params.isbn;
        let updatedUser = await BookService.update(isbn, changes, requestDetails);
        ctx.body = updatedUser;
    }

    async delete(ctx, next) {
        let requestDetails = ctx.details;
        let isbn = ctx.params.isbn;
        let removedUser = await BookService.delete(isbn, requestDetails);
        ctx.body = removedUser;
    }
}

let singleton = new BookController();

export default singleton;