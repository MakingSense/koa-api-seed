import * as _ from "lodash";
import * as request from "request-promise";
import * as mongoose from "mongoose";

import {getRandomUser} from "./fixtures/user.fixture";
import {getRandomBook} from "./fixtures/book.fixture";

import userService from "../../users/user.service";
import booksService from "../../books/book.service";
import authService from "../../auth/auth.service";
import {ForgotPassword} from "../../users/forgot-password-request.model";
import * as path from "path";
import {Book} from "../../books/book.model";

let User = mongoose.model("User");

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let createUser = async (isAdmin = false, props = {}) => {
    let userProps = Object.assign({}, props, {role: isAdmin ? "admin" : "user"});
    let userData = getRandomUser(userProps);
    return userService.create(userData);
};

let createUsers = async (number, createAdmin = false) => {
    let users = [];
    if (createAdmin) {
        number = number - 1;
        users.push(await createUser(true));
    }
    _.times(number, (n) => {
        users.push(createUser())
    });
    return await Promise.all(users);
};

let clearAllUsers = async () => await User.remove({});

let createBook = async ( props = {}) => {
    let bookProps = Object.assign({}, props);
    let bookData = getRandomBook(bookProps);
    return booksService.create(bookData);
};

let createBooks = async (number) => {
    let books = [];
    _.times(number, (n) => {
        books.push(createBook());
    });
    return await Promise.all(books);
};

let clearAllBooks = async () => await Book.remove({});

let clearAllForgotPassword = async () => await ForgotPassword.remove({});

let getHttpClientFromUser = async (user?) => {
    if (!user) {
        return request.defaults({json: true});
    }
    let token = await authService.signToken(user);
    return request.defaults({
        headers: {
            Authorization: `Bearer ${token}`
        },
        json: true
    });
};


let imagesPaths = {
    users: {
        correct: path.resolve(__dirname + "/media/image_correct.jpg"),
        large: path.resolve(__dirname + "/media/image_large.jpg")
    }
};


export {
    imagesPaths,
    getRandomInt,
    getRandomUser,
    getRandomBook,
    createUser,
    createUsers,
    createBook,
    createBooks,
    clearAllUsers,
    clearAllBooks,
    clearAllForgotPassword,
    getHttpClientFromUser,
};