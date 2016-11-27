import {
    clearAllUsers, createUsers, clearAllForgotPassword, createUser,
    getHttpClientFromUser
} from '../../shared/tests/test.utils';

let app = require('../../../index');

/** External dependencies */
import * as requestPromise from 'request-promise';

import {expect} from 'chai';

import config from '../../../configs/config';

import {ForgotPassword} from '../forgot-password-request.model';
import userService from '../user.service';

const baseEndpoint = `${config.test.url}/api/users/forgot-password`;

let request = requestPromise.defaults({json: true});

describe('[API] [Users] [Forgot Password]', () => {
    let userA, userB, deletedUser, admin;

    before(clearAllUsers);
    before(clearAllForgotPassword);

    before(async() => {
        let users = await createUsers(3, true);
        admin = users[0];
        userA = users[1];
        userB = users[2];
        deletedUser = await createUser(false, {deletedAt: new Date()});
    });

    describe('[Create]', () => {


        describe('[Successful]', () => {

            beforeEach(clearAllForgotPassword);

            it('should return success even if an invalid email is used', async() => {
                let body = {
                    email: 'asd'
                };
                await request.post(baseEndpoint, {body});
                let forgotPasswords = await ForgotPassword.find();
                expect(forgotPasswords).to.have.length(0);
            });

            it('should return success even if an inexistent email is used', async() => {
                let body = {
                    email: 'asd@asdasd.com'
                };
                await request.post(baseEndpoint, {body});
                let forgotPasswords = await ForgotPassword.find();
                expect(forgotPasswords).to.have.length(0);
            });

            it('should return success even if a deleted user email is used', async() => {
                let body = {
                    email: deletedUser.email
                };
                await request.post(baseEndpoint, {body});
                let forgotPasswords = await ForgotPassword.find();
                expect(forgotPasswords).to.have.length(0);
            });

            it('should return success when an existent email is used and should create a forgot password request', async() => {
                let body = {
                    email: userA.email
                };
                await request.post(baseEndpoint, {body});
                let forgotPasswords: any = await ForgotPassword.find();
                expect(forgotPasswords).to.have.length(1);
                expect(forgotPasswords[0].status).to.eql('valid');
            });
        });

    });

    describe('[Use]', () => {

        let validCode, forgotPass;
        let validCodeForDeletedUser;

        beforeEach(clearAllForgotPassword);

        beforeEach(async() => {
            forgotPass = await userService.createForgotPassword(userA.email);
            let forgotPassDeleted = await userService.createForgotPassword(deletedUser.email);
            validCode = forgotPass.code;
            validCodeForDeletedUser = forgotPassDeleted.code;
            console.log(validCodeForDeletedUser);
        });

        describe('[Unsuccessful]', () => {
            it('should not let a user use their code twice', async() => {
                forgotPass.status = 'used';
                let oldPassword = 'Test#1234';
                let newPassword = 'asd123';
                await forgotPass.save();
                let body = {
                    code: validCode,
                    password: newPassword
                };
                try {
                    await request.post(`${baseEndpoint}/use`, {body});
                    await userService.checkEmailAndPassword(userA.email, newPassword);
                } catch(err) {
                    expect(err.statusCode).to.eql(400);
                }
                //make sure password wasn't changed
                await userService.checkEmailAndPassword(userA.email, oldPassword);
            });

            it('should let a user use their code to change their password', async() => {
                let newPassword = 'asd123';
                let body = {
                    code: validCodeForDeletedUser,
                    password: newPassword
                };

                try {
                    await request.post(`${baseEndpoint}/use`, {body});
                } catch (e) {
                    expect(e.statusCode).to.eql(404);
                }
                try {
                    await userService.checkEmailAndPassword(deletedUser.email, newPassword);
                } catch (e) {
                    expect(e.error).to.eql('UNAUTHORIZED');
                }
                let forgotPasswords: any = await ForgotPassword.findOne({code: validCodeForDeletedUser});
                expect(forgotPasswords.status).to.eql('valid');
            });
        });

        describe('[Successful]', () => {

            it('should let a user use their code to change their password', async() => {
                let newPassword = 'asd123';
                let body = {
                    code: validCode,
                    password: newPassword
                };

                await request.post(`${baseEndpoint}/use`, {body});
                await userService.checkEmailAndPassword(userA.email, newPassword);
                let forgotPasswords: any = await ForgotPassword.findOne({code: validCode});
                expect(forgotPasswords.status).to.eql('used');
            });

        });

    });

    describe('[READ]', () => {

        let validCode;

        before(async() => {
            let forgotPass = await userService.createForgotPassword(userA.email);
            validCode = forgotPass.code;
        });

        describe('[Successful]', () => {

            it('should let a user use their code to change their password', async() => {
                let path = `${baseEndpoint}/${validCode}`;
                let forgotPassReq = await request.get(path);
                expect(forgotPassReq.code).to.eql(validCode);
            });

        });

    });


    describe('[Update]', () => {

        let validCode, forgotPass;

        beforeEach(clearAllForgotPassword);

        beforeEach(async() => {
            forgotPass = await userService.createForgotPassword(userA.email);
            validCode = forgotPass.code;
        });

        describe('[Unsuccessful]', () => {

            it('should not let an unauthenticated user update a forgot password request', async() => {
                let body = {
                    validUntil: new Date()
                };
                try {
                    await request.put(`${baseEndpoint}/${validCode}`, {body});
                } catch(err) {
                    expect(err.statusCode).to.eql(401);
                }
            });

            it('should not let an authenticated user update a forgot password request', async() => {
                let request = await getHttpClientFromUser(userA);
                let body = {
                    validUntil: new Date()
                };
                try {
                    await request.put(`${baseEndpoint}/${validCode}`, {body});
                } catch(err) {
                    expect(err.statusCode).to.eql(403);
                }
            });
        });

        describe('[Successful]', () => {

            it('should let an admin update a forgot password request', async() => {
                let request = await getHttpClientFromUser(admin);
                let newDate = new Date();
                let body = {
                    validUntil: newDate
                };
                let forgotPassword = await request.put(`${baseEndpoint}/${validCode}`, {body});
                expect(forgotPassword.validUntil).to.eql(newDate.toJSON());
            });
        });
    })
});