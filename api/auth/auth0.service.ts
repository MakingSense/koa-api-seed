import config from "../../configs/config";

import * as request from "request-promise";

const baseEndpoint = `${config.auth0.url}/api/v2`;
import {Logger} from "../shared/logger.service";
// let request = request.defaults({json: true});


class Auth0Service {

    addAutorizationToHttpClient (body) {
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
        console.log(user);
        console.log(`${baseEndpoint}/users`);
        // let client = await this.addAutorizationToHttpClient(user);


        request(this.addAutorizationToHttpClient(user))
            .then(function (htmlString) {
                // Process html...
                console.log(htmlString);
            })
            .catch(function (err) {
                console.log(err);
            });

        //let auth0User = await client.post(`${baseEndpoint}/users`, user);
        // console.log(auth0User);
        // return auth0User;
    }

}

let singleton = new Auth0Service();
export default singleton;