import {
    getRandomBook,
    clearAllBooks, createBooks
} from "../../shared/tests/test.utils";

let app = require("../../../index");

/** External dependencies */
import * as requestPromise from "request-promise";

import {expect} from "chai";

import config from "../../../configs/config";

import bookService from "../book.service";
import * as fs from "fs";

const baseEndpoint = `${config.test.url}/api/books`;

let request = requestPromise.defaults({json: true});

describe("[API] [Books]", () => {

    describe("[CREATE]", () => {
        before(clearAllBooks);

        describe("[UNSUCCESSFUL]", () => {

            it("should not create a book without an title", async () => {
                let body = getRandomBook();
                delete body.title;
                try {
                    let savedBook = await request.post(baseEndpoint, {body});
                    expect(savedBook).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(400);
                }
            });

            it("should not create a book without a price", async () => {
                let body = getRandomBook();
                delete body.price;
                try {
                    let savedBook = await request.post(baseEndpoint, {body});
                    expect(savedBook).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(400);
                }
            });

            it("should not create a book without a year", async () => {
                let body = getRandomBook();
                delete body.year;
                try {
                    let savedBook = await request.post(baseEndpoint, {body});
                    expect(savedBook).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(400);
                }
            });
        });

        describe("[SUCCESSFUL]", () => {
            it("should create a book", async () => {
                let body = getRandomBook();
                let savedBook = await request.post(baseEndpoint, {body});
                expect(savedBook._id).to.exist;
                expect(savedBook.title).to.exist;
            });
        });

        after(clearAllBooks);

    });

    describe("[READ]", () => {

        let bookA, bookB, bookC;

        before(clearAllBooks);

        before(async () => {
            let books = await createBooks(3);
            bookA = books[0];
            bookB = books[1];
            bookC = books[2];
        });

        describe("[UNSUCCESSFUL]", () => {

            it("should return not found when access a nonexistent book", async () => {
                try {
                    let book = await request.get(`${baseEndpoint}/asd`);
                    expect(book).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });
        });

        describe("[SUCCESSFUL]", () => {
            it("should allow retrieve a book using their isbn", async () => {
                let book = await request.get(`${baseEndpoint}/${bookA.isbn.toString()}`);
                expect(book.isbn).to.eql(bookA.isbn.toString());
            });
        });

        after(clearAllBooks);

    });

    describe("[UPDATE]", () => {
        let bookA, bookB, bookC;

        before(clearAllBooks);

        before(async () => {
            let books = await createBooks(3);
            bookA = books[0];
            bookB = books[1];
            bookC = books[2];
        });

        describe("[UNSUCCESSFUL]", () => {

            it("should not let update a nonexistent book", async () => {
                let body = {
                    title: "yooo"
                };
                try {
                    let book = await request.put(`${baseEndpoint}/5833c13ba75cb3aa7b3d5570`, {body});
                    expect(book).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });
        });

        describe("[SUCCESSFUL]", () => {
            it("should update a book", async () => {
                let body = {
                    title: "Updated"
                };
                let book = await request.put(`${baseEndpoint}/${bookB.isbn.toString()}`, {body});
                expect(book.title).to.eql("Updated");

            });

            after(clearAllBooks);
        });
    });

    describe("[DELETE]", () => {
        let bookA, bookB, bookC;

        before(clearAllBooks);

        before(async () => {
            let books = await createBooks(3);
            bookA = books[0];
            bookB = books[1];
            bookC = books[2];

        });
        describe("[UNSUCCESSFUL]", () => {
            it("should return not found when access a nonexistent book", async () => {
                try {
                    let book = await request.delete(`${baseEndpoint}/asd`);
                    expect(book).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(404);
                }
            });
        });


        describe("[SUCCESSFUL]", () => {
            it("should allow delete a book", async () => {
                let deletedBook = await request.delete(`${baseEndpoint}/${bookA.isbn.toString()}`);
                expect(deletedBook).to.exist;
                try {
                    let book = await request.get(`${baseEndpoint}/${bookA.isbn.toString()}`);
                    expect(book).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });
        });
    });

    describe("[SEARCH]", () => {

        let bookA, bookB, bookC;

        before(clearAllBooks);

        before(async () => {
            let books = await createBooks(3);
            bookA = books[0];
            bookB = books[1];
            bookC = books[2];

        });

        describe("[UNSUCCESSFUL]", () => {

            it("should not allow search for deleted books", async () => {
                let qs = {
                    active: false
                };
                try {
                    let books = await request.get(baseEndpoint, {qs});
                    expect(books).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });
        });

        describe("[SUCCESSFUL]", () => {
            it("should allow search for books without any query", async () => {
                let books = await request.get(`${baseEndpoint}`);
                expect(books).to.have.length(3);
            });


            it("should allow search for books by title", async () => {
                let qs = {
                    q: "Harry"
                };
                let books = await request.get(`${baseEndpoint}`, {qs});
                expect(books).to.have.length(3);
            });
        });

        after(clearAllBooks);

    });
});
