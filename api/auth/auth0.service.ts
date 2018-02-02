import config from "../../configs/config";

import * as request from "request-promise";

const baseEndpoint = `${config.auth0.url}/api/v2`;


class Auth0Service {

    getOptions (body) {
        return {
            headers: {
                Authorization: `Bearer ${config.auth0.token}`
            },
            json: true,
            method: 'POST',
            body: body,
            uri: `${baseEndpoint}/users`
        };
    }

    async register(user) {
        request(`${baseEndpoint}/users`, this.getOptions(user))
            .then(function (htmlString) {
                // Process html...
                console.log(htmlString);
            })
            .catch(function (err) {
                console.log(err);
            });
    }
}

let singleton = new Auth0Service();
export default singleton;