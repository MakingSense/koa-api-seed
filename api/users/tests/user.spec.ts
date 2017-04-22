import {
    getRandomUser,
    clearAllUsers,
    getHttpClientFromUser,
    createUsers, createUser, imagesPaths
} from "../../shared/tests/test.utils";

let app = require("../../../index");

/** External dependencies */
import * as requestPromise from "request-promise";

import {expect} from "chai";

import config from "../../../configs/config";

import userService from "../user.service";
import * as fs from "fs";

const baseEndpoint = `${config.test.url}/api/users`;

let request = requestPromise.defaults({json: true});

describe("[API] [Users]", () => {

    describe("[CREATE]", () => {
        before(clearAllUsers);

        describe("[UNSUCCESSFUL]", () => {

            it("should not create a user without an email", async () => {
                let body = getRandomUser();
                delete body.email;
                try {
                    let savedUser = await request.post(baseEndpoint, {body});
                    expect(savedUser).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(400);
                }
            });

            it("should not create a user without a password", async () => {
                let body = getRandomUser();
                delete body.password;
                try {
                    let savedUser = await request.post(baseEndpoint, {body});
                    expect(savedUser).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(400);
                }
            });

            it("should not create a user without a first name", async () => {
                let body = getRandomUser();
                delete body.firstName;
                try {
                    let savedUser = await request.post(baseEndpoint, {body});
                    expect(savedUser).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(400);
                }
            });

            it("should not create a user without a last name", async () => {
                let body = getRandomUser();
                delete body.lastName;
                try {
                    let savedUser = await request.post(baseEndpoint, {body});
                    expect(savedUser).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(400);
                }
            });

        });

        describe("[SUCCESSFUL]", () => {
            it("should create a user", async () => {
                let body = getRandomUser();
                let savedUser = await request.post(baseEndpoint, {body});
                expect(savedUser._id).to.exist;
                expect(savedUser.hashedPassword).not.to.exist;
                expect(savedUser._password).not.to.exist;
                expect(savedUser.salt).not.to.exist;
            });
        });

        after(clearAllUsers);

    });

    describe("[READ]", () => {

        let userA, userB, admin;

        before(clearAllUsers);

        before(async () => {
            let users = await createUsers(3, true);
            admin = users[0];
            userA = users[1];
            userB = users[2];
        });

        describe("[UNSUCCESSFUL]", () => {
            it("should not allow unauthenticated users to fetch all users", async () => {
                try {
                    let users = await request.get(baseEndpoint);
                    expect(users).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not allow unauthenticated users to retrieve an existing user", async () => {
                try {
                    let user = await request.get(`${baseEndpoint}/${userB._id.toString()}`);
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not allow unauthenticated users to retrieve a nonexistent user", async () => {
                try {
                    let user = await request.get(`${baseEndpoint}/asd`);
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not allow unauthenticated users to retrieve themselves", async () => {
                try {
                    let user = await request.get(`${baseEndpoint}/me`);
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not allow authenticated users retrieve their user hashedPassword & salt", async () => {
                let request = await getHttpClientFromUser(userA);
                let user = await request.get(`${baseEndpoint}/${userA._id.toString()}`);
                expect(user._password).not.to.exist;
                expect(user.hashedPassword).not.to.exist;
                expect(user.salt).not.to.exist;
            });

            it("should return not found when an authenticated user tries to access a nonexistent user", async () => {
                try {
                    let request = await getHttpClientFromUser(userA);
                    let user = await request.get(`${baseEndpoint}/asd`);
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });

            it("should return not found when an authenticated user tries to access a nonexistent user", async () => {
                try {
                    let request = await getHttpClientFromUser(userA);
                    let user = await request.get(`${baseEndpoint}/583377a68d9ad481117851db`);
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });

            it("should not allow authenticated users to retrieve another user hashedPassword & salt", async () => {
                let request = await getHttpClientFromUser(userA);
                let user = await request.get(`${baseEndpoint}/${userB._id.toString()}`);
                expect(user._password).not.to.exist;
                expect(user.hashedPassword).not.to.exist;
                expect(user.salt).not.to.exist;
            });
        });

        describe("[SUCCESSFUL]", () => {
            it("should allow a user to retrieve their profile using their id", async () => {
                let request = await getHttpClientFromUser(userA);
                let user = await request.get(`${baseEndpoint}/${userA._id.toString()}`);
                expect(user._id).to.eql(userA._id.toString());
            });

            it("should allow a user to retrieve their profile using \"me\"", async () => {
                let request = await getHttpClientFromUser(userA);
                let user = await request.get(`${baseEndpoint}/me`);
                expect(user._id).to.eql(userA._id.toString());
            });
        });

        after(clearAllUsers);

    });

    describe("[UPDATE]", () => {
        let userA, userB, admin;

        before(clearAllUsers);

        before(async () => {
            let users = await createUsers(3, true);
            admin = users[0];
            userA = users[1];
            userB = users[2];
        });

        describe("[UNSUCCESSFUL]", () => {
            it("should not let an unauthenticated user update an existing user", async () => {
                let body = {
                    firstName: "yooo"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/${userA._id.toString()}`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not let an authenticated user update a user other than themselves", async () => {
                let request = await getHttpClientFromUser(userA);
                let body = {
                    firstName: "yooo"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/${userB._id.toString()}`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });

            it("should not let an authenticated user update a nonexistent user", async () => {
                let request = await getHttpClientFromUser(userA);
                let body = {
                    firstName: "yooo"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/5833c13ba75cb3aa7b3d5570`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });

            it("should not let an authenticated user change their password through this endpoint", async () => {
                let request = await getHttpClientFromUser(userA);
                let oldPassword = "Test#1234";
                let newPassword = "asd123";
                let body = {
                    password: newPassword
                };
                let user = await request.put(`${baseEndpoint}/${userA._id.toString()}`, {body});

                //make sure pass not changed
                await userService.checkEmailAndPassword(userA.email, oldPassword);
            });

            it("should not let an authenticated user change their role", async () => {
                let request = await getHttpClientFromUser(userA);
                let body = {
                    role: "admin"
                };
                let user = await request.put(`${baseEndpoint}/${userA._id.toString()}`, {body});
                expect(user.role).to.eql("user");
            });

            it(`should not let an admin update a nonexistent user`, async () => {
                let request = await getHttpClientFromUser(admin);
                let body = {
                    firstName: "ASD name"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/5833c13ba75cb3aa7b3d5570`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });

        });

        describe("[SUCCESSFUL]", () => {
            it("should let a user change their name", async () => {
                let request = await getHttpClientFromUser(userB);
                let body = {
                    firstName: "Updated"
                };
                let user = await request.put(`${baseEndpoint}/${userB._id.toString()}`, {body});
                expect(user.firstName).to.eql("Updated");

            });

            it("should let an admin user change another user data", async () => {
                let request = await getHttpClientFromUser(admin);
                let body = {
                    firstName: "Updated"
                };
                let user = await request.put(`${baseEndpoint}/${userB._id.toString()}`, {body});
                expect(user.firstName).to.eql("Updated");
            });
        });

        after(clearAllUsers);

    });

    describe("[PASSWORD UPDATE]", () => {
        let userA, userB, userC, admin;

        before(clearAllUsers);

        before(async () => {
            let users = await createUsers(3, true);
            admin = users[0];
            userA = users[1];
            userB = users[2];
            userC = await createUser(false, {deletedAt: new Date()});
        });

        describe("[UNSUCCESSFUL]", () => {
            it(`should not let an unauthenticated user update an existing user's password`, async () => {
                let body = {
                    oldPassword: "Test#1234",
                    newPassword: "Asd123"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/${userA._id.toString()}/password`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not let an authenticated user update another user's password", async () => {
                let request = await getHttpClientFromUser(userA);
                let body = {
                    oldPassword: "Test#1234",
                    newPassword: "Asd123"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/${userB._id.toString()}/password`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });

            it("should not let an authenticated user update a nonexistent user", async () => {
                let request = await getHttpClientFromUser(userA);
                let body = {
                    oldPassword: "Test#1234",
                    newPassword: "Asd123"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/5833c13ba75cb3aa7b3d5570`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });

            it("should not let an authenticated user change their password if their old pass is not correct", async () => {
                let request = await getHttpClientFromUser(userA);
                let body = {
                    oldPassword: "wrong_password",
                    newPassword: "Asd123"
                };

                try {
                    let user = await request.put(`${baseEndpoint}/${userA._id.toString()}/password`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });

            it("should not let a deleted user change their password", async () => {
                let request = await getHttpClientFromUser(userC);
                let body = {
                    oldPassword: "Test#1234",
                    newPassword: "Asd123"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/${userC._id.toString()}/password`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });

            it(`should not let an admin update a nonexistent user's password`, async () => {
                let request = await getHttpClientFromUser(admin);
                let body = {
                    oldPassword: "Test#1234",
                    newPassword: "Asd123"
                };
                try {
                    let user = await request.put(`${baseEndpoint}/5833c13ba75cb3aa7b3d5570/password`, {body});
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });

        });

        describe("[SUCCESSFUL]", () => {
            it("should not let an authenticated user change their password if they send the correct old one", async () => {
                let request = await getHttpClientFromUser(userA);
                let oldPassword = "Test#1234";
                let newPassword = "Asd123";
                let body = {
                    oldPassword: oldPassword,
                    newPassword: newPassword
                };
                await request.put(`${baseEndpoint}/${userA._id.toString()}/password`, {body});
                await userService.checkEmailAndPassword(userA.email, newPassword);
            });
        });
        after(clearAllUsers);
    });
    describe("[DELETE]", () => {
        let userA, userB, userC, userD, admin;

        before(clearAllUsers);

        before(async () => {
            let users = await createUsers(5, true);
            admin = users[0];
            userA = users[1];
            userB = users[2];
            userC = users[3];
            userD = users[4];
        });
        describe("[UNSUCCESSFUL]", () => {
            it("should not allow an unauthenticated user to delete himself", async () => {
                try {
                    let users = await request.delete(`${baseEndpoint}/me`);
                    expect(users).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not allow an authenticated user to delete an existent user", async () => {
                let request = await getHttpClientFromUser(userA);
                try {
                    let user = await request.delete(`${baseEndpoint}/${userB}`);
                    expect(user).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(403);
                }
            });

            it("should not allow an authenticated user to do a hard delete", async () => {
                let request = await getHttpClientFromUser(userA);
                try {
                    let user = await request.delete(`${baseEndpoint}/${userB}?hard=true`);
                    expect(user).not.to.exist;
                } catch (err) {
                    expect(err.statusCode).to.eql(403);
                }
            });
        });

        describe("[SUCCESSFUL]", () => {
            it("should allow an authenticated user to soft delete himself", async () => {
                let request = await getHttpClientFromUser(userA);
                let deletedUser = await request.delete(`${baseEndpoint}/${userA._id.toString()}`);
                expect(deletedUser).to.exist;
                try {
                    let user = await request.get(`${baseEndpoint}/${userA._id.toString()}`);
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });

            it("should allow an admin to soft delete a user", async () => {
                let request = await getHttpClientFromUser(admin);
                let deletedUser = await request.delete(`${baseEndpoint}/${userB._id.toString()}`);
                try {
                    let request = await getHttpClientFromUser(userC);
                    let user = await request.get(`${baseEndpoint}/${userB._id.toString()}`);
                    expect(user).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });

            it("should allow an admin to hard delete a user", async () => {
                let request = await getHttpClientFromUser(admin);
                let deletedUser = await request.delete(`${baseEndpoint}/${userC._id.toString()}?hard=true`);
                try {
                    let user = await request.get(`${baseEndpoint}/${userC._id.toString()}`);
                    expect(user).not.to.exist;
                    expect(user._id).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
            });

        });
    });

    describe("[SEARCH]", () => {

        let userA, userB, userC, admin;

        before(clearAllUsers);

        before(async () => {
            admin = await createUser(true, {firstName: "Admin", email: "admin@admins.com"});
            userA = await createUser(false, {firstName: "UserA", email: "userA@user.com"});
            userB = await createUser(false, {firstName: "UserB", email: "userB@user.com"});
            userC = await createUser(false, {firstName: "UserC", email: "userC@user.com", deletedAt: new Date()});
        });

        describe("[UNSUCCESSFUL]", () => {
            it("should not allow unauthenticated users to fetch all users", async () => {
                try {
                    let users = await request.get(baseEndpoint);
                    expect(users).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });
            it("should not allow regular users to search for deleted users", async () => {
                let request = await getHttpClientFromUser(userA);
                let qs = {
                    active: false
                };
                try {
                    let users = await request.get(baseEndpoint, {qs});
                    expect(users).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });
            it("should not allow regular users to search for deleted & active users", async () => {
                let request = await getHttpClientFromUser(userA);
                let qs = {
                    active: "both"
                };
                try {
                    let users = await request.get(baseEndpoint, {qs});
                    expect(users).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });

        });

        describe("[SUCCESSFUL]", () => {
            it("should allow an admin user to search for users without any query", async () => {
                let request = await getHttpClientFromUser(admin);
                let users = await request.get(`${baseEndpoint}`);
                expect(users).to.have.length(3);
            });

            it("should allow an admin user to search for active & inactive users without any query", async () => {
                let request = await getHttpClientFromUser(admin);
                let qs = {
                    active: "both"
                };
                let users = await request.get(`${baseEndpoint}`, {qs});
                expect(users).to.have.length(4);
            });

            it("should allow an admin user to search for users by name", async () => {
                let request = await getHttpClientFromUser(admin);
                let qs = {
                    q: "admin"
                };
                let users = await request.get(`${baseEndpoint}`, {qs});
                expect(users).to.have.length(1);
            });

            it("should allow an admin user to search users by a partial name", async () => {
                let request = await getHttpClientFromUser(admin);
                let qs = {
                    q: "rB"
                };
                let users = await request.get(`${baseEndpoint}`, {qs});
                expect(users).to.have.length(1);
            });

            it("should ignore deleted users by default", async () => {
                let request = await getHttpClientFromUser(admin);
                let qs = {
                    q: "erC"
                };
                let users = await request.get(`${baseEndpoint}`, {qs});
                expect(users).to.have.length(0);
            });

            it("should allow an admin to search for deleted users", async () => {
                let request = await getHttpClientFromUser(admin);
                let qs = {
                    q: "erC",
                    active: false
                };
                let users = await request.get(`${baseEndpoint}`, {qs});
                expect(users).to.have.length(1);
            });
        });

        after(clearAllUsers);

    });

    describe("[SET IMAGE]", () => {
        let user, admin;

        before(clearAllUsers);

        before(async () => {
            user = await createUser();
            admin = await createUser(true);
        });

        describe("[UNSUCCESSFUL]", () => {
            it("should not let an unauthenticated user set a profile picture", async () => {
                let formData = {
                    image: fs.createReadStream(imagesPaths.users.correct)
                };
                try {
                    let updatedUser = await request.post(`${baseEndpoint}/${user._id}/image`, {formData});
                    expect(updatedUser).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not let an admin upload a image larger than allowed", async () => {
                let request = await getHttpClientFromUser(admin);
                let formData = {
                    image: fs.createReadStream(imagesPaths.users.large)
                };
                try {
                    let updatedUser = await request.post(`${baseEndpoint}/${user._id}/image`, {formData});
                    expect(updatedUser).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(400);
                }
            });

            it("should not let an admin upload a image in another field", async () => {
                let request = await getHttpClientFromUser(admin);
                let formData = {
                    another: fs.createReadStream(imagesPaths.users.correct)
                };
                try {
                    let updatedUser = await request.post(`${baseEndpoint}/${user._id}/image`, {formData});
                    expect(updatedUser).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(400);
                }
            });

            it("should not let an admin upload a file with the wrong mime type", async () => {
                let request = await getHttpClientFromUser(admin);
                let formData = {
                    image: fs.createReadStream(__dirname + "/../user.controller.js")
                };
                try {
                    let updatedUser = await request.post(`${baseEndpoint}/${user._id}/image`, {formData});
                    expect(updatedUser).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(400);
                }
            });
        });

        describe("[SUCCESSFUL]", () => {
            it("should let a user update their profile picture", async () => {
                let request = await getHttpClientFromUser(admin);
                let formData = {
                    image: fs.createReadStream(imagesPaths.users.correct)
                };
                let updatedUser = await request.post(`${baseEndpoint}/${user._id}/image`, {formData});
                expect(updatedUser.media.profilePhoto).not.to.be.empty;
            });
        });

    });

});