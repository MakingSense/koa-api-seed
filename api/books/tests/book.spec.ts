import {
    getRandomBook,
    clearAllBooks, clearAllBooks, createBooks, getHttpClientFromBook,
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
                    let request = await getHttpClientFromBook(bookA);
                    let book = await request.get(`${baseEndpoint}/asd`);
                    expect(book).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });
            

        describe("[SUCCESSFUL]", () => {
            it("should allow retrieve a book using their isbn", async () => {
                let request = await getHttpClientFromBook(bookA);
                let book = await request.get(`${baseEndpoint}/${bookA.isbn.toString()}`);
                expect(book.isbn).to.eql(bookA.isbn.toString());
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
                let request = await getHttpClientFromBook(bookA);
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
    //
    //         it("should not let an authenticated book change their password through this endpoint", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let oldPassword = "Test#1234";
    //             let newPassword = "asd123";
    //             let body = {
    //                 password: newPassword
    //             };
    //             let book = await request.put(`${baseEndpoint}/${bookA._id.toString()}`, {body});
    //
    //             //make sure pass not changed
    //             await userService.checkEmailAndPassword(bookA.email, oldPassword);
    //         });
    //
    //         it("should not let an authenticated book change their role", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let body = {
    //                 role: "admin"
    //             };
    //             let book = await request.put(`${baseEndpoint}/${bookA._id.toString()}`, {body});
    //             expect(book.role).to.eql("book");
    //         });
    //
    //         it(`should not let an admin update a nonexistent book`, async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let body = {
    //                 firstName: "ASD name"
    //             };
    //             try {
    //                 let book = await request.put(`${baseEndpoint}/5833c13ba75cb3aa7b3d5570`, {body});
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(404);
    //             }
    //         });
    //
    //     });
    //
    //     describe("[SUCCESSFUL]", () => {
    //         it("should let a book change their name", async () => {
    //             let request = await getHttpClientFromBook(bookB);
    //             let body = {
    //                 firstName: "Updated"
    //             };
    //             let book = await request.put(`${baseEndpoint}/${bookB._id.toString()}`, {body});
    //             expect(book.firstName).to.eql("Updated");
    //
    //         });
    //
    //         it("should let an admin book change another book data", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let body = {
    //                 firstName: "Updated"
    //             };
    //             let book = await request.put(`${baseEndpoint}/${bookB._id.toString()}`, {body});
    //             expect(book.firstName).to.eql("Updated");
    //         });
    //     });
    //
    //     after(clearAllBooks);
    //
    // });
    //
    // describe("[PASSWORD UPDATE]", () => {
    //     let bookA, bookB, userC, admin;
    //
    //     before(clearAllBooks);
    //
    //     before(async () => {
    //         let books = await createBooks(3, true);
    //         admin = books[0];
    //         bookA = books[1];
    //         bookB = books[2];
    //         userC = await createUser(false, {deletedAt: new Date()});
    //     });
    //
    //     describe("[UNSUCCESSFUL]", () => {
    //         it(`should not let an unauthenticated book update an existing book's password`, async () => {
    //             let body = {
    //                 oldPassword: "Test#1234",
    //                 newPassword: "Asd123"
    //             };
    //             try {
    //                 let book = await request.put(`${baseEndpoint}/${bookA._id.toString()}/password`, {body});
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(401);
    //             }
    //         });
    //
    //         it("should not let an authenticated book update another book's password", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let body = {
    //                 oldPassword: "Test#1234",
    //                 newPassword: "Asd123"
    //             };
    //             try {
    //                 let book = await request.put(`${baseEndpoint}/${bookB._id.toString()}/password`, {body});
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(403);
    //             }
    //         });
    //
    //         it("should not let an authenticated book update a nonexistent book", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let body = {
    //                 oldPassword: "Test#1234",
    //                 newPassword: "Asd123"
    //             };
    //             try {
    //                 let book = await request.put(`${baseEndpoint}/5833c13ba75cb3aa7b3d5570`, {body});
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(403);
    //             }
    //         });
    //
    //         it("should not let an authenticated book change their password if their old pass is not correct", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let body = {
    //                 oldPassword: "wrong_password",
    //                 newPassword: "Asd123"
    //             };
    //
    //             try {
    //                 let book = await request.put(`${baseEndpoint}/${bookA._id.toString()}/password`, {body});
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(403);
    //             }
    //         });
    //
    //         it("should not let a deleted book change their password", async () => {
    //             let request = await getHttpClientFromBook(userC);
    //             let body = {
    //                 oldPassword: "Test#1234",
    //                 newPassword: "Asd123"
    //             };
    //             try {
    //                 let book = await request.put(`${baseEndpoint}/${userC._id.toString()}/password`, {body});
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(403);
    //             }
    //         });
    //
    //         it(`should not let an admin update a nonexistent book's password`, async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let body = {
    //                 oldPassword: "Test#1234",
    //                 newPassword: "Asd123"
    //             };
    //             try {
    //                 let book = await request.put(`${baseEndpoint}/5833c13ba75cb3aa7b3d5570/password`, {body});
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(404);
    //             }
    //         });
    //
    //     });
    //
    //     describe("[SUCCESSFUL]", () => {
    //         it("should not let an authenticated book change their password if they send the correct old one", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let oldPassword = "Test#1234";
    //             let newPassword = "Asd123";
    //             let body = {
    //                 oldPassword: oldPassword,
    //                 newPassword: newPassword
    //             };
    //             await request.put(`${baseEndpoint}/${bookA._id.toString()}/password`, {body});
    //             await userService.checkEmailAndPassword(bookA.email, newPassword);
    //         });
    //     });
    //     after(clearAllBooks);
    // });
    // describe("[DELETE]", () => {
    //     let bookA, bookB, userC, userD, admin;
    //
    //     before(clearAllBooks);
    //
    //     before(async () => {
    //         let books = await createBooks(5, true);
    //         admin = books[0];
    //         bookA = books[1];
    //         bookB = books[2];
    //         userC = books[3];
    //         userD = books[4];
    //     });
    //     describe("[UNSUCCESSFUL]", () => {
    //         it("should not allow an unauthenticated book to delete himself", async () => {
    //             try {
    //                 let books = await request.delete(`${baseEndpoint}/me`);
    //                 expect(books).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(401);
    //             }
    //         });
    //
    //         it("should not allow an authenticated book to delete an existent book", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             try {
    //                 let book = await request.delete(`${baseEndpoint}/${bookB}`);
    //                 expect(book).not.to.exist;
    //             } catch (err) {
    //                 expect(err.statusCode).to.eql(403);
    //             }
    //         });
    //
    //         it("should not allow an authenticated book to do a hard delete", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             try {
    //                 let book = await request.delete(`${baseEndpoint}/${bookB}?hard=true`);
    //                 expect(book).not.to.exist;
    //             } catch (err) {
    //                 expect(err.statusCode).to.eql(403);
    //             }
    //         });
    //     });
    //
    //     describe("[SUCCESSFUL]", () => {
    //         it("should allow an authenticated book to soft delete himself", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let deletedUser = await request.delete(`${baseEndpoint}/${bookA._id.toString()}`);
    //             expect(deletedUser).to.exist;
    //             try {
    //                 let book = await request.get(`${baseEndpoint}/${bookA._id.toString()}`);
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(404);
    //             }
    //         });
    //
    //         it("should allow an admin to soft delete a book", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let deletedUser = await request.delete(`${baseEndpoint}/${bookB._id.toString()}`);
    //             try {
    //                 let request = await getHttpClientFromBook(userC);
    //                 let book = await request.get(`${baseEndpoint}/${bookB._id.toString()}`);
    //                 expect(book).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(404);
    //             }
    //         });
    //
    //         it("should allow an admin to hard delete a book", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let deletedUser = await request.delete(`${baseEndpoint}/${userC._id.toString()}?hard=true`);
    //             try {
    //                 let book = await request.get(`${baseEndpoint}/${userC._id.toString()}`);
    //                 expect(book).not.to.exist;
    //                 expect(book._id).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(404);
    //             }
    //         });
    //
    //     });
    // });
    //
    // describe("[SEARCH]", () => {
    //
    //     let bookA, bookB, userC, admin;
    //
    //     before(clearAllBooks);
    //
    //     before(async () => {
    //         admin = await createUser(true, {firstName: "Admin", email: "admin@admins.com"});
    //         bookA = await createUser(false, {firstName: "bookA", email: "bookA@book.com"});
    //         bookB = await createUser(false, {firstName: "bookB", email: "bookB@book.com"});
    //         userC = await createUser(false, {firstName: "UserC", email: "userC@book.com", deletedAt: new Date()});
    //     });
    //
    //     describe("[UNSUCCESSFUL]", () => {
    //         it("should not allow unauthenticated books to fetch all books", async () => {
    //             try {
    //                 let books = await request.get(baseEndpoint);
    //                 expect(books).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(401);
    //             }
    //         });
    //         it("should not allow regular books to search for deleted books", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let qs = {
    //                 active: false
    //             };
    //             try {
    //                 let books = await request.get(baseEndpoint, {qs});
    //                 expect(books).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(403);
    //             }
    //         });
    //         it("should not allow regular books to search for deleted & active books", async () => {
    //             let request = await getHttpClientFromBook(bookA);
    //             let qs = {
    //                 active: "both"
    //             };
    //             try {
    //                 let books = await request.get(baseEndpoint, {qs});
    //                 expect(books).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(403);
    //             }
    //         });
    //
    //     });
    //
    //     describe("[SUCCESSFUL]", () => {
    //         it("should allow an admin book to search for books without any query", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let books = await request.get(`${baseEndpoint}`);
    //             expect(books).to.have.length(3);
    //         });
    //
    //         it("should allow an admin book to search for active & inactive books without any query", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let qs = {
    //                 active: "both"
    //             };
    //             let books = await request.get(`${baseEndpoint}`, {qs});
    //             expect(books).to.have.length(4);
    //         });
    //
    //         it("should allow an admin book to search for books by name", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let qs = {
    //                 q: "admin"
    //             };
    //             let books = await request.get(`${baseEndpoint}`, {qs});
    //             expect(books).to.have.length(1);
    //         });
    //
    //         it("should allow an admin book to search books by a partial name", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let qs = {
    //                 q: "rB"
    //             };
    //             let books = await request.get(`${baseEndpoint}`, {qs});
    //             expect(books).to.have.length(1);
    //         });
    //
    //         it("should ignore deleted books by default", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let qs = {
    //                 q: "erC"
    //             };
    //             let books = await request.get(`${baseEndpoint}`, {qs});
    //             expect(books).to.have.length(0);
    //         });
    //
    //         it("should allow an admin to search for deleted books", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let qs = {
    //                 q: "erC",
    //                 active: false
    //             };
    //             let books = await request.get(`${baseEndpoint}`, {qs});
    //             expect(books).to.have.length(1);
    //         });
    //     });
    //
    //     after(clearAllBooks);
    //
    // });
    //
    // describe("[SET IMAGE]", () => {
    //     let book, admin;
    //
    //     before(clearAllBooks);
    //
    //     before(async () => {
    //         book = await createUser();
    //         admin = await createUser(true);
    //     });
    //
    //     describe("[UNSUCCESSFUL]", () => {
    //         it("should not let an unauthenticated book set a profile picture", async () => {
    //             let formData = {
    //                 image: fs.createReadStream(imagesPaths.books.correct)
    //             };
    //             try {
    //                 let updatedUser = await request.post(`${baseEndpoint}/${book._id}/image`, {formData});
    //                 expect(updatedUser).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(401);
    //             }
    //         });
    //
    //         it("should not let an admin upload a image larger than allowed", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let formData = {
    //                 image: fs.createReadStream(imagesPaths.books.large)
    //             };
    //             try {
    //                 let updatedUser = await request.post(`${baseEndpoint}/${book._id}/image`, {formData});
    //                 expect(updatedUser).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(400);
    //             }
    //         });
    //
    //         it("should not let an admin upload a image in another field", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let formData = {
    //                 another: fs.createReadStream(imagesPaths.books.correct)
    //             };
    //             try {
    //                 let updatedUser = await request.post(`${baseEndpoint}/${book._id}/image`, {formData});
    //                 expect(updatedUser).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(400);
    //             }
    //         });
    //
    //         it("should not let an admin upload a file with the wrong mime type", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let formData = {
    //                 image: fs.createReadStream(__dirname + "/../book.controller.js")
    //             };
    //             try {
    //                 let updatedUser = await request.post(`${baseEndpoint}/${book._id}/image`, {formData});
    //                 expect(updatedUser).not.to.exist;
    //             } catch (e) {
    //                 expect(e.statusCode).to.eql(400);
    //             }
    //         });
    //     });
    //
    //     describe("[SUCCESSFUL]", () => {
    //         it("should let a book update their profile picture", async () => {
    //             let request = await getHttpClientFromBook(admin);
    //             let formData = {
    //                 image: fs.createReadStream(imagesPaths.books.correct)
    //             };
    //             let updatedUser = await request.post(`${baseEndpoint}/${book._id}/image`, {formData});
    //             expect(updatedUser.media.profilePhoto).not.to.be.empty;
    //         });
    //     });
    //
    // });

});