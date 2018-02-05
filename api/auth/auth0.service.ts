import config from "../../configs/config";
import * as request from "request-promise";
import { Logger } from "../shared/logger.service";

const baseManagementApi = `${config.auth0.url}/api/v2`;
const tokenUrl = `${config.auth0.url}/oauth/token`;

const managementApiOptions = {
    headers: {
        Authorization: `Bearer ${config.auth0.token}`
    },
    json: true,
    method: "POST",
    body: null
};

const tokenOptions = {
    json: true,
    method: "POST",
    body: {
        "grant_type": "password",
        "username": "",
        "password": "",
        "scope": "openid name email nickname",
        "client_id": "wXGfYGGXp5jNZOacT9z4QQhvHJa1Sgq4",
        "client_secret": "6KKzhjaW0d7fJoJfC-LI_WGhbeg5q075TK1erEIdo-AlFG6woRmYh3IwdEWQtWh5"
    }
};

class Auth0Service {
    async login(user) {
        let options = Object.assign({}, tokenOptions);
        options.body.username = user.email;
        options.body.password = user.password;

        return await request(tokenUrl, tokenOptions);
    }

    async register(userData) {
        let userToCreate = {
            "email": userData.email,
            "password": userData.password,
            "connection": "Username-Password-Authentication",
            "verify_email": false
        };

        let options = Object.assign({}, managementApiOptions);
        options.body = userToCreate;

        try {
            return await request(`${baseManagementApi}/users`, options);
        }
        catch (ex) {
            Logger.log("error", "[Auth0Service] [Register] error registering user", {user: userData, ex});
            return null;
        }
    }
}

let singleton = new Auth0Service();
export {singleton as Auth0Service};