let app = require("../../../index");

import {
    getRandomUser,
    clearAllUsers,
    getHttpClientFromUser,
    createUsers
} from "../../shared/tests/test.utils";


/** External dependencies */
import * as requestPromise from "request-promise";

import {expect} from "chai";

import config from "../../../configs/config";

const baseEndpoint = `${config.test.url}/auth/local`;

let request = requestPromise.defaults({json: true});

describe("[API] [Auth]", () => {

    describe("[Log In]", () => {

        let userA, userB, admin;

        before(clearAllUsers);

        before(async () => {
            let users = await createUsers(3, true);
            admin = users[0];
            userA = users[1];
            userB = users[2];
        });

        describe("[Unsuccessful]", () => {
            it("should not allow a user to log in without credentials", async () => {
                let body = {};
                try {
                    let token = await request.post(baseEndpoint, {body});
                    expect(token).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(400);
                }
            });

            it("should not allow a user to log in without an email", async () => {
                let body = {
                    password: "Test#1234"
                };
                try {
                    let token = await request.post(baseEndpoint, {body});
                    expect(token).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not allow a user to log in without a password", async () => {
                let body = {
                    email: userA.email,
                };
                try {
                    let token = await request.post(baseEndpoint, {body});
                    expect(token).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });
            it("should not allow a user to log in with the wrong password", async () => {
                let body = {
                    email: userA.email,
                    password: "Test#1235"
                };
                try {
                    let token = await request.post(baseEndpoint, {body});
                    expect(token).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(401);
                }
            });

            it("should not allow a regular user to log in as any user", async () => {
                let request = await getHttpClientFromUser(userB);
                let body = {
                    user: userA._id
                };
                try {
                    let res = await request.post(`${baseEndpoint}/as`, {body});
                    expect(res.token).not.to.exist;
                } catch (e) {
                    expect(e.statusCode).to.eql(403);
                }
            });
        });

        describe("[Successful]", () => {
            it("should allow a user to log in with correct credentials ", async () => {
                let body = {
                    email: userA.email,
                    password: "Test#1234"
                };
                let res = await request.post(baseEndpoint, {body});
                expect(res.token).to.exist;
            });

            it("should allow an admin to log in as any user by their id", async () => {
                let request = await getHttpClientFromUser(admin);
                let body = {
                    user: userA._id
                };
                let res = await request.post(`${baseEndpoint}/as`, {body});
                expect(res.token).to.exist;
            });

            it("should allow an admin to log in as any user by their email", async () => {
                let request = await getHttpClientFromUser(admin);
                let body = {
                    user: userA.email
                };
                let res = await request.post(`${baseEndpoint}/as`, {body});
                expect(res.token).to.exist;
            });
        });
        after(clearAllUsers);
    });
});