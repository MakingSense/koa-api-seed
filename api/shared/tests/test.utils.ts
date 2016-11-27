import * as _ from 'lodash';
import * as request from 'request-promise';
import * as mongoose from 'mongoose';

import {getRandomUser} from './fixtures/user.fixture';

import userService from '../../users/user.service';
import authService from '../../auth/auth.service';
import {ForgotPassword} from "../../users/forgot-password-request.model";

let User = mongoose.model('User');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let createUser = async(isAdmin = false, props = {}) => {
    let userProps = Object.assign({}, props, {role: isAdmin? 'admin' : 'user'});
    let userData = getRandomUser(userProps);
    return userService.create(userData);
};

let createUsers = async (number, createAdmin = false) => {
    let users = [];
    if (createAdmin) {
        number = number - 1;
        users.push(await createUser(true));
    }
    _.times(number, (n) => {users.push(createUser())});
    return await Promise.all(users);
};

let clearAllUsers = async() => await User.remove({});
let clearAllForgotPassword = async() => await ForgotPassword.remove({});

let getHttpClientFromUser = async(user) => {
    let token = await authService.signToken(user);
    return request.defaults({
        headers: {
            Authorization: `Bearer ${token}`
        },
        json: true
    });
};


export {getRandomInt, getRandomUser, createUser, createUsers, clearAllUsers, clearAllForgotPassword, getHttpClientFromUser};